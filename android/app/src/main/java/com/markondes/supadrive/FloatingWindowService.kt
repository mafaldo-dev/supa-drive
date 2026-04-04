package com.markondes.supadrive

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
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
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import androidx.core.app.NotificationCompat

class FloatingWindowService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var floatingView: View
    private lateinit var iconImage: ImageView
    private lateinit var timerText: TextView
    private var isViewAdded = false
    private var initialX = 100
    private var initialY = 200
    private var isTimerVisible = false

    companion object {
        private var instance: FloatingWindowService? = null
        private const val CHANNEL_ID = "floating_channel"
        private const val NOTIFICATION_ID = 999

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
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
        createFloatingView()
        startForeground(NOTIFICATION_ID, createNotification())
    }

    private fun createFloatingView() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        // Infla o layout
        floatingView = LayoutInflater.from(this).inflate(R.layout.floating_window, null)
        iconImage = floatingView.findViewById(R.id.icon_image)
        timerText = floatingView.findViewById(R.id.timer_text)

        // Configura o layout params da janela flutuante (apenas o botão, não a tela toda)
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
                MotionEvent.ACTION_DOWN -> {
                    initialTouchX = event.rawX.toInt()
                    initialTouchY = event.rawY.toInt()
                    initialParamsX = params.x
                    initialParamsY = params.y
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val deltaX = event.rawX.toInt() - initialTouchX
                    val deltaY = event.rawY.toInt() - initialTouchY
                    params.x = initialParamsX + deltaX
                    params.y = initialParamsY + deltaY
                    windowManager.updateViewLayout(floatingView, params)
                    true
                }
                MotionEvent.ACTION_UP -> {
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
            
            // Minimiza o floating? Não, só abre o app
        }
    }

    private fun updateTimerText(time: String) {
        // Mostra o timer quando a jornada começar
        if (!isTimerVisible && time != "00:00:00") {
            timerText.visibility = View.VISIBLE
            isTimerVisible = true
        }
        timerText.text = time
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Ponto Flutuante Supa Driver",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): android.app.Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Supa Driver")
            .setContentText("Ponto flutuante ativo")
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
