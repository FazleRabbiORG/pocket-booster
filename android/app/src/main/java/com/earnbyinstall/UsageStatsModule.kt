package com.earnbyinstall

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.os.Process
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import java.util.*
import java.text.SimpleDateFormat

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    // Check if usage access is granted
    private fun isUsageAccessGranted(context: Context): Boolean {
        val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOpsManager.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    // Open usage access settings
    private fun openUsageAccessSettings(context: Context) {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    // Get today's usage stats for a specific app
    private fun getTodayUsageStats(context: Context, packageName: String): UsageStats? {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val usageStatsList = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )
        return usageStatsList.find { it.packageName == packageName }
    }

    // Get usage stats for the upcoming 15 days starting from a specific date
    private fun getUsageStatsForUpcoming15DaysFromDate(context: Context, startDate: Date): List<UsageStats> {
        val calendar = Calendar.getInstance()
        calendar.time = startDate
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        val startTime = calendar.timeInMillis

        calendar.add(Calendar.DAY_OF_YEAR, 15)
        val endTime = calendar.timeInMillis

        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        return usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )
    }

    // Aggregate only the foreground usage time per day
    private fun aggregateForegroundUsageTimePerDay(statsForApp: List<UsageStats>, packageName: String): Map<String, Map<String, Any>> {
        val usageMap = mutableMapOf<String, Map<String, Any>>()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

        for (usageStats in statsForApp) {
            if (usageStats.packageName != packageName) continue  // Ensure we only aggregate for the specified app

            val calendar = Calendar.getInstance().apply {
                timeInMillis = usageStats.firstTimeStamp
            }
            val date = dateFormat.format(calendar.time)  // Format date as "yyyy-MM-dd"

            val timeSpent = usageStats.totalTimeInForeground / 1000  // Convert to seconds
            val used = timeSpent > 0

            // Accumulate time for the same day
            if (usageMap.containsKey(date)) {
                val existing = usageMap[date]!!
                val accumulatedTime = (existing["timeSpentInSeconds"] as Long) + timeSpent
                usageMap[date] = mapOf(
                    "timeSpentInSeconds" to accumulatedTime,
                    "used" to (accumulatedTime > 0)
                )
            } else {
                usageMap[date] = mapOf(
                    "timeSpentInSeconds" to timeSpent,
                    "used" to used
                )
            }
        }

        return usageMap
    }

    // React Native method to open usage access settings for permission
    @ReactMethod
    fun openForPermissionUsage(promise: Promise) {
        val context = reactApplicationContext
        openUsageAccessSettings(context)
        promise.resolve(null)
    }

    // React Native method to check if permission is granted
    @ReactMethod
    fun getIsPermissionGranted(promise: Promise) {
        val context = reactApplicationContext
        val res = isUsageAccessGranted(context)
        promise.resolve(res)
    }

    // Check if usage access is granted and open settings if not
    @ReactMethod
    fun checkUsageAccessAndOpenSettings() {
        val context = reactApplicationContext
        if (!isUsageAccessGranted(context)) {
            openUsageAccessSettings(context)
        }
    }

    // React Native method to get today's usage for a specific app
    @ReactMethod
    fun getTodayAppUsage(packageName: String, promise: Promise) {
        checkUsageAccessAndOpenSettings()
        val context = reactApplicationContext
        val todayUsageStats = getTodayUsageStats(context, packageName)

        val result: WritableMap = Arguments.createMap()

        if (todayUsageStats != null) {
            val totalTimeInForeground = todayUsageStats.totalTimeInForeground / 1000 // Convert to seconds
            val used = totalTimeInForeground > 0

            result.apply {
                putString("date", SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()))
                putDouble("timeSpentInSeconds", totalTimeInForeground.toDouble())
                putBoolean("used", used)
            }
        } else {
            result.apply {
                putString("date", SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()))
                putDouble("timeSpentInSeconds", 0.0)
                putBoolean("used", false)
            }
        }

        promise.resolve(result)
    }

    // React Native method to get usage stats for the upcoming 15 days from a specific date excluding today
    @ReactMethod
    fun getAppUsageForUpcoming15Days(packageName: String, startDate: String, promise: Promise) {
        checkUsageAccessAndOpenSettings()
        val context = reactApplicationContext
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val startDateParsed = dateFormat.parse(startDate) ?: Date()

        // Get upcoming 15 days usage, excluding today
        val calendar = Calendar.getInstance().apply {
            time = startDateParsed
            add(Calendar.DAY_OF_YEAR, 1)  // Start from tomorrow
        }
        val usageStatsList = getUsageStatsForUpcoming15DaysFromDate(context, calendar.time)
        val appUsageStats = aggregateForegroundUsageTimePerDay(usageStatsList, packageName)

        val resultArray: WritableArray = Arguments.createArray()

        // Add usage for the upcoming 15 days excluding today
        for (i in 1..15) {
            val currentDay = Calendar.getInstance().apply {
                time = startDateParsed
                add(Calendar.DAY_OF_YEAR, i)
            }
            val date = dateFormat.format(currentDay.time)

            val usageData = appUsageStats[date] ?: mapOf(
                "timeSpentInSeconds" to 0L,
                "used" to false
            )

            val result: WritableMap = Arguments.createMap().apply {
                putString("date", date)
                putDouble("timeSpentInSeconds", (usageData["timeSpentInSeconds"] as Long).toDouble())
                putBoolean("used", usageData["used"] as Boolean)
            }

            resultArray.pushMap(result)
        }

        promise.resolve(resultArray)
    }
}
