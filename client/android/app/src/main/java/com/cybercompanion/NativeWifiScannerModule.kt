package com.cybercompanion

import android.content.Context
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import com.facebook.react.bridge.*

class NativeWifiScannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NativeWifiScannerModule"

    @ReactMethod
    fun getScanResults(promise: Promise) {
        try {
            val wifiManager = reactContext.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            if (wifiManager == null) {
                promise.reject("WIFI_ERROR", "WifiManager service is not available on this device.")
                return
            }

            @Suppress("DEPRECATION")
            try {
                wifiManager.startScan()
            } catch (ignored: Exception) {}

            @Suppress("DEPRECATION")
            val scanResults: List<ScanResult> = wifiManager.scanResults ?: emptyList()
            val resultArray = Arguments.createArray()

            for (res in scanResults) {
                val ssid = res.SSID ?: ""
                if (ssid.isEmpty()) continue

                val map = Arguments.createMap()
                map.putString("ssid", ssid)
                map.putString("bssid", res.BSSID ?: "00:00:00:00:00:00")
                map.putString("capabilities", res.capabilities ?: "")
                map.putInt("level", res.level)
                map.putInt("frequency", res.frequency)

                val caps = (res.capabilities ?: "").uppercase()
                val secType = when {
                    caps.contains("WPA3") || caps.contains("SAE") -> "WPA3"
                    caps.contains("WPA2") -> "WPA2"
                    caps.contains("WPA") -> "WPA"
                    caps.contains("WEP") -> "WEP"
                    else -> "OPEN"
                }
                map.putString("securityType", secType)

                resultArray.pushMap(map)
            }

            promise.resolve(resultArray)
        } catch (e: Exception) {
            promise.reject("WIFI_SCAN_ERROR", e.message, e)
        }
    }
}
