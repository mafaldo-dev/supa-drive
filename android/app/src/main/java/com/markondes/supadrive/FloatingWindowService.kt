package com.markondes.supadrive

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class FloatingWindowService : Service() {
    private lateinit var windowManager: WindowManager
    private lateinit var floatingView: View
    private lateinit var timerText: TextView
    private var isViewAdded = false
    private var initialX = 100
    private var initialY = 100

    companion object {
        private var instance: FloatingWindowService? = null
        private var updateListener: ((String) -> Unit)? = null
        
        fun start(context: Context) {
            val intent = Intent(context, FloatingWindowService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
        
        fun stop(context: Context) {
            val intent = Intent(context, FloatingWindowService::class.java)
            context.stopService(intent)
            instance = null
        }
        
        fun updateTime(time: String) {
            instance?.updateTimerText(time)
        }
        
        fun setUpdateListener(listener: ((String) -> Unit)?) {
            updateListener = listener
        }
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
        createFloatingView()
        startForeground(1002, createNotification())
    }

    private fun createFloatingView() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        
        floatingView = LayoutInflater.from(this).inflate(R.layout.floating_window, null)
        timerText = floatingView.findViewById(R.id.timer_text)
        
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        
        params.gravity = Gravity.TOP or Gravity.START
        params.x = initialX
        params.y = initialY
        
        windowManager.addView(floatingView, params)
        isViewAdded = true
        
        setupDragListener(params)
        setupClickToReturn()
    }
    
    private fun setupDragListener(params: WindowManager.LayoutParams) {
        var initialTouchX = 0
        var initialTouchY = 0
        var initialParamsX = 0
        var initialParamsY = 0
        
        floatingView.setOnTouchListener { _, event ->
            when (event.action) {
                android.view.MotionEvent.ACTION_DOWN -> {
                    initialTouchX = event.rawX.toInt()
                    initialTouchY = event.rawY.toInt()
                    initialParamsX = params.x
                    initialParamsY = params.y
                    true
                }
                android.view.MotionEvent.ACTION_MOVE -> {
                    val deltaX = event.rawX.toInt() - initialTouchX
                    val deltaY = event.rawY.toInt() - initialTouchY
                    params.x = initialParamsX + deltaX
                    params.y = initialParamsY + deltaY
                    windowManager.updateViewLayout(floatingView, params)
                    true
                }
                android.view.MotionEvent.ACTION_UP -> {
                    initialX = params.x
                    initialY = params.y
                    true
                }
                else -> false
            }
        }
    }
    
    private fun setupClickToReturn() {
        floatingView.setOnClickListener {
            // Abre o app quando clicar no floating
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
    }
    
    fun updateTimerText(time: String) {
        timerText.text = time
        updateListener?.invoke(time)
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                "floating_channel",
                "Ponto Flutuante",
                android.app.NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(android.app.NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): android.app.Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = android.app.PendingIntent.getActivity(
            this, 0, intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        
        return androidx.core.app.NotificationCompat.Builder(this, "floating_channel")
            .setContentTitle("Supa Driver")
            .setContentText("Cronômetro rodando em segundo plano")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }
    
    override fun onDestroy() {
        if (isViewAdded) {
            windowManager.removeView(floatingView)
            isViewAdded = false
        }
        instance = null
        super.onDestroy()
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
}