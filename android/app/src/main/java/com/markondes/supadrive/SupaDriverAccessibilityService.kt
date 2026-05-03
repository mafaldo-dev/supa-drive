package com.markondes.supadrive

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONObject
import java.util.regex.Pattern

class SupaDriverAccessibilityService : AccessibilityService() {

    companion object {
        const val ACTION_RIDE_DETECTED = "com.markondes.supadrive.RIDE_DETECTED"
        val MONITORED_PACKAGES = setOf(
            "com.ubercab.driver", "com.ubercab",
            "com.ninety9.driver", "com.ninety9"
        )
        val PRICE_PATTERN: Pattern = Pattern.compile("""R\$\s*(\d+[.,]\d{2})""")
        val DISTANCE_PATTERN: Pattern = Pattern.compile("""(\d+[.,]\d+)\s*km""")
        val TIME_PATTERN: Pattern = Pattern.compile("""(\d+)\s*min""")
        val RATING_PATTERN: Pattern = Pattern.compile("""(\d+[.,]\d+)\s*★?""")
    }

    override fun onServiceConnected() {
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                         AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            packageNames = MONITORED_PACKAGES.toTypedArray()
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 300
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return
        val packageName = event.packageName?.toString() ?: return
        if (packageName !in MONITORED_PACKAGES) return
        val rootNode = rootInActiveWindow ?: return
        val screenText = extractAllText(rootNode)
        rootNode.recycle()
        if (screenText.isBlank()) return
        val rideData = extractRideData(screenText) ?: return
        val intent = Intent(ACTION_RIDE_DETECTED).apply {
            putExtra("ride_data", rideData.toString())
            putExtra("package_name", packageName)
        }
        sendBroadcast(intent)
    }

    override fun onInterrupt() {}

    private fun extractAllText(node: AccessibilityNodeInfo): String {
        val sb = StringBuilder()
        extractTextRecursive(node, sb)
        return sb.toString()
    }

    private fun extractTextRecursive(node: AccessibilityNodeInfo, sb: StringBuilder) {
        node.text?.let { sb.append(it).append(" ") }
        node.contentDescription?.let { sb.append(it).append(" ") }
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                extractTextRecursive(child, sb)
                child.recycle()
            }
        }
    }

    private fun extractRideData(text: String): JSONObject? {
        val priceMatch = PRICE_PATTERN.matcher(text)
        val price = if (priceMatch.find()) priceMatch.group(1)?.replace(",", ".") ?: return null else return null
        val distanceMatch = DISTANCE_PATTERN.matcher(text)
        val distance = if (distanceMatch.find()) distanceMatch.group(1)?.replace(",", ".") ?: "0" else "0"
        val timeMatch = TIME_PATTERN.matcher(text)
        val time = if (timeMatch.find()) timeMatch.group(1) ?: "0" else "0"
        val ratingMatch = RATING_PATTERN.matcher(text)
        val rating = if (ratingMatch.find()) ratingMatch.group(1)?.replace(",", ".") ?: "5.0" else "5.0"
        val priceVal = price.toDoubleOrNull() ?: return null
        val distVal = distance.toDoubleOrNull() ?: 0.0
        val timeVal = time.toIntOrNull() ?: 0
        val pricePerKm = if (distVal > 0) priceVal / distVal else 0.0
        return JSONObject().apply {
            put("price", priceVal)
            put("distance_km", distVal)
            put("time_min", timeVal)
            put("rating", rating.toDoubleOrNull() ?: 5.0)
            put("price_per_km", String.format("%.2f", pricePerKm).toDouble())
            put("price_per_min", if (timeVal > 0) priceVal / timeVal else 0.0)
            put("raw_text", text.take(500))
        }
    }
}
