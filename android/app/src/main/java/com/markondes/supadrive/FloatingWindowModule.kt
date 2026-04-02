package com.markondes.supadrive

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class FloatingWindowModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    
    private val context = reactContext.applicationContext

    override fun getName(): String = "FloatingWindowModule"

    @ReactMethod
    fun start(promise: Promise) {
        try {
            if (hasOverlayPermission()) {
                FloatingWindowService.start(context)
                promise.resolve(true)
            } else {
                promise.reject("NO_PERMISSION", "Permissão de sobreposição não concedida")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stop() {
        FloatingWindowService.stop(context)
    }

    @ReactMethod
    fun updateTime(time: String) {
        FloatingWindowService.updateTime(time)
    }

    @ReactMethod
    fun checkPermission(promise: Promise) {
        promise.resolve(hasOverlayPermission())
    }

    @ReactMethod
    fun requestPermission() {
        if (!hasOverlayPermission()) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }
    }

    private fun hasOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }
}