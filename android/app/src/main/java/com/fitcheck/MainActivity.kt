package com.fitcheck

import android.os.Bundle
import android.os.SystemClock
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // Must run before super.onCreate so the splash theme hands off to AppTheme.
    val splash = installSplashScreen()

    // Keep the splash up until React Native is ready, so the user never sees a
    // blank window. The timeout guarantees it can't hang (e.g. slow dev bundles).
    val startedAt = SystemClock.uptimeMillis()
    var reactReady = reactHost?.currentReactContext != null
    if (!reactReady) {
      reactHost?.addReactInstanceEventListener(
          object : ReactInstanceEventListener {
            override fun onReactContextInitialized(context: ReactContext) {
              reactReady = true
              reactHost?.removeReactInstanceEventListener(this)
            }
          })
    }
    splash.setKeepOnScreenCondition {
      !reactReady && SystemClock.uptimeMillis() - startedAt < SPLASH_TIMEOUT_MS
    }

    super.onCreate(savedInstanceState)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "FitCheck"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  private companion object {
    const val SPLASH_TIMEOUT_MS = 5_000L
  }
}
