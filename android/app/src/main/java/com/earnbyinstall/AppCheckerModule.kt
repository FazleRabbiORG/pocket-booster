package com.earnbyinstall


import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AppCheckerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppChecker"
    }

    private fun isInstalled(packageName: String, packageManager: PackageManager): Boolean {
        return try {
            packageManager.getPackageInfo(packageName,0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    @ReactMethod
    fun isAppInstalled(packageName: String, promise: Promise) {
        val packageManager: PackageManager = reactApplicationContext.packageManager
        try {
            val result = isInstalled(packageName, packageManager)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}