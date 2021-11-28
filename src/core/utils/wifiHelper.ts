/* implementation of wifiHelper.ts by @rihyokju */
// original implementation used an external library for asynchrous storage

import wifi from 'react-native-android-wifi';
import GLOBAL from "../globals";

class WifiHelperImpl {
    public isEnabled = () => {
        return wifi.isEnabled((isEnabled) => {
            return isEnabled;
        });

    }

    public async canWorkingState(): Promise<boolean> {
        // level is the detected signal level in dBm, also known as the RSSI. (Remember its a negative value)
        return wifi.getCurrentSignalStrength((level) => {
            if (__DEV__) console.info("------- wifi strength ", level);
            return (level > 0) ? true : false;
        });

    }
}

// Export a single instance of AsyncStorageHelperImpl
export const wifiHelper = new WifiHelperImpl();
