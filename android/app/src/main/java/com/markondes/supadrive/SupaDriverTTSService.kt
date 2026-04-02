package com.markondes.supadrive

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

class SupaDriverTTSService(private val context: Context) {

    private var tts: TextToSpeech? = null
    private var isReady = false

    init {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val result = tts?.setLanguage(Locale("pt", "BR"))
                isReady = result != TextToSpeech.LANG_MISSING_DATA &&
                          result != TextToSpeech.LANG_NOT_SUPPORTED
            }
        }
    }

    fun speak(text: String, onDone: (() -> Unit)? = null) {
        if (!isReady) return
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) { onDone?.invoke() }
            override fun onError(utteranceId: String?) {}
        })
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "SUPA_TTS_${System.currentTimeMillis()}")
    }

    fun speakJourneyEnd(durationSeconds: Int, earnings: Double, ridesCount: Int) {
        val hours = durationSeconds / 3600
        val minutes = (durationSeconds % 3600) / 60
        val timeStr = if (hours > 0) "${hours} horas e ${minutes} minutos" else "${minutes} minutos"
        val earningsStr = String.format("%.2f", earnings).replace(".", ",")
        val message = "Jornada encerrada! Você dirigiu $timeStr, realizou $ridesCount corridas " +
                      "e ganhou R$ $earningsStr hoje. Excelente trabalho!"
        speak(message)
    }

    fun destroy() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isReady = false
    }
}
