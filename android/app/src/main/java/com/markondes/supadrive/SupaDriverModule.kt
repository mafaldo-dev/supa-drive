package com.markondes.supadrive

import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SupaDriverModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext.applicationContext
    private var ttsService: SupaDriverTTSService? = null

    override fun getName(): String = "SupaDriverModule"

    @ReactMethod
    fun sendLocalNotification(title: String, body: String, promise: Promise) {
        try {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channelId = "supa_driver_channel"
            val notificationId = System.currentTimeMillis().toInt()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = android.app.NotificationChannel(
                    channelId,
                    "Supa Driver",
                    NotificationManager.IMPORTANCE_HIGH
                )
                notificationManager.createNotificationChannel(channel)
            }

            val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val pendingIntent = android.app.PendingIntent.getActivity(
                context, 0, intent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
            )

            val notification = NotificationCompat.Builder(context, channelId)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()

            notificationManager.notify(notificationId, notification)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun sendJourneyEndPush(durationSeconds: Int, earnings: Double, ridesCount: Int) {
        val hours = durationSeconds / 3600
        val minutes = (durationSeconds % 3600) / 60
        val timeStr = if (hours > 0) "${hours}h${minutes}min" else "${minutes}min"
        val earningsStr = String.format("%.2f", earnings).replace(".", ",")
        val body = "Você dirigiu $timeStr, realizou $ridesCount corridas e ganhou R$ $earningsStr hoje!"
        
        sendLocalNotification("Jornada Encerrada! 🎉", body, object : Promise {
            override fun resolve(value: Any?) {}
            override fun reject(code: String?, message: String?, throwable: Throwable?, userInfo: WritableMap?) {}
            override fun reject(code: String, message: String?) = reject(code, message, null, null)
            override fun reject(code: String, throwable: Throwable?) = reject(code, throwable?.message, throwable, null)
            override fun reject(code: String, message: String?, throwable: Throwable?) = reject(code, message, throwable, null)
            override fun reject(throwable: Throwable) = reject(null, throwable.message, throwable, null)
            override fun reject(throwable: Throwable, userInfo: WritableMap) = reject(null, throwable.message, throwable, userInfo)
            override fun reject(code: String, userInfo: WritableMap) = reject(code, null, null, userInfo)
            override fun reject(code: String, throwable: Throwable?, userInfo: WritableMap) = reject(code, throwable?.message, throwable, userInfo)
            override fun reject(code: String, message: String?, userInfo: WritableMap) = reject(code, message, null, userInfo)
            override fun reject(message: String) = reject(null, message, null, null)
        })
        
        sendEvent("journeyEnd", mapOf(
            "durationSeconds" to durationSeconds,
            "earnings" to earnings,
            "ridesCount" to ridesCount
        ))
    }

    @ReactMethod
    fun speak(text: String) {
        if (ttsService == null) {
            ttsService = SupaDriverTTSService(context)
            Handler(Looper.getMainLooper()).postDelayed({
                ttsService?.speak(text)
            }, 500)
        } else {
            ttsService?.speak(text)
        }
    }

    @ReactMethod
    fun speakJourneyEnd(durationSeconds: Int, earnings: Double, ridesCount: Int) {
        if (ttsService == null) {
            ttsService = SupaDriverTTSService(context)
            Handler(Looper.getMainLooper()).postDelayed({
                ttsService?.speakJourneyEnd(durationSeconds, earnings, ridesCount)
            }, 500)
        } else {
            ttsService?.speakJourneyEnd(durationSeconds, earnings, ridesCount)
        }
    }

    @ReactMethod
    fun sendFourHourAlert() {
        sendLocalNotification("⏰ 4 Horas ao Volante!", 
            "Você já está dirigindo há 4 horas. Hora de fazer uma pausa!", 
            object : Promise {
                override fun resolve(value: Any?) {}
                override fun reject(code: String?, message: String?, throwable: Throwable?, userInfo: WritableMap?) {}
                override fun reject(code: String, message: String?) = reject(code, message, null, null)
                override fun reject(code: String, throwable: Throwable?) = reject(code, throwable?.message, throwable, null)
                override fun reject(code: String, message: String?, throwable: Throwable?) = reject(code, message, throwable, null)
                override fun reject(throwable: Throwable) = reject(null, throwable.message, throwable, null)
                override fun reject(throwable: Throwable, userInfo: WritableMap) = reject(null, throwable.message, throwable, userInfo)
                override fun reject(code: String, userInfo: WritableMap) = reject(code, null, null, userInfo)
                override fun reject(code: String, throwable: Throwable?, userInfo: WritableMap) = reject(code, throwable?.message, throwable, userInfo)
                override fun reject(code: String, message: String?, userInfo: WritableMap) = reject(code, message, null, userInfo)
                override fun reject(message: String) = reject(null, message, null, null)
            })
    }

    @ReactMethod
    fun cancelAllNotifications() {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancelAll()
    }

    private fun sendEvent(eventName: String, params: Any?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            // Ignore
        }
    }
}

@ReactMethod
fun sendLocalNotification(title: String, body: String, promise: Promise) {
    try {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "supa_driver_channel"
        val notificationId = System.currentTimeMillis().toInt()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                channelId,
                "Supa Driver",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val pendingIntent = android.app.PendingIntent.getActivity(
            context, 0, intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(notificationId, notification)
        promise.resolve(true)
    } catch (e: Exception) {
        promise.reject("NOTIFICATION_ERROR", e.message, e)
    }
}

@ReactMethod
fun isAccessibilityEnabled(promise: Promise) {
    try {
        val enabled = android.provider.Settings.Secure.getInt(
            context.contentResolver,
            android.provider.Settings.Secure.ACCESSIBILITY_ENABLED,
            0
        ) == 1
        promise.resolve(enabled)
    } catch (e: Exception) {
        promise.reject("ACCESSIBILITY_ERROR", e.message, e)
    }
}

@ReactMethod
fun openAccessibilitySettings() {
    val intent = Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
}
