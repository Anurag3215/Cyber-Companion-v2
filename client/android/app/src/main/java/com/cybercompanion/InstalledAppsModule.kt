package com.cybercompanion

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class InstalledAppsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InstalledAppsModule"

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val packages: List<PackageInfo> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getInstalledPackages(PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong()))
            } else {
                @Suppress("DEPRECATION")
                pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
            }

            val appList = Arguments.createArray()

            val dangerousMap = mapOf(
                "android.permission.READ_SMS" to "SMS & OTPs",
                "android.permission.RECEIVE_SMS" to "Intercept SMS",
                "android.permission.SEND_SMS" to "Send SMS",
                "android.permission.ACCESS_FINE_LOCATION" to "Precise GPS",
                "android.permission.ACCESS_BACKGROUND_LOCATION" to "Background Location",
                "android.permission.CAMERA" to "Camera Access",
                "android.permission.RECORD_AUDIO" to "Microphone",
                "android.permission.READ_CONTACTS" to "Read Contacts",
                "android.permission.WRITE_CONTACTS" to "Modify Contacts",
                "android.permission.SYSTEM_ALERT_WINDOW" to "Screen Overlay",
                "android.permission.REQUEST_INSTALL_PACKAGES" to "Install Unknown Apps",
                "android.permission.READ_CALL_LOG" to "Call History",
                "android.permission.READ_PHONE_STATE" to "Phone State / IMEI"
            )

            for (pkg in packages) {
                val appInfo = pkg.applicationInfo ?: continue
                val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0

                val appName = pm.getApplicationLabel(appInfo).toString()
                val packageName = pkg.packageName

                // Skip self
                if (packageName == reactContext.packageName) continue

                val requestedPerms = pkg.requestedPermissions ?: emptyArray()
                val requestedFlags = pkg.requestedPermissionsFlags ?: IntArray(0)

                val heldDangerous = Arguments.createArray()
                var riskPoints = 0

                for (i in requestedPerms.indices) {
                    val perm = requestedPerms[i]
                    val isGranted = if (i < requestedFlags.size) {
                        (requestedFlags[i] and PackageInfo.REQUESTED_PERMISSION_GRANTED) != 0
                    } else {
                        false
                    }

                    if (isGranted && dangerousMap.containsKey(perm)) {
                        val permObj = Arguments.createMap()
                        permObj.putString("permission", perm)
                        permObj.putString("friendlyName", dangerousMap[perm])
                        heldDangerous.pushMap(permObj)

                        when (perm) {
                            "android.permission.SYSTEM_ALERT_WINDOW",
                            "android.permission.REQUEST_INSTALL_PACKAGES" -> riskPoints += 30
                            "android.permission.READ_SMS",
                            "android.permission.RECEIVE_SMS" -> riskPoints += 25
                            "android.permission.ACCESS_BACKGROUND_LOCATION" -> riskPoints += 20
                            "android.permission.ACCESS_FINE_LOCATION",
                            "android.permission.RECORD_AUDIO",
                            "android.permission.CAMERA" -> riskPoints += 15
                            else -> riskPoints += 10
                        }
                    }
                }

                val appMap = Arguments.createMap()
                appMap.putString("appName", appName)
                appMap.putString("packageName", packageName)
                appMap.putString("versionName", pkg.versionName ?: "1.0.0")
                appMap.putBoolean("isSystemApp", isSystem)
                appMap.putArray("dangerousPermissions", heldDangerous)

                val riskScore = riskPoints.coerceIn(0, 100)
                appMap.putInt("riskScore", riskScore)

                val riskLevel = when {
                    riskScore >= 60 -> "CRITICAL"
                    riskScore >= 35 -> "HIGH"
                    riskScore >= 15 -> "MEDIUM"
                    else -> "LOW"
                }
                appMap.putString("riskLevel", riskLevel)

                appList.pushMap(appMap)
            }

            promise.resolve(appList)
        } catch (e: Exception) {
            promise.reject("INSTALLED_APPS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openAppSettings(packageName: String, promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", packageName, null)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("APP_SETTINGS_ERROR", e.message, e)
        }
    }
}
