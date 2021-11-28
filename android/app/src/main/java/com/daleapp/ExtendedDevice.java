package com.daleapp;

import android.bluetooth.BluetoothDevice;
/**
 * Created by Samson on 2019. 06. 20..
 */
public class ExtendedDevice {
    public BluetoothDevice device;
    public int rssi;
    public boolean isBonded;

    public ExtendedDevice(BluetoothDevice device, int rssi, boolean isBonded) {
        this.device = device;
        this.rssi = rssi;
        this.isBonded = isBonded;
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof ExtendedDevice) {
            final ExtendedDevice that = (ExtendedDevice) o;
            return device.getAddress().equals(that.device.getAddress());
        }
        return super.equals(o);
    }


    public static class AddressComparator {
        public String address;

        @Override
        public boolean equals(Object o) {
            if (o instanceof ExtendedDevice) {
                final ExtendedDevice that = (ExtendedDevice) o;
                return address.equals(that.device.getAddress());
            }
            return super.equals(o);
        }
    }
}