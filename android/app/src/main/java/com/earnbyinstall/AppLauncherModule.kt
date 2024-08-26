package com.earnbyinstall


import android.content.Intent
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AppLauncherModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppLauncherModule"
    }

    @ReactMethod
    fun openApp(packageName: String, promise: Promise) {
        val context = reactApplicationContext
        val packageManager: PackageManager = context.packageManager

        try {
            val launchIntent: Intent? = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)  // Required when starting from a non-activity context
                context.startActivity(launchIntent)
                promise.resolve("App launched successfully")
            } else {
                promise.reject("APP_NOT_FOUND", "App with package name $packageName not found")
            }
        } catch (e: Exception) {
            promise.reject("ERROR_LAUNCHING_APP", "Error launching app with package name $packageName", e)
        }
    }
}