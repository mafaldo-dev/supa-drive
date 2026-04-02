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
            promise.reject("NOTIFICATION_ERROR", e.message)
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
            override fun reject(code: String?, message: String?, cause: Throwable?) {}
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
                override fun reject(code: String?, message: String?, cause: Throwable?) {}
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
