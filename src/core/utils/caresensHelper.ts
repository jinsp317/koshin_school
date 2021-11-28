// implementation of caresensHelp.ts by @rihyokju
// original implementation used an external library for CareSens Device

import AsyncStorage from "@react-native-community/async-storage";
import GLOBAL from "../globals";
import { NativeModules } from "react-native";
import * as UTILS from "@src/core/app_utils";

const CareSens = NativeModules.CareSens;
const CareSensOTG = NativeModules.CareSensOTG;

class CareSensImpl {
  /**for caresens device */
  public async initialize() {
    try {
      const isEnabled = await CareSens.isEnabled();
      if (!isEnabled) this.toggleBluetooth(true);


    } catch (e) {
      UTILS.showToast(e.message);
    }
  }

  private toggleBluetooth = async value => {
    try {
      if (value) {
        await CareSens.enable();
      } else {
        await CareSens.disable();
      }
    } catch (e) {
      if (__DEV__) console.warn(e.message);
      UTILS.showToast(e.message);
    }
  };
  public connnectToDevice = async (autoRead: boolean, useLastRecord: boolean) => {
    if (__DEV__) console.info("call  CareSens.connectToDevice(GLOBAL.myDeviceId)");
    try {
      // console.log(GLOBAL.curDevice.id);
      // console.log("autoRead = " + autoRead);
      // console.log("useLastRecord = " + useLastRecord);
      await CareSens.connectToDevice(GLOBAL.curDevice.id, autoRead, useLastRecord);
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };
  public disconnect = async () => {
    if (__DEV__) console.info("call  CareSens.disconnect(GLOBAL.myDeviceId)");
    try {
      await CareSens.disconnectDevice(GLOBAL.curDevice.id);
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };

  public downloadLast = async (useLast: boolean) => {
    if (__DEV__) console.info("--------------call downloadLast");
    try {
      await CareSens.downloadLast(useLast);
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };

  public downloadAfter = async (index: number) => {
    if (__DEV__) console.info("--------------call downloadAfter: ", index);
    try {
      await CareSens.downloadAfter(index);
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };
  public downloadAll = async () => {
    if (__DEV__) console.info("------------call downloadAll");
    try {
      await CareSens.downloadAll();
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };

  // 유선혈당계정보얻기
  public getOtgDeviceInfo = async () => {
    if (__DEV__) console.info("------------call getOtgDeviceInfo");
    try {
      await CareSensOTG.startEx();
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };

  // 유선혈당계자료입력처리스레드시작하기
  public startOtgDevice = async () => {
    if (__DEV__) console.info("------------call startOtgDevice");
    try {
      await CareSensOTG.start();
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };

  // 유선혈당계동작중지
  public stopOtgDevice = async () => {
    // FIXME: 자료읽기스레드가 완전 죽는것아니고 재기동함을 주의하세요
    if (__DEV__) console.info("------------call stopOtgDevice");
    try {
      await CareSensOTG.stop();
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };
}

// Export a single instance of CareSensImpl
export const careSensHelper = new CareSensImpl();
