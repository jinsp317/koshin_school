/*
	created by @rihyokju 2019
	유선혈당계관리패키지
*/
package com.daleapp;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.RunningAppProcessInfo;
import android.app.ProgressDialog;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.hardware.usb.UsbManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.ftdi.j2xx.D2xxManager;
import com.ftdi.j2xx.FT_Device;
//import com.isens.app.fpga_fifo.R;

import org.apache.http.util.ByteArrayBuffer;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import javax.annotation.Nullable;

import static com.daleapp.CareSensOTGPackage.TAG;

class CS_Data {
    String createdate;
    int value;
    int ext; // 0 : default, 1 : meal, 2 : check, 3: meal + check, 4 : low, 5 : high
};


public class CareSensOTGModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

    // Debugging
    private static final boolean D = true;

    private static final String GET_LATEST_DATA_OTG = "getLatestDataOTG";
    private static final String GET_SN_OTG = "getSnOTG";

    private static D2xxManager ftD2xx = null;
    private static FT_Device ftDev;

    public static final int READBUF_SIZE = 256;
    static final int ECHO_SIZE = 3;
    static final int REV1_FLAG1_SERIAL_SIZE = 24;
    static final int REV1_FLAG2_SERIAL_SIZE = 30;
    static final int REV3_SERIAL_SIZE = 27;
    static final int REV1_TIMESYNC_SIZE_FAIL = 3;
    static final int REV1_TIMESYNC_SIZE_SUCC = 17;
    static final int REV3_TIMESYNC_SIZE = 19;
    static final int REV1_COUNT_SIZE = 6;
    static final int REV3_COUNT_SIZE = 15;
    static final int REV1_GLUCOSE_SIZE = 24;
    static final int REV3_GLUCOSE_SIZE = 22;
    static final int REV3_ERROR_SIZE = 13;

    public static int DOWNLOAD_EXCEPTION = -2;
    public static int DOWNLOAD_ERROR = -1;
    public static int DOWNLOAD_ECHO = 1;
    public static int DOWNLOAD_GETSN = 2;
    public static int DOWNLOAD_TIMESYNC = 3;
    public static int DOWNLOAD_GETCOUNT = 4;
    public static int DOWNLOAD_GETSAVEPOINT = 5;
    public static int DOWNLOAD_GETDATA = 6;
    public static int DOWNLOAD_COMPLETED = 7;
    public static int DOWNLOAD_GETLATEST = 8;

    static final int MAX_MEMORY = 1000;

    static final byte[][] COMMAND_1 = {null,
            {(byte) 0x80},                                                                            // Echo
            {(byte) 0x8B, (byte) 0x11, (byte) 0x20, (byte) 0x13, (byte) 0x24, (byte) 0x10, (byte) 0x2a},    // Serial Number
            null,                                                                                    // Time Sync (Otg_doTimeSync 사용)
            {(byte) 0x8B, (byte) 0x11, (byte) 0x20, (byte) 0x18, (byte) 0x26, (byte) 0x10, (byte) 0x22},    // Count
            {(byte) 0x8B, (byte) 0x11, (byte) 0x20, (byte) 0x18, (byte) 0x28, (byte) 0x10, (byte) 0x22},    // Save Point
            null};                                                                                    // Next Data (Otg_getNextData 사용)

    static final byte[][] COMMAND_2 = {null,
            {(byte) 0x80},
            {(byte) 0x02, (byte) 0x69, (byte) 0x53, (byte) 0x50, (byte) 0x63, (byte) 0x07, (byte) 0x52, (byte) 0x53, (byte) 0x4e, (byte) 0x42, (byte) 0xb1, (byte) 0x4c, (byte) 0x03},
            null,
            {(byte) 0x02, (byte) 0x69, (byte) 0x53, (byte) 0x50, (byte) 0x63, (byte) 0x07, (byte) 0x4e, (byte) 0x43, (byte) 0x4f, (byte) 0x54, (byte) 0xbb, (byte) 0x7f, (byte) 0x03},
            null};

    private static byte gluHeader = (byte) 0x45;

    ArrayList<CS_Data> m_data_list;
    static byte[] m_byteBuffer = new byte[READBUF_SIZE];
    static ByteArrayBuffer m_byteReceive = null;
    static boolean m_bBrazilInjex = false; //[2015/01/27][이나인] brazil향 injecx meter 예외처리


    int maxMemory = MAX_MEMORY;
    int snFlag = 0;
    int nCount = 0;
    static String[] model_code = {"CSP", "ISP", "GSP", "CNP", "NCP", "HDP", "ACP", "NTP", "ECP", "AQP", "ITP", "CNM", "APP", "CLP", "DAP", "MDP", "CMP", "CVP"};
    static char[] program_ver = new char[] {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'};

    private OtgLatestReadTask mLatestReadTask;

    private String TIME_FORMAT = "a h:mm:ss";
    private SimpleDateFormat mSimpleTimeFormat;
    private OtgReadTask mSyncTask;

    private ScheduledExecutorService mDeviceCheckScheduler;
    private static int m_device_state = 0;		//Before Download = 0, Echo = 1, Serial = 2, TimeSync = 3, Count = 4, Glucose = 5, Done = 6
    private boolean m_isDownloadLatest = true;
    private static long mEndTimeMillis = 0;
    private static String snum = null;
    private static int m_nProtocolFlag = 0;
    private static int m_nGlucoseCount = 0;
    private static short m_data_address = 0;
    private static int m_nReqMaxCnt = 1;
    private static int m_nMemory = 0;
    private static int m_nSavePoint = 0;

    private ReactApplicationContext mReactContext;

    public CareSensOTGModule(ReactApplicationContext reactContext) {
        super(reactContext);

        if (D)
            Log.d(TAG, "Bluetooth module started");

        mReactContext = reactContext;

        mReactContext.addActivityEventListener(this);
        mReactContext.addLifecycleEventListener(this);

        m_data_list = new ArrayList<CS_Data>();
        initOTG();

        //자료읽기스레드시작
        startLatestReadTask();
    }

    public void initOTG() {
        m_byteBuffer = new byte[READBUF_SIZE];
        m_byteReceive = new ByteArrayBuffer(READBUF_SIZE);

        try {
            ftD2xx = D2xxManager.getInstance(mReactContext);
        } catch (D2xxManager.D2xxException ex) {
        }
    }

    public void initDownload() {
        snFlag = 0;
        nCount = 0;
        maxMemory = MAX_MEMORY;
        if(m_data_list == null) m_data_list = new ArrayList<CS_Data>();
        else m_data_list.clear();
        m_byteReceive.clear();
    }
    public void SetConfig() {
        if (!ftDev.isOpen()) return;

        ftDev.setBitMode((byte) 0, D2xxManager.FT_BITMODE_RESET);
        ftDev.setBaudRate(9600);
        ftDev.setDataCharacteristics(D2xxManager.FT_DATA_BITS_8, D2xxManager.FT_STOP_BITS_1, D2xxManager.FT_PARITY_NONE);
        ftDev.setFlowControl(D2xxManager.FT_FLOW_NONE, (byte) 0x0b, (byte) 0x0d);
        ftDev.setLatencyTimer((byte)16);

        ftDev.purge((byte) (D2xxManager.FT_PURGE_TX | D2xxManager.FT_PURGE_RX));
        ftDev.restartInTask();
    }

    public boolean openDevice() {
        ftDev = null;
        initDownload();

        int devCount = ftD2xx.createDeviceInfoList(mReactContext);
        if(devCount <= 0) return false;

        D2xxManager.FtDeviceInfoListNode[] deviceList = new D2xxManager.FtDeviceInfoListNode[devCount];
        ftD2xx.getDeviceInfoList(devCount, deviceList);

        if(ftDev == null) {
            ftDev = ftD2xx.openByIndex(mReactContext, 0);
        } else {
            synchronized (ftDev) {
                ftDev = ftD2xx.openByIndex(mReactContext, 0);
            }
        }

        if(ftDev != null && ftDev.isOpen()) {
            Log.d("-- FTDI", "-- open success");
            return true;
        }
        return  false;
    }
    public static void closeDevice() {
        try {
            if(ftDev != null) {
                if(ftDev.isOpen())
                    ftDev.close();
                ftDev = null;
            }
        } catch (Exception e) {}
    }

    private void stopDeviceCheckScheduler() {
        try {
            mDeviceCheckScheduler.shutdownNow();
        } catch (Exception e) {
        }
    }
    private void startDeviceCheckScheduler() {
        try {
            mDeviceCheckScheduler = Executors.newSingleThreadScheduledExecutor();
            mDeviceCheckScheduler.scheduleAtFixedRate(new Runnable() {
                public void run() {
                    try {
                        if (ftDev != null && ftDev.isOpen()) {
                            if (mLatestReadTask != null && !mLatestReadTask.isCancelled())
                                mLatestReadTask.cancel(true);
                            mLatestReadTask = new OtgLatestReadTask();
                            mLatestReadTask.execute();
                            stopDeviceCheckScheduler();
                        } else {
                            openDevice();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }, 1, 1, TimeUnit.SECONDS);
        } catch (Exception e) {
            e.getMessage();
        }
    }
    // ext 값:  0 : default, 1 : CS, 2 : meal, 3: meal + check, 4 : low, 5 : high
    public void checkExtGlucoseData(CS_Data item, int ext, boolean isInjecxMeter) {
        if(ext >= 128)
            ext = ext -128;
        else if(isInjecxMeter == false){ //[2015/01/27][이나인] brazil향 injecx meter 예외처리
            switch((int)item.value){
                case 1:
                case 10:
                    ext = (int)((ext | 0x04) & 0xff);
                    break;
                case 700:
                    ext = (int)((ext | 0x08) & 0xff);
                    break;
                default:
                    ext = (int)(ext & 0xff);
                    break;
            }
        }
    }
    public boolean checkExtGlucoseData(CS_Data data, boolean isExtFlag) {
        if(isExtFlag && data.value > 40000){
            data.value = data.value - 40000; // no mark data
        }
        if(data.value > 30000) {
            data.value = data.value - 30000; // meal + cs
        }
        else if(data.value > 20000) {
            data.value = data.value - 20000; // cs data
        }
        else if(data.value > 10000) {
            data.value = data.value - 10000; // meal
        }

        return true;
    }
    public void setReadData(int data) {
        //Log.d("--FTDI","--otg readData: "+ m_byteBuffer);
//        Log.d("--FTDI", "--otg readData: " + new String(m_byteBuffer));
        Log.d("--FTDI", "--otg readData: ");
        //byteToAscii(m_byteBuffer);
        ftDev.read(m_byteBuffer, data);
        m_byteReceive.append(m_byteBuffer, 0 , data);
    }
    private void startLatestReadTask() {  //실시간 측정 데이터 읽어오기 작업 시작
        closeDevice();
        startDeviceCheckScheduler();
    }
    private int mReadSize = 0;
    private int mCVPMaxMemory = 500;

    private class OtgLatestReadTask extends AsyncTask<Void, Integer, Void> {
        String downloadData;

        @Override
        protected void onCancelled() {
            super.onCancelled();
        }

        // can use UI thread here
        protected void onPreExecute() {
            SetConfig();
            m_byteReceive.clear();
        }

        @Override
        protected Void doInBackground(Void... params) {
            // TODO Auto-generated method stub
            int readSize;
            mReadSize = 0;
            while (ftDev != null && ftDev.isOpen()) {
                readSize = ftDev.getQueueStatus();

                if (readSize > 0) {
                    mReadSize += readSize;
                    if (mReadSize > READBUF_SIZE) mReadSize = READBUF_SIZE;
                    setReadData(readSize);
                    String readStr = new String(m_byteReceive.buffer());
                    int startIndex = readStr.indexOf("iSPc");

                    if(startIndex + 21 <= mReadSize) {
                        if (startIndex > 0
                                && m_byteReceive.byteAt(startIndex - 1) == 0x02
                                && new String(m_byteReceive.buffer()).substring(startIndex + 5, startIndex + 9).equalsIgnoreCase("GLUE")
                                && m_byteReceive.byteAt(startIndex + 20) == 0x03) {

                            CS_Data data = new CS_Data();

                            Calendar gc = Calendar.getInstance();
                            char year, month, day, hour, minute, second;

                            year = (char) m_byteReceive.byteAt(startIndex + 9);
                            month = (char) m_byteReceive.byteAt(startIndex + 10);
                            day = (char) m_byteReceive.byteAt(startIndex + 11);
                            hour = (char) m_byteReceive.byteAt(startIndex + 12);
                            minute = (char) m_byteReceive.byteAt(startIndex + 13);
                            second = (char) m_byteReceive.byteAt(startIndex + 14);
                            gc.set(year + 2000, month - 1, day, hour, minute, second);

//                            java.text.DateFormat df = DateFormat.getDateFormat(mReactContext);
//                            mReactContextString strDate = df.format(gc.getTimeInMillis());
//                            df = DateFormat.getTimeFormat(mReactContext);
//                            strDate += " " + mSimpleTimeFormat.format(gc.getTimeInMillis());

//                            data.createdate = strDate;
                            data.value = (int) ((m_byteReceive.byteAt(startIndex + 16) & 0xff) << 8) + (int) (m_byteReceive.byteAt(startIndex + 17) & 0xff);
                            checkExtGlucoseData(data, (int) (m_byteReceive.byteAt(startIndex + 15) & 0xff), m_bBrazilInjex);

 //todo RHJ
                            WritableMap params1 = Arguments.createMap();
                            params1.putInt("glucoseData", data.value);
                            params1.putString("sn", snum);
                            sendEvent(GET_LATEST_DATA_OTG, params1);

                            downloadData = "glucose value: " + data.value;// + ", time: " + data.createdate;
                            break;
                        } else {
                            downloadData = "Data download error";
                            break;
                        }
                    }
                }
            }

            return null;
        }

        @Override
        protected void onPostExecute(final Void unused) {
            //tvLatestData.setText(downloadData);
            Log.d("RHJ","-------------------------downloadData: " +downloadData);
            Log.d("RHJ","-------------------------sn: " +snum);

            startLatestReadTask();
        }


    }

    private class OtgReadTask extends AsyncTask<Void, Integer, Void> {
        @Override
        protected void onCancelled() {
            // TODO 작업이 취소된후에 호출된다.
            super.onCancelled();
        }

        // can use UI thread here
        protected void onPreExecute()  {
            Log.d("-- FTDI", "-- config setting");
            SetConfig();
            m_byteReceive.clear();
        }

        // automatically done on worker thread (separate from UI thread)
        @Override
        protected Void doInBackground(Void... params) {
            // TODO Auto-generated method stub
            if (this.isCancelled()) return null;

            Log.d("-- FTDI", "-- start");
            int readSize;

//			setTimer(System.currentTimeMillis() + 2000);
            mEndTimeMillis = System.currentTimeMillis() + 3000;
            while(m_device_state != DOWNLOAD_ERROR && m_device_state != DOWNLOAD_EXCEPTION && m_device_state != DOWNLOAD_COMPLETED) {
                if (System.currentTimeMillis() > mEndTimeMillis)
                    timeOut();

                if( ftDev == null) {
//					showToast(R.string.MeterErrorMessage_15);
                    m_device_state = DOWNLOAD_EXCEPTION;
                    break;
                }

                synchronized (ftDev) {
                    readSize = 0;
                    mReadSize = 0;

                    readSize = ftDev.getQueueStatus();

                    if(readSize > 0) {
                        mReadSize = readSize;
                        if(mReadSize > READBUF_SIZE)  mReadSize = READBUF_SIZE;

                        setReadData(mReadSize);
                        Log.d("--FTDI", "--otg do in task set read data");

                        mEndTimeMillis =System.currentTimeMillis() + 1000;
                        m_device_state = makeFullData();


                        if(m_device_state == DOWNLOAD_ECHO) {
                            publishProgress(2);
                        }
                        else if(m_device_state == DOWNLOAD_GETSN) {
                            publishProgress(4);
                        }
                        else if(m_device_state == DOWNLOAD_TIMESYNC) {
                            publishProgress(7);
                        }
                        else if(m_device_state == DOWNLOAD_GETCOUNT) {
                            publishProgress(10);
                        }
                        else if(m_device_state == DOWNLOAD_GETSAVEPOINT) {
                            publishProgress(12);
                        }
                        else if(m_device_state == DOWNLOAD_GETDATA) {
                            if(snum.startsWith("CVP") == true) //cvp model doesn't know meter max count.
                                publishProgress(10 + (int)(30*nCount/mCVPMaxMemory));
                            else
                                publishProgress(10 + (int)(60*nCount/m_nGlucoseCount));
                        }
                        else if(m_device_state == DOWNLOAD_EXCEPTION){
//							showToast(R.string.MeterErrorMessage_09);
                        }
                    }
                } // end of synchronized
            }

            publishProgress(100);

            return null;
        }

        @Override
        protected void onProgressUpdate(Integer... values) {
            super.onProgressUpdate(values);
        }

        // can use UI thread here
        @Override
        protected void onPostExecute(final Void unused) {
            Log.d("RHJ","-------------------------SerialNumber: " +snum);
            //todo RHJ


            if (snum != null) {
                WritableMap params1 = Arguments.createMap();
                params1.putString("sn", snum);
                int count = m_data_list.size();
                if (count > 0) {
                    params1.putInt("glucoseData", m_data_list.get(count-1).value);
                    Log.d("RHJ", "latest value = " + m_data_list.get(count-1).value);
                }
                sendEvent(GET_SN_OTG, params1);
            }

            Log.d("RHJ", "--otg do in task send event sn = " + snum);
            startLatestReadTask();
        }
    }

    public void timeOut(){
        Log.d("--FTDI","-- timeout");
        mEndTimeMillis = System.currentTimeMillis() + 2000;
        if(m_device_state == DOWNLOAD_TIMESYNC && m_nProtocolFlag == 1) {
            Otg_sendCommand(DOWNLOAD_GETCOUNT);
        } else {
//			showToast(R.string.MeterErrorMessage_09);
            Otg_sendCommand(DOWNLOAD_EXCEPTION);
        }
    }
    public int makeFullData(){
        int nPacketsize = m_byteReceive.length();
        int nCheckBuffer = m_byteReceive.byteAt(0) & 0xff;
        Log.d("--FTDI","-- count: "+ nCheckBuffer + " , -state: "+ m_device_state);

        if(nPacketsize == ECHO_SIZE && nCheckBuffer == 128 && m_device_state == DOWNLOAD_ECHO ) // 0x80
            return readInitData();
        else if(nCheckBuffer == 139 && m_nProtocolFlag == 1){ //0x8b
            if(m_device_state == DOWNLOAD_GETSN){
                if(nPacketsize == REV1_FLAG1_SERIAL_SIZE|| nPacketsize == REV1_FLAG2_SERIAL_SIZE){
                    if(snFlag == 0) //nVoice
                        return readSerialNum1();
                    else
                        return readTimeGlucoseData(); //Glucose data
                }
            }
            else if(m_device_state == DOWNLOAD_GETCOUNT){
                if(nPacketsize == REV1_COUNT_SIZE)
                    return readDataCount(); //Glucose data count
            }
            else if(m_device_state == DOWNLOAD_GETSAVEPOINT){
                if(nPacketsize == REV1_COUNT_SIZE)
                    return readSavePoint(); //Glucose save point
            }
            else if(m_device_state == DOWNLOAD_GETDATA){
                if(nPacketsize == m_nReqMaxCnt * REV1_GLUCOSE_SIZE)
                    return readTimeGlucoseData(); //Glucose data
            }
        }
        else if(nCheckBuffer == 176 && m_nProtocolFlag == 1 && m_device_state == DOWNLOAD_TIMESYNC ){ //0xb0
            switch(nPacketsize){
                case REV1_TIMESYNC_SIZE_FAIL:
                    if(m_byteReceive.byteAt(2) == 34) //error: b0 10 22
                        return Otg_sendCommand(DOWNLOAD_GETCOUNT);
                    break;
                case REV1_TIMESYNC_SIZE_SUCC:
                    return Otg_sendCommand(DOWNLOAD_GETCOUNT);
            }
        }
        else if(nCheckBuffer == 2 && m_nProtocolFlag >= 2){ //0x02
            Log.d("--FTDI", "--m_nProtocolFlag" + m_nProtocolFlag + "\r" + nPacketsize);
            if(nPacketsize == REV3_ERROR_SIZE) {
                if(!checkError()) {
                    Log.d("--FTDI", "--error");
//					showToast(R.string.MeterErrorMessage_09);
                    return DOWNLOAD_EXCEPTION;
                }
            }
            if(m_device_state == DOWNLOAD_GETSN) {
                if(nPacketsize == REV3_SERIAL_SIZE)
                    return readSerialNum2(); //Meter serial number 2
            }
            else if(m_device_state == DOWNLOAD_TIMESYNC) {
                if(nPacketsize == REV3_TIMESYNC_SIZE && (new String(m_byteReceive.buffer()).substring(6, 10).equalsIgnoreCase("WTIM")))
                    return Otg_sendCommand(DOWNLOAD_GETCOUNT);
            }
            else if(m_device_state == DOWNLOAD_GETCOUNT) {
                if(nPacketsize == REV3_COUNT_SIZE)
                    return readDataCount();
            }
            else if(m_device_state == DOWNLOAD_GETDATA) {
                if(nPacketsize == (9*(m_nReqMaxCnt -1)) + REV3_GLUCOSE_SIZE)
                    return readTimeGlucoseDataExt();//Glucose data count
            }
        }

        return m_device_state;
    }
    public boolean checkError(){
        String buffer = new String(m_byteReceive.buffer()).substring(6, 10);
        int nError = 0; // 1: timeout, 2: head error, 3: size error, 4: crc error
        if(buffer.equalsIgnoreCase("TOUT")) {
//				Util.log("--crc TOUT error");
//			showToast(R.string.MeterErrorMessage_11);
            nError = 1;
        } else if(buffer.equalsIgnoreCase("HEAD")) {
//				Util.log("--crc HEAD error");
//			showToast(R.string.MeterErrorMessage_12);
            nError = 2;
        } else if(buffer.equalsIgnoreCase("SIZE")) {
//				Util.log("--crc SIZE error");
//			showToast(R.string.MeterErrorMessage_13);
            nError = 3;
        } else if(buffer.equalsIgnoreCase("ECRC")) {
//				Util.log("--crc ECRC error");
//			showToast(R.string.MeterErrorMessage_14);
            nError = 4;
        }

        if(nError > 0) return false;
        else return true;
    }

    public int readInitData() {
        Log.d("--FTDI", "--readInitData");

        if((m_byteReceive.byteAt(1) == (byte)0x10) && (m_byteReceive.byteAt(2) == (byte)0x20))
            m_nProtocolFlag = 1; //old
        else if((m_byteReceive.byteAt(1) == (byte)0x1e) && (m_byteReceive.byteAt(2) == (byte)0x2e))
            m_nProtocolFlag = 2; //new_ext
        else if((m_byteReceive.byteAt(1) == (byte)0x1f) && (m_byteReceive.byteAt(2) == (byte)0x2f)){
            m_nProtocolFlag = 3; //new_ext
            gluHeader = (byte)0x43;
        }

        Log.d("--FTDI", "--Revision: " + m_nProtocolFlag);

        m_nGlucoseCount = 0;
        Otg_sendCommand(DOWNLOAD_GETSN);

        return DOWNLOAD_GETSN;
    }

    //Old SerialNum (SN1)
    public int readSerialNum1() {
        Log.d("--FTDI", "--readSerialNum1");

        if ((((m_byteReceive.byteAt(22) & 0x0F) << 4) + (m_byteReceive.byteAt(23) & 0x0F)) == 0x00) {
            snFlag = 1;
            int[] temp_number = {0, 0, 0, 0};
            for (int loop = 0; loop < 4; loop++) {
                temp_number[loop] = (((m_byteReceive.byteAt(1 + loop * 6) & 0x0F) * 16 + (m_byteReceive.byteAt(2 + loop * 6) & 0x0F)) + ((m_byteReceive.byteAt(4 + loop * 6) & 0x0F) * 16 + (m_byteReceive.byteAt(5 + loop * 6) & 0x0F)) * 256);
            }

            if (temp_number[2] > 18) {
                snum = String.format("%c%c%c%02d%s%05d",
                        ((m_byteReceive.byteAt(13) & 0x0f) << 4) + (m_byteReceive.byteAt(14) & 0x0f),
                        ((m_byteReceive.byteAt(16) & 0x0f) << 4) + (m_byteReceive.byteAt(17) & 0x0f),
                        ((m_byteReceive.byteAt(10) & 0x0f) << 4) + (m_byteReceive.byteAt(11) & 0x0f),
                        ((m_byteReceive.byteAt(7) & 0x0f) << 4) + (m_byteReceive.byteAt(8) & 0x0f),
                        program_ver[temp_number[3] % 26], temp_number[0]);
            } else if (temp_number[2] == 17) // cvp
                snum = String.format("%s%02x%s%05d", model_code[temp_number[2]], temp_number[1], program_ver[temp_number[3] % 26], temp_number[0]);
            else
                snum = String.format("%s%02d%s%05d", model_code[temp_number[2]], temp_number[1], program_ver[temp_number[3] % 26], temp_number[0]);

            maxMemory = 250;
            if (temp_number[2] == 12 || temp_number[2] == 13 || temp_number[2] == 16 || temp_number[2] == 17)
                maxMemory = 500;
        } else {// new s/n
            snFlag = 2;
            m_nMemory = ((m_byteReceive.byteAt(10) & 0x0f) << 4) + (m_byteReceive.byteAt(11) & 0x0f);
            maxMemory = m_nMemory * 250; //memory = max count
            snum = String.format("%c%c%c%03d%c%05d",
                    ((m_byteReceive.byteAt(1) & 0x0f) << 4) + (m_byteReceive.byteAt(2) & 0x0f), // model code
                    ((m_byteReceive.byteAt(4) & 0x0f) << 4) + (m_byteReceive.byteAt(5) & 0x0f), // model code
                    ((m_byteReceive.byteAt(7) & 0x0f) << 4) + (m_byteReceive.byteAt(8) & 0x0f), // factory code
                    ((m_byteReceive.byteAt(13) & 0x0f) << 4) + (m_byteReceive.byteAt(14) & 0x0f) + ((m_byteReceive.byteAt(16) & 0x0f) << 12) + ((m_byteReceive.byteAt(17) & 0x0f) << 8), //Production date
                    ((m_byteReceive.byteAt(19) & 0x0f) << 4) + (m_byteReceive.byteAt(20) & 0x0f), //production year
                    ((m_byteReceive.byteAt(25) & 0x0f) << 4) + (m_byteReceive.byteAt(26) & 0x0f) + ((m_byteReceive.byteAt(28) & 0x0f) << 12) + ((m_byteReceive.byteAt(29) & 0x0f) << 8)); //product count
        }
        if (snum.startsWith("CVP") == true) {
            Otg_sendCommand(DOWNLOAD_GETDATA);
            return DOWNLOAD_GETDATA;
        } else {
            Otg_sendCommand(DOWNLOAD_TIMESYNC);
            return DOWNLOAD_TIMESYNC;
        }
    }

    // New SerialNum (SN2)
    public int readSerialNum2() {
        Log.d("--FTDI", "--readSerialNum2");
        snum = new String(m_byteReceive.buffer()).substring(11, 23);
        Otg_sendCommand(DOWNLOAD_TIMESYNC);
        if(snum.startsWith("C1") == true || snum.startsWith("E4") == true)//[2015/01/27][이나인] brazil향 injecx meter 예외처리
            m_bBrazilInjex = true;

        return DOWNLOAD_TIMESYNC;
    }

    //Glucose data count
    public int readDataCount() {
        Log.d("--FTDI", "--readDataCount");

        switch(m_nProtocolFlag) {
            case 1:
                m_nGlucoseCount = ((m_byteReceive.byteAt(1) & 0x0f) << 4) + (m_byteReceive.byteAt(2) & 0x0f) + ((m_byteReceive.byteAt(4) & 0x0f) << 12) + ((m_byteReceive.byteAt(5) & 0x0f) << 8);
                break;
            case 2:
            case 3:
                m_nGlucoseCount = (m_byteReceive.byteAt(10) << 8) + (m_byteReceive.byteAt(11) & 0xff);
                break;
            default:
                break;
        }

        Log.d("--FTDI", "--readDataCount" + m_nGlucoseCount);

        if(m_nGlucoseCount > maxMemory)
            m_nGlucoseCount = maxMemory;

        if(m_nGlucoseCount > 0){
            if(m_nProtocolFlag == 1){
                Otg_sendCommand(DOWNLOAD_GETSAVEPOINT);
                return DOWNLOAD_GETSAVEPOINT;
            }
            else {
                Otg_sendCommand(DOWNLOAD_GETDATA);
                return DOWNLOAD_GETDATA;
            }
        } else {
            return DOWNLOAD_COMPLETED;
        }
    }

    //Glucose Save Point
    public int readSavePoint() {
        Log.d("--FTDI", "--readSavePoint");
        m_nSavePoint = ((m_byteReceive.byteAt(1) & 0x0f) << 4) + (m_byteReceive.byteAt(2) & 0x0f) + ((m_byteReceive.byteAt(4) & 0x0f) << 12) + ((m_byteReceive.byteAt(5) & 0x0f) << 8);

        Otg_sendCommand(DOWNLOAD_GETDATA);
        return DOWNLOAD_GETDATA;
    }

    // Time + Glucose data
    public int readTimeGlucoseData() {
        Log.d("--FTDI", "--readTimeGlucoseData");
        if(snum.startsWith("CVP") == true){
            if((m_byteReceive.byteAt(1) == (byte)0x1F) && (m_byteReceive.byteAt(2) == (byte)0x2F)){ //1F2F: no more data
                return DOWNLOAD_COMPLETED;
            }
        }
        else {
            if(m_nGlucoseCount <= nCount || m_byteReceive == null) {
                return DOWNLOAD_COMPLETED;
            }
        }

        Calendar gc = Calendar.getInstance();
        char year, month, day, hour, minute, second;

        for(int i = 0; i < m_nReqMaxCnt; i++){
            int nAddress = REV1_GLUCOSE_SIZE * i;
            if((m_byteReceive.byteAt(1+nAddress) != (byte)0x1F) || (m_byteReceive.byteAt(2+nAddress) != (byte)0x2F)){ // Error data skip
                CS_Data item = new CS_Data();

                year = (char)(((m_byteReceive.byteAt(1+nAddress) & 0x0F) << 4) + (m_byteReceive.byteAt(2+nAddress) & 0x0F));
                month = (char)(((m_byteReceive.byteAt(4+nAddress) & 0x0F) << 4) + (m_byteReceive.byteAt(5+nAddress) & 0x0F));
                day = (char)(((m_byteReceive.byteAt(7+nAddress) & 0x0F) << 4) + (m_byteReceive.byteAt(8+nAddress) & 0x0F));
                hour = (char)(((m_byteReceive.byteAt(10+nAddress) & 0x0F) << 4) + (m_byteReceive.byteAt(11+nAddress) & 0x0F));
                minute = (char)(((m_byteReceive.byteAt(13+nAddress) & 0x0F) << 4) + (m_byteReceive.byteAt(14+nAddress) & 0x0F));
                second = (char)(((m_byteReceive.byteAt(16+nAddress) & 0x0F) << 4) + (m_byteReceive.byteAt(17+nAddress) & 0x0F));

                if(month <= 12 && day <= 31 && hour <= 24 && minute <= 59 && second <= 59) {
                    // 반드시 날짜처리 수정해야 할 코드 - 테스트용임
                    gc.set(year+2000, month-1, day, hour, minute, second);
                    // mili-second 값을 제거한 후에 저장
                    java.text.DateFormat df = DateFormat.getDateFormat(mReactContext);
                    String strDate = df.format(gc.getTimeInMillis());
//                    df = DateFormat.getTimeFormat(mReactContext);
//                    strDate += " " + mSimpleTimeFormat.format(gc.getTimeInMillis());
//                    item.createdate = strDate;
                    item.value = ((m_byteReceive.byteAt(19+nAddress) & 0x0F) << 4) + (m_byteReceive.byteAt(20+nAddress) & 0x0F) + ((m_byteReceive.byteAt(22+nAddress) & 0x0F) << 12) + ((m_byteReceive.byteAt(23+nAddress) & 0x0F) << 8);
                    checkExtGlucoseData(item, false);
                    m_data_list.add(item);
                }
            }
            nCount++;
        }

        if(m_nGlucoseCount <= nCount && snum.startsWith("CVP") == false)
            return DOWNLOAD_COMPLETED;
        else
            Otg_sendCommand(DOWNLOAD_GETDATA);
        return DOWNLOAD_GETDATA;
    }

    //Time + Glucose data : NEW_ext
    public int readTimeGlucoseDataExt() {
        if(m_nGlucoseCount <= nCount)
            return DOWNLOAD_COMPLETED;
        else if(m_nGlucoseCount > 0){
            Calendar gc = Calendar.getInstance();
            int year, month, day, hour, minute, second;
            for(int i = 1; i <= m_nReqMaxCnt; i++){
                CS_Data item = new CS_Data();

                int nAddress = (i * 9) + 1;
                year = (char)m_byteReceive.byteAt(nAddress);
                month = (char)m_byteReceive.byteAt(nAddress + 1);
                day = (char)m_byteReceive.byteAt(nAddress + 2);
                hour = (char)m_byteReceive.byteAt(nAddress + 3);
                minute = (char)m_byteReceive.byteAt(nAddress + 4);
                second = (char)m_byteReceive.byteAt(nAddress + 5);
                if(month <= 12 && day <= 31 && hour <= 24 && minute <= 59 && second <= 59) {
                    gc.set(year+2000, month-1, day, hour, minute, second);

                    java.text.DateFormat df = DateFormat.getDateFormat(mReactContext);
                    String strDate = df.format(gc.getTimeInMillis());
//                    df = DateFormat.getTimeFormat(mReactContext);
//                    strDate += " " + mSimpleTimeFormat.format(gc.getTimeInMillis());
//                    item.createdate = strDate;
                    item.value = (int)((m_byteReceive.byteAt(nAddress + 7) & 0xff ) << 8) + (int)(m_byteReceive.byteAt(nAddress + 8) & 0xff);

                    checkExtGlucoseData(item, (int)(m_byteReceive.byteAt(nAddress + 6) & 0xff), m_bBrazilInjex);
                    m_data_list.add(item);
                }
                nCount++;
            }
            if(m_nGlucoseCount <= nCount)
                return DOWNLOAD_COMPLETED;
            else
                Otg_sendCommand(DOWNLOAD_GETDATA);
        }

        return DOWNLOAD_GETDATA;
    }
    public int Otg_doTimeSync() {
        Log.d("--FTDI", "--onTimeSync");

        Calendar cal = Calendar.getInstance();
        byte bCurrYear = (byte)((cal.get(Calendar.YEAR) - 2000) & 0xff);
        byte bCurrMonth = (byte)((cal.get(Calendar.MONTH)+1) & 0xff);
        byte bCurrDay = (byte)(cal.get(Calendar.DAY_OF_MONTH) & 0xff);
        byte bCurrHour = (byte)(cal.get(Calendar.HOUR_OF_DAY) & 0xff);
        byte bCurrMin = (byte)(cal.get(Calendar.MINUTE) & 0xff);
        byte bCurrSec = (byte)(cal.get(Calendar.SECOND) & 0xff);

        if(m_nProtocolFlag == 1){
            byte checksum = (byte)(bCurrYear^bCurrMonth^bCurrDay^bCurrHour^bCurrMin^bCurrSec);
            byte[] buffer1 = {(byte)0xb0,
                    (byte)((bCurrYear   >> 4)	+ 0x10), (byte)((bCurrYear   & 0x0F)	 + 0x20),
                    (byte)((bCurrMonth  >> 4)	+ 0x10), (byte)((bCurrMonth  & 0x0F)	 + 0x20),
                    (byte)((bCurrDay	>> 4)	+ 0x10), (byte)((bCurrDay	& 0x0F)	 + 0x20),
                    (byte)((bCurrHour   >> 4)	+ 0x10), (byte)((bCurrHour   & 0x0F)	 + 0x20),
                    (byte)((bCurrMin	>> 4)	+ 0x10), (byte)((bCurrMin	& 0x0F)	 + 0x20),
                    (byte)((bCurrSec	>> 4)	+ 0x10), (byte)((bCurrSec	& 0x0F)	 + 0x20),
                    (byte)((checksum 	>> 4)	 + 0x10), (byte)((checksum	  & 0x0F)	 + 0x20)};
            onFTDIWirte(buffer1);
        } else if(m_nProtocolFlag >= 2){
            byte[] buffer2 = {(byte)0x02, (byte)0x69, (byte)0x53, (byte)0x50, (byte)0x63, (byte)0x0D, (byte)0x57, (byte)0x54, (byte)0x49, (byte)0x4D, bCurrYear, bCurrMonth, bCurrDay, bCurrHour, bCurrMin, bCurrSec, (byte)0x03};
            int crc = 0xFFFF;
            int polynomial = 0x1021;

            for(int i = 0; i < buffer2.length; i++){
                for(int j = 0; j < 8; j++){
                    boolean bit = (((buffer2[i] >> (7-j)) & 1) ==1);
                    boolean c15 = (((crc >> 15) & 1) == 1);
                    crc <<= 1;
                    if(c15 != bit) crc ^=polynomial;
                }
            }
            crc &= 0xffff;
            int crc1 = crc >> 8;
            int crc2 = crc & 0xff;

            byte[] temp = {(byte)0x02, (byte)0x69, (byte)0x53, (byte)0x50, (byte)0x63, (byte)0x0D, (byte)0x57, (byte)0x54, (byte)0x49, (byte)0x4D, bCurrYear, bCurrMonth, bCurrDay, bCurrHour, bCurrMin, bCurrSec, (byte)crc1, (byte)crc2, (byte)0x03};
            onFTDIWirte(temp);
        }

        return DOWNLOAD_TIMESYNC;
    }

    public void OnRequestMaxNextData() {
        if(m_nGlucoseCount <= 0) return;

        int nRemainData = m_nGlucoseCount - nCount;
        if(m_nProtocolFlag == 3)
            m_nReqMaxCnt = 1;
        else if(nRemainData >= 27)
            m_nReqMaxCnt = 27;
        else
            m_nReqMaxCnt = nRemainData;
        Log.d("--FTDI", "--m_nReqMaxCnt : " + m_nReqMaxCnt + (byte)gluHeader);

        if (m_isDownloadLatest) {
            nCount = m_nGlucoseCount - 1;
            m_nReqMaxCnt = 1;
        }

        int nc1 = (nCount & 0xff00) >> 8;
        int nc2 = (nCount + 1) & 0x00ff;

        byte[] buffer = {(byte)0x02, (byte)0x69, (byte)0x53, (byte)0x50, (byte)0x63, (byte)0x0a, (byte)0x47, (byte)0x4c, (byte)0x55, gluHeader, (byte)nc1, (byte)nc2, (byte)m_nReqMaxCnt, (byte)0x03};
        int crc = 0xFFFF;
        int polynomial = 0x1021;

        for(int i = 0; i < buffer.length; i++){
            for(int j = 0; j < 8; j++){
                boolean bit = (((buffer[i] >> (7-j)) & 1) ==1);
                boolean c15 = (((crc >> 15) & 1) == 1);
                crc <<= 1;
                if(c15 != bit) crc ^=polynomial;
            }
        }

        crc &= 0xffff;
        int crc1 = crc >> 8;
        int crc2 = crc & 0xff;

        byte[] temp = {(byte)0x02, (byte)0x69, (byte)0x53, (byte)0x50, (byte)0x63, (byte)0x0a, (byte)0x47, (byte)0x4c, (byte)0x55, gluHeader, (byte)nc1, (byte)nc2, (byte)m_nReqMaxCnt, (byte)crc1, (byte)crc2, (byte)0x03};
        onFTDIWirte(temp);
    }

    public void OnRequestNextData() {
        if(snum.startsWith("CVP") == false && m_nGlucoseCount <= 0) return ;

        //old serial number
        if(snFlag == 1) {
            if(snum.startsWith(model_code[0]) == true || snum.startsWith(model_code[1]) == true)
                m_data_address = (short)0xc200;
            else if(snum.startsWith(model_code[2]) == true)
                m_data_address = (short)0xd200;
            else
                m_data_address = (short)0xe200;
        }
        //new serial number
        else {
            if(m_nMemory == 4) {// max data 1000
                m_data_address = (short)0xcc00;
            }
            else {
                if(snum.startsWith("B3A") == true)
                    m_data_address = (short)0xc200;
                else
                    m_data_address = (short)0xe200;
            }
        }

        m_data_address = (short)(m_data_address + (8 * nCount));

        int savepoint = maxMemory - m_nSavePoint;
        if(snum.startsWith("CVP") == true)
            m_nReqMaxCnt = 1;
        else if((m_nGlucoseCount == maxMemory) && (savepoint > 0)){// save point 처리 하는 코드가 들어가야 함(Full로 한번이라도 차있을 경우만 처리함)
            if(savepoint > nCount)
                m_nReqMaxCnt = savepoint - nCount>=10? 10:savepoint - nCount;
            else
                m_nReqMaxCnt = m_nGlucoseCount - nCount >= 10?10:m_nGlucoseCount - nCount;
        }
        else
            m_nReqMaxCnt = m_nGlucoseCount - nCount >= 10?10:m_nGlucoseCount - nCount;


        int nc1 = ((m_nReqMaxCnt* 8) >> 4)	+ 0x10;
        int nc2 = ((m_nReqMaxCnt* 8) & 0x0F) + 0x20;

        byte[] temp = {(byte)0x8B, (byte)0x1c, (byte)0x2c, (byte)0x10, (byte)0x20, (byte)nc1, (byte)nc2};
        temp[1] = (byte)((1 << 4) | ((m_data_address & 0xF000) >> 12));
        temp[2] = (byte)((2 << 4) | ((m_data_address & 0x0F00) >> 8));
        temp[3] = (byte)((1 << 4) | ((m_data_address & 0x00F0) >> 4));
        temp[4] = (byte)((2 << 4) | (m_data_address & 0x000F));

        onFTDIWirte(temp);
    }

    private int Otg_getNextData() {
        if (m_nProtocolFlag==1)
            OnRequestNextData();
        else
            OnRequestMaxNextData();

        return DOWNLOAD_GETDATA;
    }
    public int Otg_sendCommand(int command) {
        Log.d("--FTDI", "--Otg_sendCommand" + command);
        m_device_state = command;
        m_byteReceive.clear();

        if(command < DOWNLOAD_ECHO  || command > DOWNLOAD_GETDATA) return command;

        if(command == DOWNLOAD_TIMESYNC)// 시간동기화
            Otg_doTimeSync();
        else if(command == DOWNLOAD_GETDATA)// 다음 데이타 읽기
            Otg_getNextData();
        else
            onFTDIWirte(m_nProtocolFlag==1?COMMAND_1[command]:COMMAND_2[command]);
        return command;
    }

    private void onFTDIWirte(byte[] aData){
        Log.d("--FTDI", "--otg wirte: " + new String(aData));
        //byteToAscii(aData);
        try{
            ftDev.write(aData, aData.length);
        } catch(Exception e) {
        }
    }

    @ReactMethod
    public void start(Promise promise) {
        Log.d("RHJ","------start()--------");

        stopDeviceCheckScheduler();

        if (mLatestReadTask != null && !mLatestReadTask.isCancelled())
            mLatestReadTask.cancel(true);

        startLatestReadTask();
        promise.resolve(true);
    }
    @ReactMethod
    public void startEx(Promise promise) {
        Log.d("RHJ","------startEx()--------");
        try {
            stopDeviceCheckScheduler();

            if (mLatestReadTask != null && !mLatestReadTask.isCancelled())
                mLatestReadTask.cancel(true);

            closeDevice();
        
            Thread.sleep(200);
            if(openDevice()) {


                if(mSyncTask != null && !mSyncTask.isCancelled()) mSyncTask.cancel(true);
                mSyncTask = new OtgReadTask();
                mSyncTask.execute();
    
                Otg_sendCommand(DOWNLOAD_ECHO);
    
            }
            promise.resolve(true);
        }catch (Exception e){
            promise.resolve(false);
        }

        
    }
    @ReactMethod
    public void stop() {
        Log.d("RHJ","------stop()--------");
        try {
            closeDevice();
            stopDeviceCheckScheduler();
        }
        catch (Exception e) {
        }
    }

    @Override
    public String getName() {
        return "CareSensOTG";
    }

    // @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (D)
            Log.d(TAG, "On activity result request: " + requestCode + ", result: " + resultCode);

    }

    // @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (D)
            Log.d(TAG, "On activity result request: " + requestCode + ", result: " + resultCode);
    }

    // @Override
    public void onNewIntent(Intent intent) {
        if (D)
            Log.d(TAG, "On new intent");
    }

    @Override
    public void onHostResume() {
        if (D)
            Log.d(TAG, "Host resume");
    }

    @Override
    public void onHostPause() {
        if (D)
            Log.d(TAG, "Host pause");
    }

    @Override
    public void onHostDestroy() {
        if (D)
            Log.d(TAG, "Host destroy");
        this.stop();
    }

    @Override
    public void onCatalystInstanceDestroy() {
        if (D)
            Log.d(TAG, "Catalyst instance destroyed");
        super.onCatalystInstanceDestroy();
        //mBluetoothService.stopAll();
    }


    /**
     * Send event to javascript
     *
     * @param eventName Name of the event
     * @param params    Additional params
     */
    private void sendEvent(String eventName, @Nullable WritableMap params) {

        // if (mReactContext.hasActiveCatalystInstance())
        try {
            if (D)
                Log.d(TAG, "Sending event: " + eventName);

            mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
            Log.d(TAG, "sendEvent called");
        } catch (Exception e) {

        }
    }

}