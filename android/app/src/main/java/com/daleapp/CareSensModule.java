package com.daleapp;

import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Vector;
import java.util.Locale;

import javax.annotation.Nullable;

import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.text.format.DateFormat;
import android.util.Log;
import android.util.Base64;
import android.util.SparseArray;

import java.util.Set;
import android.widget.Toast;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static com.daleapp.CareSensPackage.TAG;

public class CareSensModule extends ReactContextBaseJavaModule
        implements ActivityEventListener, LifecycleEventListener {

    // Debugging
    private static final boolean D = true;

    // Constants
    private static final String DEFAULT_SERVICES = "DEFAULT_SERVICES";
    private static final boolean DEVICE_IS_BONDED = true;
    private static final boolean DEVICE_NOT_BONDED = false;
    private static final int REQUEST_ENABLE_BT = 2;
    private final static int OP_CODE_REPORT_STORED_RECORDS = 1;
    private final static int OP_CODE_DELETE_STORED_RECORDS = 2;
    private final static int OP_CODE_REPORT_NUMBER_OF_RECORDS = 4;
    private final static int OP_CODE_NUMBER_OF_STORED_RECORDS_RESPONSE = 5;
    private final static int OP_CODE_RESPONSE_CODE = 6;
    private final static int COMPLETE_RESULT_FROM_METER = 192;

    private final static int OPERATOR_NULL = 0;
    private final static int OPERATOR_ALL_RECORDS = 1;
    private final static int OPERATOR_LESS_OR_EQUAL_RECORDS = 2;
    private final static int OPERATOR_GREATER_OR_EQUAL_RECORDS = 3;
    private final static int OPERATOR_WITHING_RANGE = 4;
    private final static int OPERATOR_FIRST_RECORD = 5;
    private final static int OPERATOR_LAST_RECORD = 6;

    private final static int FILTER_TYPE_SEQUENCE_NUMBER = 1;
    private final static int RESPONSE_SUCCESS = 1;
    private final static int RESPONSE_OP_CODE_NOT_SUPPORTED = 2;
    private final static int RESPONSE_NO_RECORDS_FOUND = 6;
    private final static int RESPONSE_ABORT_UNSUCCESSFUL = 7;
    private final static int RESPONSE_PROCEDURE_NOT_COMPLETED = 8;
    private final static int SOFTWARE_REVISION_BASE = 1, SOFTWARE_REVISION_1 = 1, SOFTWARE_REVISION_2 = 0; // base:
    // custom
    // profile
    // version
    // Event names
    private static final String BT_ENABLED = "bluetoothEnabled";
    private static final String BT_DISABLED = "bluetoothDisabled";
    private static final String CONN_SUCCESS = "connectionSuccess";
    private static final String CONN_FAILED = "connectionFailed";
    private static final String CONN_LOST = "connectionLost";
    private static final String DEVICE_READ = "read";
    private static final String DATA_READ = "data";
    private static final String ERROR = "error";
    private static final String FOUNDED_DEVICE = "foundedDevice";
    private static final String DEVICE_CONNECTED = "deviceConnected";
    private static final String DEVICE_DISCONNECTED = "deviceDisconnected";
    private static final String TOTAL_COUNT = "totalCount";
    private static final String DATA_DOWNLOADED = "dataDownloaded";
    private static final String TIME_SYNCRONIZED = "timeSyncronized";
    private static final String LAST_DATA_DOWNLOADED = "lastDataDownloaded";
    private static final String LAST_DATA_NOT_SUPPORT = "lastDataNotSupport";
    // Other stuff
    private static final int REQUEST_ENABLE_BLUETOOTH = 1;
    private static final int REQUEST_PAIR_DEVICE = 2;
    private static final String FIRST_DEVICE = "firstDevice";
    
	// Members
    private BluetoothGatt mBluetoothGatt;
    private BluetoothGattCharacteristic mGlucoseMeasurementCharacteristic;
    private BluetoothGattCharacteristic mGlucoseMeasurementContextCharacteristic;
    private BluetoothGattCharacteristic mRACPCharacteristic;
    private BluetoothGattCharacteristic mDeviceSerialCharacteristic;
    private BluetoothGattCharacteristic mDeviceSoftwareRevisionCharacteristic;
    private BluetoothGattCharacteristic mCustomTimeCharacteristic;

    private String mBluetoothDeviceAddress;

    private final ArrayList<GlucoseRecord> mRecords = new ArrayList<GlucoseRecord>();
    private String _serialNumber, _software_ver, _sequenceNumber = "", _afterIndex;
    private int _lastSequenceNumber = 0;
    private int fullVersion;
    private int _version_1;
    private int _version_2;
    private int _totalCount = 0;
    private int _count = 0;
    private boolean _founded = false;
    
    public enum DownloadType {
        ALL, AFTER, LAST
    }
    private DownloadType downloadType;
    private boolean _autoRead = false;
    private boolean _useLastRecord = true;
    private long _timeOperation = 0;
    private long _timeFound = 0;

    private final BluetoothGattCallback mGattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(final BluetoothGatt gatt, final int status, final int newState) {
            if (status == 133 || status == 129) return;  //ignore GATT_ERROR or GATT_INTERNAL_ERROR
            /*
            if ((status == 0 || status == 19 || status == 8) && newState == BluetoothProfile.STATE_DISCONNECTED) {
                close();
                // 여기서 다시 StartScanFunc 시도해 볼까???
                //-----------------------★★
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                        e.printStackTrace();
                }


                //--------------------★★
            }
            */
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                if (D)
                    Log.d("여기:","STATE_CONNECTED▷▷▶;");
               
                mBluetoothGatt = gatt;
                broadcastUpdate(Const.INTENT_BLE_DEVICE_CONNECTED, "");
                gatt.discoverServices();

                WritableMap device = deviceToWritableMap(mRawDevice);
                WritableMap params = Arguments.createMap();
                params.putMap("device", device);
                sendEvent(DEVICE_CONNECTED, params);

            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                if (D)
                    Log.d("여기:","INTENT_BLE_DEVICE_DISCONNECTED;");
                WritableMap device = deviceToWritableMap(mRawDevice);
                WritableMap params = Arguments.createMap();
                params.putMap("device", device);
                sendEvent(DEVICE_DISCONNECTED, params);

                broadcastUpdate(Const.INTENT_BLE_DEVICE_DISCONNECTED, "");
            }

        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                initCharacteristics();
                broadcastUpdate(Const.INTENT_BLE_SERVICE_DISCOVERED, "");
                for (BluetoothGattService service : gatt.getServices()) {
                    if (Const.BLE_SERVICE_GLUCOSE.equals(service.getUuid())) { // 1808
                        if (D)
                            Log.d("여기:","1808;");
                        mGlucoseMeasurementCharacteristic = service
                                .getCharacteristic(Const.BLE_CHAR_GLUCOSE_MEASUREMENT); // 2A18
                        mGlucoseMeasurementContextCharacteristic = service
                                .getCharacteristic(Const.BLE_CHAR_GLUCOSE_CONTEXT); // 2A34
                        mRACPCharacteristic = service.getCharacteristic(Const.BLE_CHAR_RACP);// 2A52
                        
                    } else if (Const.BLE_SERVICE_DEVICE_INFO.equals(service.getUuid())) { // 180A
                        if (D)
                            Log.d("여기:","180A;");
                        mDeviceSerialCharacteristic = service.getCharacteristic(Const.BLE_CHAR_DEVICE_INFO_SERIALNO);// 2A25
                        mDeviceSoftwareRevisionCharacteristic = service
                                .getCharacteristic(Const.BLE_CHAR_DEVICE_INFO_SOFTWARE_REVISION); // 2A28
                    } else if (Const.BLE_SERVICE_CUSTOM_TIME.equals(service.getUuid())) {// FFF0
                        if (D)
                            Log.d("여기:","FFF0;");
                        mCustomTimeCharacteristic = service.getCharacteristic(Const.BLE_CHAR_CUSTOM_TIME);// FFF1
                        if (mCustomTimeCharacteristic != null)
                            gatt.setCharacteristicNotification(mCustomTimeCharacteristic, true);
                    } else if (Const.BLE_SERVICE_CUSTOM_TIME_NEW.equals(service.getUuid())) { // A010
                        if (D)
                            Log.d("여기:","A010;");
                        mCustomTimeCharacteristic = service.getCharacteristic(Const.BLE_CHAR_CUSTOM_TIME_NEW); // A3BC
                        if (mCustomTimeCharacteristic != null)
                            gatt.setCharacteristicNotification(mCustomTimeCharacteristic, true);
                    }
                }
                // Validate the device for required characteristics
                if (mGlucoseMeasurementCharacteristic == null || mRACPCharacteristic == null) {
                    if (mGlucoseMeasurementCharacteristic == null)
                        broadcastUpdate("mGlucoseMeasurementCharacteristic == null", "");
                    else
                        broadcastUpdate("mRACPCharacteristic == null", "");
                    // broadcastUpdate(Const.INTENT_BLE_DEVICE_NOT_SUPPORTED, "");
                    return;
                }

                if (mDeviceSoftwareRevisionCharacteristic != null) {
                    readDeviceSoftwareRevision(gatt);
                }

            } else {
                broadcastUpdate(Const.INTENT_BLE_ERROR, mReactContext.getResources().getString(R.string.ERROR_DISCOVERY_SERVICE) + " (" + status + ")");
                if (D)
                    Log.d("여기:", "INTENT_BLE_ERROR:  "+ Const.INTENT_BLE_ERROR);            
            }
        };

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                if (Const.BLE_CHAR_DEVICE_INFO_SOFTWARE_REVISION.equals(characteristic.getUuid())) { // 2A28
                    String softwareVersions[] = characteristic.getStringValue(0).split("\\.");
                    if (characteristic.getStringValue(0) != "")
                        _version_1 = Integer.parseInt(softwareVersions[0]);
                    if (softwareVersions.length> 1 && softwareVersions[1] != "")
                        _version_2 = Integer.parseInt(softwareVersions[1]);
                    fullVersion = 10 * _version_1 + _version_2;
                    if (D)
                        Log.d("여기", "fullVersion=" + fullVersion);
                    
                    broadcastUpdate(Const.INTENT_BLE_SOFTWARE_VERSION, characteristic.getStringValue(0));
                    if (_version_1 > SOFTWARE_REVISION_1) {  //If the version is greater than the supported version, disconnect
                        broadcastUpdate(Const.INTENT_BLE_READ_SOFTWARE_REV, characteristic.getStringValue(0));
                        gatt.disconnect();
                        return;
                    } else if (_version_1 >= SOFTWARE_REVISION_BASE && _version_1 == SOFTWARE_REVISION_1) {   //If the version is greater than or equal to base version AND is the same as the supported version
                        
                        if (mCustomTimeCharacteristic == null) {     //  'custom time characteristic' must be present. (OR disconnect)
                            gatt.disconnect();
                            return;
                        }
                        
                    }

                    if (mDeviceSerialCharacteristic != null) {
                        // ###5. READ SERIAL NO of DEVICE
                        readDeviceSerial(gatt);
                    }
                } else if (Const.BLE_CHAR_DEVICE_INFO_SERIALNO.equals(characteristic.getUuid())) { // 2A25
                    
                    _serialNumber = characteristic.getStringValue(0);
                    if (D)
                        Log.d(TAG, "serial_text = " + _serialNumber);
                    final int last_seq = getPreference(_serialNumber);
                    //결과는 한번만 업데이트 하는걸로 ..초기화 변수
                    _sequenceNumber = String.valueOf(last_seq); //★★★
                    
					if (_version_1 > SOFTWARE_REVISION_1 || _version_1 < SOFTWARE_REVISION_1) {
                        if (D)
                            Log.d("-- disconnect", " -- revision");
                        if (gatt != null)
                            gatt.disconnect();
                        return;
                    }
                    if (D)
                        Log.d(TAG, gatt.getDevice().getName() + " ------- eeeeee");
                    _founded = true;
                    if (D) {
                        Log.d("여기:last_seq▶", String.valueOf(last_seq));
                        Log.d("여기:serial_num▶", _serialNumber);
                    }
                    
                    WritableMap params = Arguments.createMap();
                    WritableMap deviceMap = deviceToWritableMap(gatt.getDevice());
                    params.putMap("device", deviceMap);
                    params.putString("serialNumber", _serialNumber);
                    params.putString("sequenceNumber", _sequenceNumber);
                    params.putDouble("timeFound", (System.currentTimeMillis() - _timeFound) / 1000.0);
                    sendEvent(FOUNDED_DEVICE, params);
                    
                    enableRecordAccessControlPointIndication(gatt);
                }
            }
        };

        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                if (Const.BLE_CHAR_GLUCOSE_MEASUREMENT.equals(descriptor.getCharacteristic().getUuid())) { // 2A18
                    if (D)
                        Log.d("여기:", "BLE_CHAR_GLUCOSE_MEASUREMENT:  " );
                    if (mCustomTimeCharacteristic != null) {
                        // ###9. ENABLE TIME SYNC
                        enableTimeSyncIndication(gatt);
                    }
                    if (mCustomTimeCharacteristic == null)
                        enableGlucoseContextNotification(gatt);
                }
                if (Const.BLE_CHAR_GLUCOSE_CONTEXT.equals(descriptor.getCharacteristic().getUuid())) { // 2A34
                    if (D)
                        Log.d("여기:", "Const.BLE_CHAR_GLUCOSE_CONTEXT:  " );
                    if (mCustomTimeCharacteristic != null) 
                        enableTimeSyncIndication(gatt);
                    broadcastUpdate(Const.INTENT_BLE_CHAR_GLUCOSE_CONTEXT, "");
                }
                if (Const.BLE_CHAR_RACP.equals(descriptor.getCharacteristic().getUuid())) { // 2A52
                    if (D)
                        Log.d("여기:", "Const.BLE_CHAR_RACP:  " );
                    enableGlucoseMeasurementNotification(gatt);
                }
                if (Const.BLE_CHAR_CUSTOM_TIME.equals(descriptor.getCharacteristic().getUuid()) ||
                mCustomTimeCharacteristic.getUuid().equals(Const.BLE_CHAR_CUSTOM_TIME_NEW)) { //FFF1, A3BC
                    if (D)
                        Log.d("여기:", "BLE_CHAR_CUSTOM_TIME:  " );
                    broadcastUpdate(Const.INTENT_BLE_TOTAL_COUNT, "");
                }
            } else if (status == BluetoothGatt.GATT_INSUFFICIENT_AUTHENTICATION) {
                if (D)
                    Log.d("여기:", "GATT_INSUFFICIENT_AUTHENTICATION:  " );
                if (gatt.getDevice().getBondState() != BluetoothDevice.BOND_NONE) {
                    broadcastUpdate(Const.INTENT_BLE_ERROR,
                            mReactContext.getResources().getString(R.string.ERROR_AUTH_ERROR_WHILE_BONDED) + " ("
                                    + status + ")");
                }
            }
        };

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            final UUID uuid = characteristic.getUuid();
            if (D) {
                Log.d("여기:","★onCharacteristicChanged★"   );
                Log.d("여기:--  char", characteristic.getUuid().toString());
                Log.d("여기:--  value", characteristic.getValue().toString());
                
            }
            
            if (Const.BLE_CHAR_CUSTOM_TIME.equals(uuid) || Const.BLE_CHAR_CUSTOM_TIME_NEW.equals(uuid)) { //FFF1, A3BC
                if (D)
                    Log.d("여기:▷☞","Const.BLE_CHAR_CUSTOM_TIME.equals(uuid) or Const.BLE_CHAR_CUSTOM_TIME_NEW.equals(uuid)");
                int offset = 0;
                final int opCode = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset);
                offset += 2; // skip the operator

                if (opCode == OP_CODE_NUMBER_OF_STORED_RECORDS_RESPONSE) { // 05: time result
                    // broadcastUpdate(Const.INTENT_BLE_TOTAL_COUNT, "");
                }
            } else if (Const.BLE_CHAR_GLUCOSE_MEASUREMENT.equals(uuid)) { //2A18   ◀◀◀ 이건멀까?
                if (D)
                    Log.d("여기:▷☞1","Const.BLE_CHAR_GLUCOSE_MEASUREMENT.equals(uuid) "+uuid.toString());
                int offset = 0;
                final int flags = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset);
                offset += 1;

                final boolean timeOffsetPresent = (flags & 0x01) > 0;
                final boolean typeAndLocationPresent = (flags & 0x02) > 0;
                final boolean sensorStatusAnnunciationPresent = (flags & 0x08) > 0;
                final boolean contextInfoFollows = (flags & 0x10) > 0;

                final GlucoseRecord record = new GlucoseRecord();
                record.sequenceNumber = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16, offset);
                record.flag_context = 0;
                offset += 2;

                final int year = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16, offset + 0);
                final int month = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset + 2);
                final int day = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset + 3);
                final int hours = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset + 4);
                final int minutes = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset + 5);
                final int seconds = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset + 6);
                offset += 7;

                final Calendar calendar = Calendar.getInstance();
                calendar.set(year, month - 1, day, hours, minutes, seconds);
                
                record.time = calendar.getTimeInMillis() / 1000;
                
                if (timeOffsetPresent) {
                    record.timeoffset = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_SINT16, offset);
                    record.time = record.time + (record.timeoffset * 60);
                    offset += 2;
                }
                long recordDate = record.time;
                if (typeAndLocationPresent) {
                    byte[] value = characteristic.getValue();
                    record.glucoseData = (int) bytesToFloat(value[offset], value[offset + 1]);
                    final int typeAndLocation = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8,
                            offset + 2);
                    int type = (typeAndLocation & 0xF0) >> 4;
                    record.flag_cs = type == 10 ? 1 : 0;
                    offset += 3;
                }

                if (sensorStatusAnnunciationPresent) {
                    int hilow = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16, offset);
                    if (hilow == 64)
                        record.flag_hilow = -1;// lo
                    if (hilow == 32)
                        record.flag_hilow = 1;// hi

                    offset += 2;
                }

                if (contextInfoFollows == false) {
                    record.flag_context = 1;
                }
                String str_hilow = "-";
                if (record.flag_hilow == -1)
                    str_hilow = "Lo";
                else if (record.flag_hilow == 1)
                    str_hilow = "Hi";

                mRecords.add(record);
                if (D)
                    Log.d("여기:","▶▶▶▶▶▶▶▶"+ "### sequence::: " + record.sequenceNumber + "," + " glucose: " + record.glucoseData +
                                "," + " date: " + getDate(record.time) + "," + " timeoffset: " + record.timeoffset +
                                "," + " hilo: " + str_hilow + "\n\n");
                        
                //★★★★
                _sequenceNumber =String.valueOf(record.sequenceNumber);
                
                WritableMap params = Arguments.createMap();
                params.putInt("glucoseData", record.glucoseData);
                params.putInt("sequenceNumber", record.sequenceNumber);
                params.putString("time", "" + record.time);
                params.putString("serialNumber", _serialNumber);
                params.putDouble("measureTime", (System.currentTimeMillis() - _timeOperation) / 1000.0);
                if (D)
                    Log.d("여기~~~~~", "serialNumber=" + _serialNumber);
                if (_useLastRecord)
                    sendEvent(LAST_DATA_DOWNLOADED, params);
                else if (!_autoRead)
                    sendEvent(DATA_DOWNLOADED, params);
                   
                if (record.sequenceNumber > _lastSequenceNumber) {
                    _lastSequenceNumber = record.sequenceNumber;
                    setPreference(_serialNumber, record.sequenceNumber);
                }

            } else if (Const.BLE_CHAR_GLUCOSE_CONTEXT.equals(uuid)) { //2A34  ◀◀◀ 이건멀까?
                if (D)
                    Log.d("여기:▷☞2","Const.BLE_CHAR_GLUCOSE_CONTEXT.equals(uuid) "+uuid.toString());
                int offset = 0;
                final int flags = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset);
                offset += 1;

                final boolean carbohydratePresent = (flags & 0x01) > 0;
                final boolean mealPresent = (flags & 0x02) > 0;
                final boolean moreFlagsPresent = (flags & 0x80) > 0;

                final int sequenceNumber = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16,
                        offset);
                offset += 2;

                if (moreFlagsPresent)
                    offset += 1;

                if (carbohydratePresent)
                    offset += 3;

                final int meal = mealPresent == true
                        ? characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset)
                        : -1;

            } else if (Const.BLE_CHAR_RACP.equals(uuid)) { // Record Access Control Point characteristic 2A52
                int offset = 0;
                final int opCode = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset);
                offset += 2; // skip the operator

                if (opCode == COMPLETE_RESULT_FROM_METER) { // C0
                    final int requestedOpCode = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8,
                            offset - 1);
                    switch (requestedOpCode) {
                        case RESPONSE_SUCCESS: // 01
                            broadcastUpdate(Const.INTENT_BLE_READ_COMPLETED, "");
                            // mBluetoothGatt.writeCharacteristic(characteristic);
                            //########################################  혹시 여긴가 ??? 중국쪽 sucess 나오고 처리가 않되는것이 ############################################################
                            if (D)
                                Log.d("여기:♥♥♥♥♥♥♥♥♥♥3",  " 처리안함!!! ▶seq"+_sequenceNumber +"  ▶값  "/*+pMzvalue */);
                            //따라서 두개가 일치 할때만 결과처리 하면 된다!!

                            //########################################  혹시 여긴가 ??? 중국쪽 sucess 나오고 처리가 않되는것이 ############################################################
                            break;
                        case RESPONSE_OP_CODE_NOT_SUPPORTED: // 02
                            break;
                    }
                } else if (opCode == OP_CODE_NUMBER_OF_STORED_RECORDS_RESPONSE) { // 05
                    if (D)
                        Log.d("여기:", "OP_CODE_NUMBER_OF_STORED_RECORDS_RESPONSE:  " );

                    if (mBluetoothGatt == null || mRACPCharacteristic == null) {
                        // broadcastUpdate(Const.INTENT_BLE_ERROR,
                        // mReactContext.getResources().getString(R.string.ERROR_CONNECTION_STATE_CHANGE));
                        return;
                    }
                    
                    _totalCount = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16, offset);
                    if (D)
                        Log.d("여기:","_txt_total_count▷▷▶"+ String.valueOf(_totalCount));
                    
                    //★★★여기서 해야 하지 않을까???
                    /*
                    try {
                        Thread.sleep(50);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    */
                    //★★★
                    if (!_autoRead)
                    {
                        WritableMap params = Arguments.createMap();
                        WritableMap device = deviceToWritableMap(gatt.getDevice());
                        params.putMap("device", device);
                        params.putInt("totalCount", _totalCount);
                        sendEvent(TOTAL_COUNT, params);
                        return;
                    }
                        
                    // ??????????????????????????????? 왜 폭주먹을가??????
                    downloadType = DownloadType.LAST;
                    clear();

                    _lastSequenceNumber = getPreference(_serialNumber);
                    int num = Math.max(_lastSequenceNumber, _totalCount);

                    _afterIndex = Integer.toString(num);
                    if (_useLastRecord) {
                        if (D)
                            Log.d("여기:","INTENT_BLE_READ_LAST▶"+ _totalCount);
                        broadcastUpdate(Const.INTENT_BLE_READ_LAST, "");
                        
                    } else {
                        if (D)
                            Log.d("여기:","INTENT_BLE_READAFTER▶"+ _totalCount);
                        broadcastUpdate(Const.INTENT_BLE_READ_AFTER, Integer.toString(num));
                    }
                    offset += 2;
                } else if (opCode == OP_CODE_RESPONSE_CODE) { // 06
                    if (D)
                        Log.d("여기:", "OP_CODE_RESPONSE_CODE:  " );
                    final int subResponseCode = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset);
                    final int responseCode = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, offset + 1);
                    offset += 2;

                    switch (responseCode) {
                        case RESPONSE_SUCCESS:
                            break;
                        case RESPONSE_NO_RECORDS_FOUND: // 06000106
                            // android 6.0.1 issue - app disconnect send
                            // mBluetoothGatt.writeCharacteristic(characteristic);
                            broadcastUpdate(Const.INTENT_BLE_READ_COMPLETED, "");

                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                try {
                                    Thread.sleep(100);
                                    //mBluetoothGatt.disconnect();
                                } catch (InterruptedException e) {
                                    e.printStackTrace();
                                }
                            } else {
                                try {
                                    Thread.sleep(100);
                                    //mBluetoothGatt.writeCharacteristic(characteristic);
                                } catch (InterruptedException e) {
                                    e.printStackTrace();
                                }
                            }
                            break;
                        case RESPONSE_OP_CODE_NOT_SUPPORTED:
                            broadcastUpdate(Const.INTENT_BLE_OPERATE_NOT_SUPPORTED, "");
                            break;
                        case RESPONSE_PROCEDURE_NOT_COMPLETED:
                            if (D)
                                Log.d("여기:", "RESPONSE_PROCEDURE_NOT_COMPLETED:  " );
                            break;
                        case RESPONSE_ABORT_UNSUCCESSFUL:
                        default:
                            broadcastUpdate(Const.INTENT_BLE_OPERATE_FAILED, "");
                            break;
                    }
                }
            }
        };

        private void readDeviceSoftwareRevision(final BluetoothGatt gatt) {
            gatt.readCharacteristic(mDeviceSoftwareRevisionCharacteristic);
        }

        private void readDeviceSerial(final BluetoothGatt gatt) {
            gatt.readCharacteristic(mDeviceSerialCharacteristic);
        }
    };
    private BroadcastReceiver mBondingBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(final Context context, final Intent intent) {
            final BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
            final int bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, -1);

            if (device == null || mBluetoothGatt == null) {
                return;
            }

            // skip other devices
            if (!device.getAddress().equals(mBluetoothGatt.getDevice().getAddress())) {
                return;
            }

            if (mBluetoothGatt == null) {
                return;
            }

            if (bondState == BluetoothDevice.BOND_BONDING) {
            } else if (bondState == BluetoothDevice.BOND_BONDED) {
                if (D)
                    Log.d("-- BOND_BONDED", " ------  1");
                broadcastUpdate(Const.INTENT_BLE_BONDED, device.getAddress());
                // [2016.06.10][leenain] After bonded, discover services.
                mBluetoothGatt.discoverServices();
            } else if (bondState == BluetoothDevice.BOND_NONE) {
                broadcastUpdate(Const.INTENT_BLE_BOND_NONE, "");
                if (D)
                    Log.d("-- close", " -- non bond");
                close();
            }
        }
    };
    private BluetoothAdapter.LeScanCallback mLEScanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord) {
            if (device != null) {
                try {
                    if (device.getBondState() == BluetoothDevice.BOND_BONDED) {
                        
                        _founded = true;
                        if (D) {
                            Log.d("-- BOND_BONDED", " ------  cccccc");
                        }
                        
                        WritableMap params = Arguments.createMap();
                        WritableMap deviceMap = deviceToWritableMap(device);
                        params.putMap("device", deviceMap);
                        params.putString("bounded", "true");
                        params.putDouble("timeFound", (System.currentTimeMillis() - _timeFound) / 1000.0);
                        sendEvent(FOUNDED_DEVICE, params);

                        //mBluetoothService.stop(device.getAddress());
                       

                    } else {
                        if (D) {
                            Log.d("-- BOND_NON_BONDED", " ------  dddddd");
                        }
                        
                        _founded = true;
                        WritableMap deviceMap = deviceToWritableMap(device);
                        WritableMap params = Arguments.createMap();
                        params.putMap("device", deviceMap);
                        params.putString("bounded", "false");
                        params.putDouble("timeFound", (System.currentTimeMillis() - _timeFound) / 1000.0);
                        sendEvent(FOUNDED_DEVICE, params);

                        mEnabledPromise.resolve(device);
                    }
                } catch (Exception e) {
                    e.getMessage();
                    // DebugLogger.e(TAG, "Invalid data in Advertisement packet " + e.toString());
                }
            }
        }
    };
    
    private final BroadcastReceiver mGattUpdateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            final String extraData = intent.getStringExtra(Const.INTENT_BLE_EXTRA_DATA);
            if (mRawDevice == null) {
                return;
            }
            String id = mRawDevice.getAddress();

            Promise promise = mConnectedPromises.get(id);
            if (D)
                Log.d(TAG, "**************** " + action);
            switch (action) {
                case Const.INTENT_BLE_CONNECT_DEVICE:
                    if (extraData != "") {
                        connect(extraData, true, true, promise);
                    }
                    break;
                case Const.INTENT_BLE_BOND_NONE:
                    disconnect(id, promise);
                    // 여기서 다시 StartScanFunc 시도해 볼까???
                    //-----------------------★★
                    try {
                        Thread.sleep(50);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    if (D) {
                        Log.d("여기:","Timeout onStartScanClickFunc(); START 안함");
                        //onStartScanClickFunc();
                        Log.d("여기:","Timeout onStartScanClickFunc() END 안함");
                    }
                   
                    break;
                   
                case Const.INTENT_BLE_DEVICE_CONNECTED:
                    break;
                case Const.INTENT_BLE_DEVICE_DISCONNECTED:
                    if (D)
                        Log.d("여기:","INTENT_BLE_DEVICE_DISCONNECTED");
                    break;
                case Const.INTENT_BLE_SERVICE_DISCOVERED:
                    clear();
                    if (D)
                        Log.d("여기:","INTENT_BLE_SERVICE_DISCOVERED");
                        break;
                case Const.INTENT_BLE_ERROR:
                    if (D)
                        Log.d("여기:","INTENT_BLE_ERROR");
                    break;
                case Const.INTENT_BLE_DEVICE_NOT_SUPPORTED:
                    if (D)
                        Log.d("여기:","INTENT_BLE_DEVICE_NOT_SUPPORTED");
                    break;
                case Const.INTENT_BLE_OPERATE_STARTED:
                    if (D)
                        Log.d("여기:","INTENT_BLE_OPERATE_STARTED");
                    break;
                case Const.INTENT_BLE_OPERATE_COMPLETED:
                    if (D)
                        Log.d("여기:","INTENT_BLE_OPERATE_COMPLETED");
                    break;
                case Const.INTENT_BLE_OPERATE_FAILED:
                    if (D)
                        Log.d("여기:","Download failed (Code 110)");
                    sendEvent(LAST_DATA_NOT_SUPPORT, null);
                    break;
                case Const.INTENT_BLE_OPERATE_NOT_SUPPORTED:
                    if (D)
                        Log.d("여기:","INTENT_BLE_OPERATE_NOT_SUPPORTED");
                    break;
                case Const.INTENT_BLE_DATASET_CHANGED:
                    if (D)
                        Log.d("여기:","INTENT_BLE_DATASET_CHANGED");
                    break;
                case Const.INTENT_BLE_READ_MANUFACTURER:
                    if (D)
                        Log.d("여기:","INTENT_BLE_READ_MANUFACTURER");
                    break;
                case Const.INTENT_BLE_READ_SOFTWARE_REV:
                    if (D)
                        Log.d("여기:","INTENT_BLE_READ_SOFTWARE_REV");
                    break;
                case Const.INTENT_BLE_SERIAL_NUMBER:
                    if (D)
                        Log.d("여기:","INTENT_BLE_SERIAL_NUMBER");
                    break;
                case Const.INTENT_BLE_RACP_INDICATION_ENABLED:
                    if (getCustomTimeSync() == false) {
                        try {
                            Thread.sleep(50);
                            getCustomTimeSync();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    } else {
                        Date date = new Date(System.currentTimeMillis());
                        SimpleDateFormat sdfNow = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                        String strNow = sdfNow.format(date);
                    }
                    if (D)
                        Log.d("여기:","INTENT_BLE_RACP_INDICATION_ENABLED");
                    break;
                case Const.INTENT_BLE_TOTAL_COUNT:
                    if (D)
                        Log.d(TAG, "request count");
                    if (getSequenceNumber() == false) {
                        try {
                            Thread.sleep(50);
                            getSequenceNumber();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }

                    break;
                case Const.INTENT_BLE_SEQUENCE_COMPLETED:

                    if (getSerialNumber() == null)
                        return;
                    requestBleAll();

                    break;
                case Const.INTENT_BLE_READ_AFTER:

                    if (getSerialNumber() == null)
                        return;
                    requestBleAfter();

                    break;
                case Const.INTENT_BLE_READ_LAST:

                    if (getSerialNumber() == null)
                        return;
                    requestBleLast();

                    break;
                case Const.INTENT_BLE_READ_COMPLETED:
                    if (downloadType == DownloadType.LAST) {
                        try {
                            Thread.sleep(50);
                            //mBluetoothGatt.disconnect();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                        int lastCount = mRecords.size() - 1;
                        if (lastCount > -1 && !_useLastRecord) {
                            
                            GlucoseRecord record = mRecords.get(lastCount);
                            WritableMap params = Arguments.createMap();
                            params.putInt("glucoseData", record.glucoseData);
                            params.putInt("sequenceNumber", record.sequenceNumber);
                            params.putString("time", "" + record.time);
                            params.putString("serialNumber", _serialNumber);
                            params.putDouble("measureTime", (System.currentTimeMillis() - _timeOperation) / 1000.0);
                            
                            sendEvent(LAST_DATA_DOWNLOADED, params);
                            
                        }
                        
                    }
                    break;
            }
        }
    };
    private BluetoothManager mBluetoothManager;
    private BluetoothAdapter mBluetoothAdapter;
    private CareSensService mBluetoothService;
    private ReactApplicationContext mReactContext;
    private BluetoothDevice mRawDevice;
    // Promises
    private Promise mEnabledPromise;
    private Promise mDeviceDiscoveryPromise;
    private Promise mPairDevicePromise;
    private HashMap<String, Promise> mConnectedPromises;
    private HashMap<String, StringBuffer> mBuffers;
    private HashMap<String, String> mDelimiters;
    
    public CareSensModule(ReactApplicationContext reactContext) {
        super(reactContext);

        if (D)
            Log.d(TAG, "Bluetooth module started");

        mReactContext = reactContext;

        boolean isBleAvailable = mReactContext.getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)
                ? true
                : false;
        if (isBleAvailable && runningOnKitkatOrHigher()) {
            mBluetoothManager = (BluetoothManager) mReactContext.getSystemService(Context.BLUETOOTH_SERVICE);
            if (mBluetoothManager != null)
                mBluetoothAdapter = mBluetoothManager.getAdapter();
            if (mBluetoothAdapter == null) {
                Toast.makeText(mReactContext, R.string.ValidationWarningPopup_31, Toast.LENGTH_SHORT).show();
                return;
            }
            if (D)
                Log.d(TAG, "-------------- register receiver");
            mReactContext.registerReceiver(mGattUpdateReceiver, makeGattUpdateIntentFilter());
        }

        if (mBluetoothService == null) {
            mBluetoothService = new CareSensService(this);
        }

        if (mConnectedPromises == null) {
            mConnectedPromises = new HashMap<>();
        }

        if (mBuffers == null) {
            mBuffers = new HashMap<>();
        }

        if (mDelimiters == null) {
            mDelimiters = new HashMap<>();
        }

        if (mBluetoothAdapter != null && mBluetoothAdapter.isEnabled()) {
            sendEvent(BT_ENABLED, null);
        } else {
            sendEvent(BT_DISABLED, null);
        }

        mReactContext.addActivityEventListener(this);
        mReactContext.addLifecycleEventListener(this);
        registerBluetoothStateReceiver();
    }

    public String getSerialNumber() {
        return _serialNumber;
    }

    private static IntentFilter makeGattUpdateIntentFilter() {
        final IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(Const.INTENT_BLE_EXTRA_DATA);
        intentFilter.addAction(Const.INTENT_BLE_CONNECT_DEVICE);
        intentFilter.addAction(Const.INTENT_BLE_BOND_NONE);
        intentFilter.addAction(Const.INTENT_BLE_BONDED);
        intentFilter.addAction(Const.INTENT_BLE_DEVICE_CONNECTED);
        intentFilter.addAction(Const.INTENT_BLE_DEVICE_DISCONNECTED);
        intentFilter.addAction(Const.INTENT_BLE_SERVICE_DISCOVERED);
        intentFilter.addAction(Const.INTENT_BLE_ERROR);
        intentFilter.addAction(Const.INTENT_BLE_DEVICE_NOT_SUPPORTED);
        intentFilter.addAction(Const.INTENT_BLE_OPERATE_STARTED);
        intentFilter.addAction(Const.INTENT_BLE_OPERATE_COMPLETED);
        intentFilter.addAction(Const.INTENT_BLE_OPERATE_FAILED);
        intentFilter.addAction(Const.INTENT_BLE_OPERATE_NOT_SUPPORTED);
        intentFilter.addAction(Const.INTENT_BLE_DATASET_CHANGED);
        intentFilter.addAction(Const.INTENT_BLE_RACP_INDICATION_ENABLED);
        intentFilter.addAction(Const.INTENT_BLE_READ_MANUFACTURER);
        intentFilter.addAction(Const.INTENT_BLE_READ_SOFTWARE_REV);
        intentFilter.addAction(Const.INTENT_BLE_SERIAL_NUMBER);
        intentFilter.addAction(Const.INTENT_BLE_READ_COMPLETED);
        intentFilter.addAction(Const.INTENT_BLE_SEQUENCE_COMPLETED);
        intentFilter.addAction(Const.INTENT_BLE_TOTAL_COUNT);
        intentFilter.addAction(Const.INTENT_BLE_READ_AFTER);
        intentFilter.addAction(Const.INTENT_BLE_READ_LAST);
        intentFilter.addAction(Const.INTENT_BLE_SOFTWARE_VERSION);
        return intentFilter;
    }

    public void clear() {
        mRecords.clear();
        broadcastUpdate(Const.INTENT_BLE_DATASET_CHANGED, "");
    }

    private void close() {
        if (D)
            Log.d("-- close", " -- close");
        if (mBluetoothGatt != null)
            mBluetoothGatt.close();
        if (mRecords != null)
            mRecords.clear();

        mGlucoseMeasurementCharacteristic = null;
        mGlucoseMeasurementContextCharacteristic = null;
        mRACPCharacteristic = null;
        mDeviceSerialCharacteristic = null;
        mBluetoothGatt = null;
    }

    private void enableGlucoseMeasurementNotification(final BluetoothGatt gatt) {
        if (mGlucoseMeasurementCharacteristic == null)
            return;

        gatt.setCharacteristicNotification(mGlucoseMeasurementCharacteristic, true);
        final BluetoothGattDescriptor descriptor = mGlucoseMeasurementCharacteristic
                .getDescriptor(Const.BLE_DESCRIPTOR);
        descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        gatt.writeDescriptor(descriptor);
    }

    private void enableGlucoseContextNotification(final BluetoothGatt gatt) {
        if (mGlucoseMeasurementContextCharacteristic == null)
            return;

        gatt.setCharacteristicNotification(mGlucoseMeasurementContextCharacteristic, true);
        final BluetoothGattDescriptor descriptor = mGlucoseMeasurementContextCharacteristic
                .getDescriptor(Const.BLE_DESCRIPTOR);
        descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        gatt.writeDescriptor(descriptor);
    }

    private void enableTimeSyncIndication(final BluetoothGatt gatt) {
        if (mCustomTimeCharacteristic == null)
            return;
        if (D)
            Log.d(TAG, "enableTimeSyncIndication");
        gatt.setCharacteristicNotification(mCustomTimeCharacteristic, true);
        final BluetoothGattDescriptor descriptor = mCustomTimeCharacteristic.getDescriptor(Const.BLE_DESCRIPTOR);
        descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        gatt.writeDescriptor(descriptor);
    }

    private boolean getCustomTimeSync() {
        if (D)
            Log.d(TAG, "--------------- start syncTime");
        if (mBluetoothGatt == null || mRACPCharacteristic == null) {
            // broadcastUpdate(Const.INTENT_BLE_ERROR,
            // mReactContext.getResources().getString(R.string.ERROR_CONNECTION_STATE_CHANGE)
            // + "null");
            if (D)
                Log.d(TAG, "--------------- faild syncTime because mBluetoothGatt == null");

            return false;
        }

        clear();
        broadcastUpdate(Const.INTENT_BLE_OPERATE_STARTED, "");

        setCustomTimeSync(mCustomTimeCharacteristic);

        boolean result = mBluetoothGatt.writeCharacteristic(mCustomTimeCharacteristic);
        if (D)
            Log.d(TAG, "--------------- result of syncTime = " + result);
        WritableMap params = Arguments.createMap();
        params.putBoolean("result", result);
       
        sendEvent(TIME_SYNCRONIZED, params);
        return result;
    }

    private void setCustomTimeSync(final BluetoothGattCharacteristic characteristic) {
        if (D)
            Log.d(TAG, "--------------- start syncTime setCustomTimeSync");
        if (characteristic == null) {
            if (D)
                Log.d(TAG, "--------------- failed syncTime setCustomTimeSync");
            return;
        }
 
        Calendar currCal = new GregorianCalendar();

        byte bCurrYear1 = (byte) (currCal.get(Calendar.YEAR) & 0xff);
        byte bCurrYear2 = (byte) ((currCal.get(Calendar.YEAR) >> 8) & 0xff);
        byte bCurrMonth = (byte) ((currCal.get(Calendar.MONTH) + 1) & 0xff);
        byte bCurrDay = (byte) (currCal.get(Calendar.DAY_OF_MONTH) & 0xff);
        byte bCurrHour = (byte) (currCal.get(Calendar.HOUR_OF_DAY) & 0xff);
        byte bCurrMin = (byte) (currCal.get(Calendar.MINUTE) & 0xff);
        byte bCurrSec = (byte) (currCal.get(Calendar.SECOND) & 0xff);

        byte op_code_1 = (byte) ((byte) COMPLETE_RESULT_FROM_METER & 0xff);
        byte[] data = {op_code_1, 0x03, 0x01, 0x00, bCurrYear1, bCurrYear2, bCurrMonth, bCurrDay, bCurrHour, bCurrMin,
                bCurrSec};

        characteristic.setValue(new byte[data.length]);

        for (int i = 0; i < data.length; i++) {
            characteristic.setValue(data);
        }
        if (D)
            Log.d(TAG, "--------------- end syncTime setCustomTimeSync");
    }

    private int getPreference(String key) {
        SharedPreferences pref = mReactContext.getSharedPreferences("pref", Context.MODE_PRIVATE);
        return pref.getInt(key, 0);
    }

    private void setPreference(String key, int value) {
        SharedPreferences pref = mReactContext.getSharedPreferences("pref", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putInt(key, value);
        editor.commit();
    }

    private static boolean runningOnKitkatOrHigher() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;
    }

    private boolean isBLEEnabled() {
        final BluetoothAdapter adapter = mBluetoothManager.getAdapter();
        return adapter != null && adapter.isEnabled();
    }

    private void initCharacteristics() {
        mGlucoseMeasurementCharacteristic = null;
        mGlucoseMeasurementContextCharacteristic = null;
        mRACPCharacteristic = null;
        mDeviceSerialCharacteristic = null;
        mDeviceSoftwareRevisionCharacteristic = null;
        mCustomTimeCharacteristic = null;
    }

    private void enableRecordAccessControlPointIndication(final BluetoothGatt gatt) {
        if (mRACPCharacteristic == null)
            return;

        gatt.setCharacteristicNotification(mRACPCharacteristic, true);
        final BluetoothGattDescriptor descriptor = mRACPCharacteristic.getDescriptor(Const.BLE_DESCRIPTOR);
        descriptor.setValue(BluetoothGattDescriptor.ENABLE_INDICATION_VALUE);
        gatt.writeDescriptor(descriptor);
    }

    private boolean refreshDeviceCache(BluetoothGatt gatt) {
        try {
            BluetoothGatt localBluetoothGatt = gatt;
            Method localMethod = localBluetoothGatt.getClass().getMethod("refresh", new Class[0]);
            if (localMethod != null) {
                boolean bool = ((Boolean) localMethod.invoke(localBluetoothGatt, new Object[0])).booleanValue();
                return bool;
            }

        } catch (Exception localException) {
            Log.d("exception", "refreshing device");
        }
        return false;
    }

    
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DEFAULT_SERVICES, Arguments.createArray());
        return constants;
    }

    @Override
    public String getName() {
        return "CareSens";
    }

    // @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (D)
            Log.d(TAG, "On activity result request: " + requestCode + ", result: " + resultCode);

        if (requestCode == REQUEST_ENABLE_BLUETOOTH) {
            if (resultCode == Activity.RESULT_OK) {
                if (D)
                    Log.d(TAG, "User enabled Bluetooth");
                if (mEnabledPromise != null) {
                    mEnabledPromise.resolve(true);
                    mEnabledPromise = null;
                }
            } else {
                if (D)
                    Log.d(TAG, "User did not enable Bluetooth");
                if (mEnabledPromise != null) {
                    mEnabledPromise.reject(new Exception("User did not enable Bluetooth"));
                    mEnabledPromise = null;
                }
            }
        }

        if (requestCode == REQUEST_PAIR_DEVICE) {
            if (resultCode == Activity.RESULT_OK) {
                if (D)
                    Log.d(TAG, "Pairing ok");
            } else {
                if (D)
                    Log.d(TAG, "Pairing failed");
            }
        }
    }

    // @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (D)
            Log.d(TAG, "On activity result request: " + requestCode + ", result: " + resultCode);

        if (requestCode == REQUEST_ENABLE_BLUETOOTH) {
            if (resultCode == Activity.RESULT_OK) {
                if (D)
                    Log.d(TAG, "User enabled Bluetooth");
                if (mEnabledPromise != null) {
                    mEnabledPromise.resolve(true);
                    mEnabledPromise = null;
                }
            } else {
                if (D)
                    Log.d(TAG, "User did not enable Bluetooth");
                if (mEnabledPromise != null) {
                    mEnabledPromise.reject(new Exception("User did not enable Bluetooth"));
                    mEnabledPromise = null;
                }
            }
        }

        if (requestCode == REQUEST_PAIR_DEVICE) {
            if (resultCode == Activity.RESULT_OK) {
                if (D)
                    Log.d(TAG, "Pairing ok");
            } else {
                if (D)
                    Log.d(TAG, "Pairing failed");
            }
        }
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private void initCallbackLollipop() {
        if (scanCallback != null) {
            if (D)
                Log.d(TAG, "scanCallback != null");
            return;
        }

        this.scanCallback = new ScanCallback() {
            @Override
            public void onScanResult(int callbackType, ScanResult result) {
                super.onScanResult(callbackType, result);
                if (result != null) {
                    try {
                        if (ScannerServiceParser.decodeDeviceAdvData(result.getScanRecord().getBytes())) {
                            if (result.getDevice().getBondState() == BluetoothDevice.BOND_BONDED) {
                                if (D) {
                                    Log.d("-- result.getDevice().getBondState() == BluetoothDevice.BOND_BONDED", " ------  aaaaaa");
                                }
                                
                                _founded = true;
                               
                                WritableMap params = Arguments.createMap();
                                WritableMap deviceMap = deviceToWritableMap(result.getDevice());
                                params.putMap("device", deviceMap);
                                params.putString("bounded", "true");
                                params.putDouble("timeFound", (System.currentTimeMillis() - _timeFound) / 1000.0);
                                sendEvent(FOUNDED_DEVICE, params);
                                if (mBluetoothGatt != null)
                                    mBluetoothGatt.disconnect();
                                
                            } else {                         
                                _founded = true;
                                if (D)
                                    Log.d(TAG, result.getDevice().getName() + " ------- bbbbbb");
                                WritableMap params = Arguments.createMap();
                                WritableMap deviceMap = deviceToWritableMap(result.getDevice());
                                params.putMap("device", deviceMap);
                                params.putString("bounded", "false");
                                params.putDouble("timeFound", (System.currentTimeMillis() - _timeFound) / 1000.0);
                                sendEvent(FOUNDED_DEVICE, params);
                            }
                        }
                    } catch (Exception e) {
                        if (D)
                            Log.d(TAG, "onScanResult => " + e.toString());
                    }
                }
            }

            @Override
            public void onBatchScanResults(List<ScanResult> results) {
                super.onBatchScanResults(results);
            }

            @Override
            public void onScanFailed(int errorCode) {
                super.onScanFailed(errorCode);
                // mEnabledPromise.reject(new Exception("error : " + errorCode));
                if (D)
                    Log.d(TAG, "error : " + errorCode);
            }
        };

    }

    private boolean _isScanning = false;

    @Override
    public void onHostDestroy() {
        if (D)
            Log.d(TAG, "Host destroy");
        mBluetoothService.stopAll();
    }

    @Override
    public void onCatalystInstanceDestroy() {
        if (D)
            Log.d(TAG, "Catalyst instance destroyed");
        super.onCatalystInstanceDestroy();
        mBluetoothService.stopAll();
    }

    @ReactMethod
    public void enable(Promise promise) {
        // checkAndRequestPermisions();
        if (mBluetoothAdapter != null) {
            if (mBluetoothAdapter.isEnabled()) {
                if (D)
                    Log.d(TAG, "Bluetooth enabled");
                promise.resolve(true);
            } else {
                try {
                    mBluetoothAdapter.enable();
                    if (D)
                        Log.d(TAG, "Bluetooth enabled");
                    promise.resolve(true);
                } catch (Exception e) {
                    Log.e(TAG, "Cannot enable bluetooth");
                    promise.reject(e);
                    onError(e);
                }
            }
        } else {
            rejectNullBluetoothAdapter(promise);
        }
    }

    @ReactMethod
    public void disable(Promise promise) {
        // checkAndRequestPermisions();
        if (mBluetoothAdapter != null) {
            if (!mBluetoothAdapter.isEnabled()) {
                if (D)
                    Log.d(TAG, "Bluetooth disabled");
                promise.resolve(true);
            } else {
                try {
                    mBluetoothAdapter.disable();
                    if (D)
                        Log.d(TAG, "Bluetooth disabled");
                    promise.resolve(true);
                } catch (Exception e) {
                    Log.e(TAG, "Cannot disable bluetooth");
                    promise.reject(e);
                    onError(e);
                }
            }
        } else {
            rejectNullBluetoothAdapter(promise);
        }
    }

    @ReactMethod
    public void isEnabled(Promise promise) {
        if (mBluetoothAdapter != null) {
            promise.resolve(mBluetoothAdapter.isEnabled());
        } else {
            rejectNullBluetoothAdapter(promise);
        }
    }

    @ReactMethod
    public void pairDevice(String id, Promise promise) {
        if (D)
            Log.d(TAG, "Pair device: " + id);
        // checkAndRequestPermisions();
        
        if (mBluetoothAdapter != null) {
            Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();

            for(BluetoothDevice bt : pairedDevices) {
                if (D)
                    Log.d(TAG, "=====> Paired device: " + bt.toString());
                if (id == bt.getAddress()) {
                    mPairDevicePromise = promise;
                    broadcastUpdate(Const.INTENT_BLE_BONDED, bt.getAddress());
                    // [2016.06.10][leenain] After bonded, discover services.
                    mBluetoothGatt.discoverServices();
                    return;
                }
            }
        
            BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(id);  

            if (device != null) {
                mPairDevicePromise = promise;
                
                pairDevice(device);
            } else {
                promise.reject(new Exception("Could not pair device " + id));
            }
        } else {
            rejectNullBluetoothAdapter(promise);
        }
    }

    @ReactMethod
    public void unpairDevice(String id, Promise promise) {
        if (D)
            Log.d(TAG, "Unpair device: " + id);
        // checkAndRequestPermisions();
        if (mBluetoothAdapter != null) {
            BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(id);

            if (device != null) {
                mPairDevicePromise = promise;
                unpairDevice(device);
            } else {
                promise.reject(new Exception("Could not unpair device " + id));
            }
        } else {
            rejectNullBluetoothAdapter(promise);
        }
    }

    @ReactMethod
    public void connect(String address, boolean autoRead, boolean useLastRecord, Promise promise) {
        stopScan(promise);
        _autoRead = autoRead;
        _useLastRecord = useLastRecord;
        if (D)
            Log.d(TAG, "connect------------------------->");
        if (mBluetoothAdapter == null || address == null) {
            if (D)
                Log.d(TAG, "mBluetoothAdapter == null || address == null");
            promise.resolve(false);
            return;
        }

        final BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);
        if (device == null) {
            if (D)
                Log.d(TAG, "mBluetoothAdapter == null || address == null");
            promise.resolve(false);
            return;
        }

        if (mBluetoothManager != null && mBluetoothManager.getConnectionState(device,
                BluetoothProfile.GATT) == BluetoothProfile.STATE_CONNECTED) {
            close();
            //promise.resolve(false);
            //return;
        }
        if (mBluetoothDeviceAddress != null && address.equals(mBluetoothDeviceAddress) && mBluetoothGatt != null) {
            if (D)
                Log.d(TAG, "<--------------------connect---------------->");
            close();
        }

        mBluetoothDeviceAddress = address;
        final IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        mReactContext.registerReceiver(mBondingBroadcastReceiver, filter);

        mBluetoothGatt = device.connectGatt(mReactContext, true, mGattCallback);

        // [2016.06.10][leenain] clear gatt cache
        refreshDeviceCache(mBluetoothGatt);
        if (mBluetoothGatt != null) { // added by rihyokju 20190910
            if (D)
                Log.d(TAG, "mBluetoothGatt != null");
            mRawDevice = mBluetoothGatt.getDevice();
            mConnectedPromises.put(address, promise);
            promise.resolve(true);

        } else {
            if (D)
                Log.d(TAG, "Can not connect device " + address);
            promise.resolve(false);
        }
            
        if (D)
            Log.d(TAG, "<--------------------connect");
    }

    @ReactMethod
    public void disconnect(@Nullable String id, Promise promise) {
        if (id == null) {
            id = mBluetoothService.getFirstDeviceAddress();
        }

        if (D)
            Log.d(TAG, "Disconnect from device id " + id);
        // checkAndRequestPermisions();
        if (id != null) {
            mBluetoothService.stop(id);
        }

        promise.resolve(true);
    }

    @ReactMethod
    public void disconnectAll(Promise promise) {
        // checkAndRequestPermisions();
        mBluetoothService.stopAll();
        promise.resolve(true);
    }


    private ScanCallback scanCallback;

    @ReactMethod
    public void startScan(Promise promise) {
        this.stopScan(promise);
        if (mBluetoothAdapter.getState() == BluetoothAdapter.STATE_ON) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mEnabledPromise = promise;
                if (scanCallback == null)
                    initCallbackLollipop();

                List<ScanFilter> filters = new ArrayList<ScanFilter>();

                ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY) // or
                        // BALANCED
                        // previously
                        .setReportDelay(0).build();

                mBluetoothAdapter.getBluetoothLeScanner().flushPendingScanResults(scanCallback);
                mBluetoothAdapter.getBluetoothLeScanner().stopScan(scanCallback);
                mBluetoothAdapter.getBluetoothLeScanner().startScan(filters, settings, scanCallback);
            } else {
                // Samsung Note II with Android 4.3 build JSS15J.N7100XXUEMK9 is not filtering
                // by UUID at all. We have to disable it
                mBluetoothAdapter.startLeScan(mLEScanCallback);

            }
        }
        _isScanning = true;
        promise.resolve(true);
    }

    @ReactMethod
    public void stopScan(Promise promise) {
        if (_isScanning) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && mBluetoothAdapter != null) {
                    mBluetoothAdapter.getBluetoothLeScanner().flushPendingScanResults(scanCallback);
                    mBluetoothAdapter.getBluetoothLeScanner().stopScan(scanCallback);
                } else {
                    mBluetoothAdapter.stopLeScan(mLEScanCallback);
                }
            } catch (NullPointerException e) {
            } catch (Exception e) {
            }
            _isScanning = false;
            //close();
            promise.resolve(true);
        }
       
    }

    @ReactMethod
    public void clear(@Nullable String id, Promise promise) {
        if (id == null) {
            id = mBluetoothService.getFirstDeviceAddress();
        }

        if (mBuffers.containsKey(id)) {
            StringBuffer buffer = mBuffers.get(id);
            buffer.setLength(0);
            mBuffers.put(id, buffer);
        }

        promise.resolve(true);
    }

    @ReactMethod
    public void downloadLast(boolean useLast, Promise promise) {
        downloadType = DownloadType.LAST;
        clear();
        if (D)
            Log.d(TAG, "-------------------downloadLast fullVersion=" + fullVersion);
        
        if (useLast) {
            broadcastUpdate(Const.INTENT_BLE_READ_LAST, "");
        }  else {
            _lastSequenceNumber = getPreference(_serialNumber);
            int num = Math.max(_lastSequenceNumber, _totalCount - 1);
                
            if (num < 0)
                num = 0;
            _afterIndex = Integer.toString(num);
            broadcastUpdate(Const.INTENT_BLE_READ_AFTER, Integer.toString(num));
        }  
        
        promise.resolve(null);
    }

    @ReactMethod
    public void downloadAll(Promise promise) {
        downloadType = DownloadType.ALL;
        if (D)
            Log.d(TAG, "---------------downloadAll:");
        _count = 0;
        broadcastUpdate(Const.INTENT_BLE_SEQUENCE_COMPLETED, Integer.toString(_totalCount));
        promise.resolve(null);
    }

    @ReactMethod
    public void downloadAfter(Integer index, Promise promise) {
        downloadType = DownloadType.AFTER;
        
        _afterIndex = Integer.toString(index);
        if (D)
            Log.d(TAG, "---------------downloadAfter:" + _afterIndex);
        broadcastUpdate(Const.INTENT_BLE_READ_AFTER, Integer.toString(index)); //pusedo param index
        promise.resolve(null);
    }

    @ReactMethod
    public void list(Promise promise) {
        if (D)
            Log.d(TAG, "--------------------- list");
        
        _founded = false;
        _timeFound = System.currentTimeMillis();
        
        this.startScan(promise);
    }

    @ReactMethod
    public void connectToDevice(String sn, boolean autoRead, boolean useLastRecord, Promise promise) {
        //Log.d(TAG, "------------- connectToDevice--@@@" + sn);
        _timeOperation = System.currentTimeMillis();
        this.connect(sn, autoRead, useLastRecord, promise);
        // this.startScan(promise);
    }

    @ReactMethod
    public void disconnectDevice(String sn, Promise promise) {
        //Log.d(TAG, "------------- disconnectToDevice--@@@" + sn);
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            return;
        }
        mBluetoothGatt.disconnect();
    }

    /**
     * Handle connection success
     *
     * @param msg             Additional message
     * @param connectedDevice Connected device
     */
    void onConnectionSuccess(String msg, BluetoothDevice connectedDevice) {
        String id = connectedDevice.getAddress();

        if (!mDelimiters.containsKey(id)) {
            mDelimiters.put(id, "");
        }

        if (!mBuffers.containsKey(id)) {
            mBuffers.put(id, new StringBuffer());
        }

        if (mConnectedPromises.containsKey(id)) {
            Promise promise = mConnectedPromises.get(id);

            if (promise != null) {
                WritableMap deviceForPromise = deviceToWritableMap(connectedDevice);
                promise.resolve(deviceForPromise);
            }
        }

        WritableMap device = deviceToWritableMap(connectedDevice);
        WritableMap params = Arguments.createMap();
        params.putMap("device", device);
        params.putString("message", msg);
        sendEvent(CONN_SUCCESS, params);
    }

    /**
     * handle connection failure
     *
     * @param msg             Additional message
     * @param connectedDevice Connected device
     */
    void onConnectionFailed(String msg, BluetoothDevice connectedDevice) {
        WritableMap params = Arguments.createMap();
        WritableMap device = deviceToWritableMap(connectedDevice);

        params.putMap("device", device);
        params.putString("message", msg);

        String id = connectedDevice.getAddress();

        if (mConnectedPromises.containsKey(id)) {
            Promise promise = mConnectedPromises.get(id);

            if (promise != null) {
                promise.reject(new Exception(msg));
            }
        }

        sendEvent(CONN_FAILED, params);
    }

    /**
     * Handle lost connection
     *
     * @param msg             Message
     * @param connectedDevice Connected device
     */
    void onConnectionLost(String msg, BluetoothDevice connectedDevice) {
        WritableMap params = Arguments.createMap();
        WritableMap device = deviceToWritableMap(connectedDevice);

        params.putMap("device", device);
        params.putString("message", msg);
        mConnectedPromises.remove(connectedDevice.getAddress());

        sendEvent(CONN_LOST, params);
    }

    /**
     * Handle error
     *
     * @param e Exception
     */
    void onError(Exception e) {
        WritableMap params = Arguments.createMap();
        params.putString("message", e.getMessage());
        sendEvent(ERROR, params);
    }

    /**
     * Handle read
     *
     * @param id   Device address
     * @param data Message
     */
    void onData(String id, String data) {
        if (mBuffers.containsKey(id)) {
            StringBuffer buffer = mBuffers.get(id);
            buffer.append(data);
            mBuffers.put(id, buffer);
        }

        String delimiter = "";

        if (mDelimiters.containsKey(id)) {
            delimiter = mDelimiters.get(id);
        }

        String completeData = readUntil(id, delimiter);

        if (completeData != null && completeData.length() > 0) {
            WritableMap readParams = Arguments.createMap();
            readParams.putString("id", id);
            readParams.putString("data", completeData);
            sendEvent(DEVICE_READ, readParams);

            WritableMap dataParams = Arguments.createMap();
            dataParams.putString("id", id);
            dataParams.putString("data", completeData);
            sendEvent(DATA_READ, dataParams);
        }
    }

    /**
     * Handle read until find a certain delimiter
     *
     * @param id        Device address
     * @param delimiter
     * @return buffer data from device
     */
    private String readUntil(String id, String delimiter) {
        String data = "";

        if (mBuffers.containsKey(id)) {
            StringBuffer buffer = mBuffers.get(id);
            int index = buffer.indexOf(delimiter, 0);

            if (index > -1) {
                data = buffer.substring(0, index + delimiter.length());
                buffer.delete(0, index + delimiter.length());
                mBuffers.put(id, buffer);
            }
        }

        return data;
    }

    /**
     * Check if is api level 19 or above
     *
     * @return is above api level 19
     */
    private boolean isKitKatOrAbove() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;
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
            //System.out.println("sendEvent called " + eventName);
            mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
            //Log.d(TAG, "sendEvent called");
        } catch (Exception e) {
            //System.out.println("sendEvent failed " + eventName + e.getMessage());
            //Log.d(TAG, "sendEvent failed");
        }
    }

    /**
     * Convert BluetoothDevice into WritableMap
     *
     * @param device Bluetooth device
     */
    private WritableMap deviceToWritableMap(BluetoothDevice device) {
        if (D)
            Log.d(TAG, "device" + device.toString());

        WritableMap params = Arguments.createMap();

        if (device != null) {
            params.putString("name", device.getName());
            params.putString("address", device.getAddress());
            params.putString("id", device.getAddress());

            if (device.getBluetoothClass() != null) {
                params.putInt("class", device.getBluetoothClass().getDeviceClass());
            }
        }

        return params;
    }

    /**
     * Pair device before kitkat
     *
     * @param device Device
     */
    private void pairDevice(BluetoothDevice device) {
        try {
            if (D)
                Log.d(TAG, "Start Pairing...");
            Method m = device.getClass().getMethod("createBond", (Class[]) null);
            m.invoke(device, (Object[]) null);
            registerDevicePairingReceiver(device, BluetoothDevice.BOND_BONDED);
        } catch (Exception e) {
            Log.e(TAG, "Cannot pair device", e);
            if (mPairDevicePromise != null) {
                mPairDevicePromise.reject(e);
                mPairDevicePromise = null;
            }
            onError(e);
        }
    }

    /**
     * Unpair device
     *
     * @param device Device
     */
    private void unpairDevice(BluetoothDevice device) {
        try {
            if (D)
                Log.d(TAG, "Start Unpairing...");
            Method m = device.getClass().getMethod("removeBond", (Class[]) null);
            m.invoke(device, (Object[]) null);
            registerDevicePairingReceiver(device, BluetoothDevice.BOND_NONE);
        } catch (Exception e) {
            Log.e(TAG, "Cannot unpair device", e);
            if (mPairDevicePromise != null) {
                mPairDevicePromise.reject(e);
                mPairDevicePromise = null;
            }
            onError(e);
        }
    }

    /**
     * Return reject promise for null bluetooth adapter
     *
     * @param promise
     */
    private void rejectNullBluetoothAdapter(Promise promise) {
        Exception e = new Exception("Bluetooth adapter not found");
        Log.e(TAG, "Bluetooth adapter not found");
        promise.reject(e);
        onError(e);
    }

    /**
     * Register receiver for device pairing
     *
     * @param rawDevice     Bluetooth device
     * @param requiredState State that we require
     */
    private void registerDevicePairingReceiver(final BluetoothDevice rawDevice, final int requiredState) {
        final WritableMap device = deviceToWritableMap(rawDevice);
        IntentFilter intentFilter = new IntentFilter();

        intentFilter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);

        final BroadcastReceiver devicePairingReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();

                if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                    final int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
                    final int prevState = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE,
                            BluetoothDevice.ERROR);

                    if (state == BluetoothDevice.BOND_BONDED && prevState == BluetoothDevice.BOND_BONDING) {
                        //Log.d("-- BOND_BONDED", " ------  3");
                        
                        if (D)
                            Log.d(TAG, "Device paired");
                        if (mPairDevicePromise != null) {
                            mPairDevicePromise.resolve(device);
                            mPairDevicePromise = null;
                        }
                        try {
                            mReactContext.unregisterReceiver(this);
                        } catch (Exception e) {
                            Log.e(TAG, "Cannot unregister receiver", e);
                            onError(e);
                        }
                    } else if (state == BluetoothDevice.BOND_NONE && prevState == BluetoothDevice.BOND_BONDED) {
                        if (D)
                            Log.d(TAG, "Device unpaired");
                        if (mPairDevicePromise != null) {
                            mPairDevicePromise.resolve(device);
                            mPairDevicePromise = null;
                        }
                        try {
                            mReactContext.unregisterReceiver(this);
                        } catch (Exception e) {
                            Log.e(TAG, "Cannot unregister receiver", e);
                            onError(e);
                        }
                    }
                }
            }
        };

        mReactContext.registerReceiver(devicePairingReceiver, intentFilter);
    }

    /**
     * Register receiver for bluetooth device discovery
     */
    private void registerBluetoothDeviceDiscoveryReceiver() {
        IntentFilter intentFilter = new IntentFilter();

        intentFilter.addAction(BluetoothDevice.ACTION_FOUND);
        intentFilter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
        intentFilter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);

        final BroadcastReceiver deviceDiscoveryReceiver = new BroadcastReceiver() {
            private WritableArray unpairedDevices = Arguments.createArray();
            private Vector<BluetoothDevice> devices = new Vector<BluetoothDevice>();

            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();

                if (D)
                    Log.d(TAG, "onReceive called");

                if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
                    if (D)
                        Log.d(TAG, "Discovery started");
                    devices.clear();
                } else if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                    BluetoothDevice rawDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

                    if (D)
                        Log.d(TAG, "Discovery extra device (device id: " + rawDevice.getAddress() + ")");
                    if (rawDevice.getName() != null && !devices.contains(rawDevice)) {
                        if (rawDevice.getName().matches("^CareSens \\d{4}$")) {
                            WritableMap device = deviceToWritableMap(rawDevice);
                            unpairedDevices.pushMap(device);
                        }
                        devices.add(rawDevice);
                    }
                } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                    if (D)
                        Log.d(TAG, "Discovery finished");

                    if (mDeviceDiscoveryPromise != null) {
                        mDeviceDiscoveryPromise.resolve(unpairedDevices);
                        mDeviceDiscoveryPromise = null;
                    }

                    try {
                        mReactContext.unregisterReceiver(this);
                    } catch (Exception e) {
                        Log.e(TAG, "Unable to unregister receiver", e);
                        onError(e);
                    }
                }
            }
        };

        mReactContext.registerReceiver(deviceDiscoveryReceiver, intentFilter);
    }

    /**
     * Register receiver for first available device discovery
     */
    private void registerFirstAvailableBluetoothDeviceDiscoveryReceiver() {
        IntentFilter intentFilter = new IntentFilter();

        intentFilter.addAction(BluetoothDevice.ACTION_FOUND);
        intentFilter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);

        final BroadcastReceiver deviceDiscoveryReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();

                if (D)
                    Log.d(TAG, "onReceive called");

                if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
                    if (D)
                        Log.d(TAG, "Discovery started");
                } else if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                    BluetoothDevice rawDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

                    String id = rawDevice.getAddress();

                    if (D)
                        Log.d(TAG, "Discovery first available device (device id: " + id + ")");

                    mBluetoothService.connect(rawDevice);

                    if (mConnectedPromises.containsKey(FIRST_DEVICE)) {
                        Promise promise = mConnectedPromises.get(FIRST_DEVICE);
                        mConnectedPromises.remove(FIRST_DEVICE);
                        mConnectedPromises.put(id, promise);

                        if (promise != null) {
                            WritableMap device = deviceToWritableMap(rawDevice);
                            promise.resolve(device);
                        }
                    }

                    try {
                        mReactContext.unregisterReceiver(this);
                    } catch (Exception e) {
                        Log.e(TAG, "Unable to unregister receiver", e);
                        onError(e);
                    }
                }
            }
        };

        mReactContext.registerReceiver(deviceDiscoveryReceiver, intentFilter);
    }

    /**
     * Register receiver for bluetooth state change
     */
    private void registerBluetoothStateReceiver() {
        IntentFilter intentFilter = new IntentFilter();

        intentFilter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);

        final BroadcastReceiver bluetoothStateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                final String action = intent.getAction();

                if (BluetoothAdapter.ACTION_STATE_CHANGED.equals(action)) {
                    final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
                    switch (state) {
                        case BluetoothAdapter.STATE_OFF:
                            if (D)
                                Log.d(TAG, "Bluetooth was disabled");
                            sendEvent(BT_DISABLED, null);
                            break;
                        case BluetoothAdapter.STATE_ON:
                            if (D)
                                Log.d(TAG, "Bluetooth was enabled");
                            sendEvent(BT_ENABLED, null);
                            break;
                        default:
                            break;
                    }
                }
            }
        };

        mReactContext.registerReceiver(bluetoothStateReceiver, intentFilter);
    }

    public String getDateTime(long t) {
        java.text.DateFormat df = DateFormat.getDateFormat(mReactContext);// getDateFormat(context);
        String strDate = df.format(t * 1000);
        df = DateFormat.getTimeFormat(mReactContext);
        strDate += " " + df.format(t * 1000);

        return strDate;
    }
    private String getCurrentDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
        String currentDateandTime = sdf.format(new Date());
        return currentDateandTime;
    }
    
    private String getDate(long t) {
        SimpleDateFormat sdfNow = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String date = sdfNow.format(t * 1000);

        return date;
    }

    private float bytesToFloat(byte b0, byte b1) {
        return (float) unsignedByteToInt(b0) + ((unsignedByteToInt(b1) & 0x0F) << 8);

    }
    
    private int unsignedByteToInt(byte b) {
        return b & 0xFF;
    }
	private void broadcastUpdate(final String action, final String data) {
        final Intent intent = new Intent(action);
        if (data != "")
            intent.putExtra(Const.INTENT_BLE_EXTRA_DATA, data);
        mReactContext.sendBroadcast(intent);
    }
    private void requestBleAll() {
        if (getAllRecords() == false) {
            try {
                Thread.sleep(200);
                getAllRecords();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private void requestBleAfter() {
        if (getAfterRecords() == false) {
            try {
                Thread.sleep(200);
                getAfterRecords();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    private void requestBleLast() {
        if (getLastRecords() == false) {
            try {
                Thread.sleep(200);
                getLastRecords();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private boolean getAllRecords() {
        if (mBluetoothGatt == null || mRACPCharacteristic == null) {
            // broadcastUpdate(Const.INTENT_BLE_ERROR,
            // mReactContext.getResources().getString(R.string.ERROR_CONNECTION_STATE_CHANGE)
            // + "null");
            return false;
        }

        clear();
        broadcastUpdate(Const.INTENT_BLE_OPERATE_STARTED, "");
        if (D)
            Log.d("-- all records", "data");

        setOpCode(mRACPCharacteristic, OP_CODE_REPORT_STORED_RECORDS, OPERATOR_ALL_RECORDS);
        return mBluetoothGatt.writeCharacteristic(mRACPCharacteristic);

    }

    private boolean getAfterRecords() {
        if (mBluetoothGatt == null || mRACPCharacteristic == null) {
            // broadcastUpdate(Const.INTENT_BLE_ERROR,
            // mReactContext.getResources().getString(R.string.ERROR_CONNECTION_STATE_CHANGE)
            // + "null");
            return false;
        }

        clear();
        broadcastUpdate(Const.INTENT_BLE_OPERATE_STARTED, "");
        if (D)
            Log.d("-- after records", "data");

        if (mCustomTimeCharacteristic == null) { // 0403
            setOpCode(mRACPCharacteristic, OP_CODE_REPORT_NUMBER_OF_RECORDS, OPERATOR_GREATER_OR_EQUAL_RECORDS,
                    Integer.parseInt(_afterIndex));
        } else {
            if (mCustomTimeCharacteristic.getUuid().equals(Const.BLE_CHAR_CUSTOM_TIME_MC) == true)
                setOpCode(mRACPCharacteristic, OP_CODE_REPORT_NUMBER_OF_RECORDS, OPERATOR_GREATER_OR_EQUAL_RECORDS,
                        Integer.parseInt(_afterIndex));
            else
                setOpCode(mRACPCharacteristic, OP_CODE_REPORT_STORED_RECORDS, OPERATOR_GREATER_OR_EQUAL_RECORDS,
                        Integer.parseInt(_afterIndex));
        }

        return mBluetoothGatt.writeCharacteristic(mRACPCharacteristic);

    }
    private boolean getLastRecords() {
        if (mBluetoothGatt == null || mRACPCharacteristic == null) {
            // broadcastUpdate(Const.INTENT_BLE_ERROR,
            // mReactContext.getResources().getString(R.string.ERROR_CONNECTION_STATE_CHANGE)
            // + "null");
            return false;
        }

        clear();
        broadcastUpdate(Const.INTENT_BLE_OPERATE_STARTED, "");
        if (D)
            Log.d("-- last records", "data");

        setOpCode(mRACPCharacteristic, OP_CODE_REPORT_STORED_RECORDS, OPERATOR_LAST_RECORD);
       
        return mBluetoothGatt.writeCharacteristic(mRACPCharacteristic);

    }

    private void setOpCode(final BluetoothGattCharacteristic characteristic, final int opCode, final int operator,
                           final Integer... params) {
        if (characteristic == null)
            return;

        final int size = 2 + ((params.length > 0) ? 1 : 0) + params.length * 2; // 1 byte for opCode, 1 for operator, 1
        // for filter type (if parameters
        // exists) and 2 for each parameter
        characteristic.setValue(new byte[size]);

        int offset = 0;
        characteristic.setValue(opCode, BluetoothGattCharacteristic.FORMAT_UINT8, offset);
        offset += 1;

        characteristic.setValue(operator, BluetoothGattCharacteristic.FORMAT_UINT8, offset);
        offset += 1;

        if (params.length > 0) {
            characteristic.setValue(FILTER_TYPE_SEQUENCE_NUMBER, BluetoothGattCharacteristic.FORMAT_UINT8, offset);
            offset += 1;

            for (final Integer i : params) {
                characteristic.setValue(i, BluetoothGattCharacteristic.FORMAT_UINT16, offset);
                offset += 2;
            }
        }
    }

    private boolean getSequenceNumber() {
        if (mBluetoothGatt == null || mRACPCharacteristic == null) {
            // broadcastUpdate(Const.INTENT_BLE_ERROR,
            // mReactContext.getResources().getString(R.string.ERROR_CONNECTION_STATE_CHANGE)
            // + "null");
            return false;
        }

        clear();
        broadcastUpdate(Const.INTENT_BLE_OPERATE_STARTED, "");

        setOpCode(mRACPCharacteristic, OP_CODE_REPORT_NUMBER_OF_RECORDS, OPERATOR_ALL_RECORDS);
        return mBluetoothGatt.writeCharacteristic(mRACPCharacteristic);

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

    
}