package com.markondes.supadrive

import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationListenerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    
    init {
        NotificationListener.reactContext = reactContext
    }
    
    override fun getName() = "NotificationListenerModule"
    
    @ReactMethod
    fun startListening() {
        // O serviço já está rodando se configurado no manifest
        // Apenas verificamos se tem permissão
    }
    
    @ReactMethod
    fun stopListening() {
        // Não precisa fazer nada, o serviço continua rodando
        // mas podemos parar de processar se quiser
    }
    
    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            val enabled = isNotificationListenerEnabled()
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("CHECK_PERMISSION_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun requestPermission() {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            // Erro ao abrir configurações
        }
    }
    
    @ReactMethod
    fun openAppSettings() {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
            intent.data = android.net.Uri.parse("package:${reactApplicationContext.packageName}")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            // Erro
        }
    }
    
    private fun isNotificationListenerEnabled(): Boolean {
        val enabledListeners = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            "enabled_notification_listeners"
        )
        return enabledListeners?.contains(reactApplicationContext.packageName) == true
    }
}
