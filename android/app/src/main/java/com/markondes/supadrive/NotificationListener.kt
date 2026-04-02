package com.markondes.supadrive

import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.regex.Pattern

class NotificationListener : NotificationListenerService() {

    companion object {
        var reactContext: ReactApplicationContext? = null
        private const val TAG = "NotificationListener"
        
        // Apps que queremos monitorar
        val TARGET_APPS = mapOf(
            "com.ubercab" to "Uber",
            "com.ubercab.driver" to "Uber Driver",
            "com.ninegag.android" to "99",
            "com.ninegag.android.driver" to "99 Driver",
            "com.ifood" to "iFood",
            "com.ifood.delivery" to "iFood Entregador",
            "br.com.zazup.driver" to "Zazup",
            "com.indriver" to "inDriver",
            "com.indriver.driver" to "inDriver Driver"
        )
        
        // Padrões para extrair valores
        val PRICE_PATTERN = Pattern.compile("R\\$\\s*(\\d+[.,]\\d{2})")
        val DISTANCE_PATTERN = Pattern.compile("(\\d+[.,]\\d+)\\s*km", Pattern.CASE_INSENSITIVE)
        val DESTINATION_PATTERN = Pattern.compile("(?:para|destino)\\s+([A-Za-zÀ-ÿ\\s]+)", Pattern.CASE_INSENSITIVE)
        val TIME_PATTERN = Pattern.compile("(\\d+)\\s*min", Pattern.CASE_INSENSITIVE)
        val RATING_PATTERN = Pattern.compile("avaliação\\s*(\\d+[,.]\\d+)|(\\d+[,.]\\d+)\\s*estrelas", Pattern.CASE_INSENSITIVE)
        
        fun sendEvent(eventName: String, data: Bundle) {
            val params = Arguments.fromBundle(data)
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
            Log.d(TAG, "Evento enviado: $eventName")
        }
    }
    
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn?.let { notification ->
            val packageName = notification.packageName
            
            // Verifica se é um app que queremos monitorar
            if (TARGET_APPS.containsKey(packageName)) {
                val extras = notification.notification.extras
                
                val title = extras.getCharSequence(android.app.Notification.EXTRA_TITLE)?.toString() ?: ""
                val text = extras.getCharSequence(android.app.Notification.EXTRA_TEXT)?.toString() ?: ""
                val bigText = extras.getCharSequence(android.app.Notification.EXTRA_BIG_TEXT)?.toString() ?: ""
                val subText = extras.getCharSequence(android.app.Notification.EXTRA_SUB_TEXT)?.toString() ?: ""
                val infoText = extras.getCharSequence(android.app.Notification.EXTRA_INFO_TEXT)?.toString() ?: ""
                
                val fullText = "$title $text $bigText $subText $infoText"
                
                Log.d(TAG, "Notificação detectada: $packageName")
                Log.d(TAG, "Conteúdo: $fullText")
                
                // Extrai os dados
                val price = extractPrice(fullText)
                val distance = extractDistance(fullText)
                val destination = extractDestination(fullText)
                val time = extractTime(fullText)
                val rating = extractRating(fullText)
                val appName = TARGET_APPS[packageName] ?: packageName
                
                // Verifica se encontrou dados relevantes
                if (price != null || distance != null) {
                    val data = Bundle().apply {
                        putString("app", appName)
                        putString("packageName", packageName)
                        putString("price", price)
                        putString("distance", distance)
                        putString("destination", destination)
                        putString("time", time)
                        putString("rating", rating)
                        putString("title", title)
                        putString("text", fullText)
                        putLong("timestamp", System.currentTimeMillis())
                    }
                    sendEvent("newRide", data)
                } else {
                    Log.d(TAG, "Nenhum dado de corrida encontrado na notificação")
                }
            }
        }
    }
    
    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // Opcional: notificar quando notificação for removida
        sbn?.let {
            val packageName = it.packageName
            if (TARGET_APPS.containsKey(packageName)) {
                val data = Bundle().apply {
                    putString("app", TARGET_APPS[packageName])
                    putString("packageName", packageName)
                    putLong("timestamp", System.currentTimeMillis())
                }
                sendEvent("notificationRemoved", data)
            }
        }
    }
    
    private fun extractPrice(text: String): String? {
        val matcher = PRICE_PATTERN.matcher(text)
        return if (matcher.find()) {
            val price = matcher.group(1)
            Log.d(TAG, "Preço encontrado: R$ $price")
            price
        } else null
    }
    
    private fun extractDistance(text: String): String? {
        val matcher = DISTANCE_PATTERN.matcher(text)
        return if (matcher.find()) {
            val distance = matcher.group(1)
            Log.d(TAG, "Distância encontrada: $distance km")
            distance
        } else null
    }
    
    private fun extractDestination(text: String): String? {
        val matcher = DESTINATION_PATTERN.matcher(text)
        return if (matcher.find()) {
            val destination = matcher.group(1).trim()
            Log.d(TAG, "Destino encontrado: $destination")
            destination
        } else null
    }
    
    private fun extractTime(text: String): String? {
        val matcher = TIME_PATTERN.matcher(text)
        return if (matcher.find()) {
            val time = matcher.group(1)
            Log.d(TAG, "Tempo encontrado: $time min")
            time
        } else null
    }
    
    private fun extractRating(text: String): String? {
        val matcher = RATING_PATTERN.matcher(text)
        return if (matcher.find()) {
            val rating = matcher.group(1) ?: matcher.group(2)
            Log.d(TAG, "Avaliação encontrada: $rating")
            rating
        } else null
    }
    
    override fun onInterrupt() {
        Log.d(TAG, "Serviço interrompido")
    }
}