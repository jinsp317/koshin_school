package com.daleapp;

import android.app.Application;
import android.app.Notification;
import android.content.Intent;
import android.net.Uri;
import android.os.PowerManager;
import android.provider.Settings;
import android.support.multidex.MultiDexApplication;
import android.support.multidex.MultiDex;
import com.facebook.react.ReactApplication;
import com.wayne.apkinstaller.RNApkInstallPackage;
import com.reactlibrarynotificationsounds.NotificationSoundsPackage;
import be.skyzohlabs.rnapk.ReactNativeAPKPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.imagepicker.ImagePickerPackage;

import com.poberwong.launcher.IntentLauncherPackage;
import com.ironsmile.RNWakeful.RNWakefulPackage;
import com.jamesisaac.rnbackgroundtask.BackgroundTaskPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.lmy.smartrefreshlayout.SmartRefreshLayoutPackage;
import com.safaeean.barcodescanner.BarcodeScannerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rnfs.RNFSPackage;
import com.devstepbcn.wifi.AndroidWifiPackage;
import com.pilloxa.backgroundjob.BackgroundJobPackage;
import com.emekalites.react.alarm.notification.ANPackage;
import com.levelasquez.androidopensettings.AndroidOpenSettingsPackage;
import com.github.wuxudong.rncharts.MPAndroidChartPackage; //for chart-wrapper
import com.horcrux.svg.SvgPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import org.reactnative.camera.RNCameraPackage;
import com.baidu.BaiDuOcrPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.github.yamill.orientation.OrientationPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import org.pgsqlite.SQLitePluginPackage; //added by rhj
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.util.Log;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new MainReactPackage(),
            new RNApkInstallPackage(),
            new NotificationSoundsPackage(),
            new ReactNativeAPKPackage(),
            new RNFetchBlobPackage(),            
            new ImagePickerPackage(), new IntentLauncherPackage(), new RNWakefulPackage(),
          new BackgroundTaskPackage(), new ReactNativeRestartPackage(), new NetInfoPackage(),
          new SmartRefreshLayoutPackage(), new BarcodeScannerPackage(), new RNDeviceInfo(), new RNFSPackage(),
          new AndroidWifiPackage(), new BackgroundJobPackage(), new ANPackage(), new AndroidOpenSettingsPackage(),
          new MPAndroidChartPackage(), new SvgPackage(), new RNSpinkitPackage(), new RNCameraPackage(),
          new BaiDuOcrPackage(), new AsyncStoragePackage(), new OrientationPackage(), new RNGestureHandlerPackage(),
          new CareSensPackage(), new CareSensOTGPackage(), new SQLitePluginPackage(),
          
          new RNPowermanagerPackage(), new ReactNativeUsbPackage(), new BluetoothIOPackage());
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();

    /*
     * if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) { Intent intent = new
     * Intent(); String packageName = getPackageName(); PowerManager pm =
     * (PowerManager) getSystemService(POWER_SERVICE); if
     * (!pm.isIgnoringBatteryOptimizations(packageName)) {
     * intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
     * intent.setData(Uri.parse("package:" + packageName));
     * getApplicationContext().startActivity(intent); }
     * 
     * 
     * }
     * 
     */
    SoLoader.init(this, /* native exopackage */ false);

    //
    String id = "rhj_channel_id"; // The id of the channel.
    CharSequence name = "iSensDale_RHJ"; // The user-visible name of the channel.
    String description = "iSensDale_Discription"; // The user-visible description of the channel.
    // for android 8.0
    if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel mChannel = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);
      // mChannel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC;
      // Configure the notification channel.
      mChannel.setDescription(description);
      mChannel.setImportance(NotificationManager.IMPORTANCE_HIGH);

      mChannel.enableLights(true);
      // Sets the notification light color for notifications posted to this
      // channel, if the device supports this feature.
      mChannel.setLightColor(Color.RED);

      mChannel.enableVibration(true);
      mChannel.setVibrationPattern(new long[] { 100, 200, 300, 400, 500, 400, 300, 200, 400 });

      NotificationManager mNotificationManager = (NotificationManager) this
          .getSystemService(Context.NOTIFICATION_SERVICE);
      mNotificationManager.createNotificationChannel(mChannel);
    }
    BackgroundTaskPackage.useContext(this);
  }

  @Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    MultiDex.install(this);
  }
}
