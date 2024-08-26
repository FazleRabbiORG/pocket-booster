package com.earnbyinstall

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise



class OpenChromeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "OpenChrome"
    }

    @ReactMethod
    fun openChrome(url: String, promise: Promise) {
        val context = reactApplicationContext
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        val chromePackage = "com.android.chrome"

        try {
            intent.setPackage(chromePackage)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            promise.resolve("Chrome opened successfully")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}