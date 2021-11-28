// implementation of storageHelper.ts by @rihyokju
// original implementation used an external library for asynchrous storage

import AsyncStorage from "@react-native-community/async-storage";
import GLOBAL from "../globals";
import { GlobalHelpButton } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { TaskDataModel } from "../model";
import { AppSync } from "../appSync";
import { bool } from 'prop-types';

class AsyncStorageImpl {
  public async getInfos(): Promise<boolean> {
    if (__DEV__) console.info("todo:rhj--------------begin getInfos");
    try {
      await this.getCommonInfos();
      await this.getServerData();
      await this.getUserInfos();
      await this.getDeviceInfos();
      await this.getConfigInfos();
      await this.getConfigAppEnv();
      await this.getTestQuality();
      await this.getPortalItems();
      await this.getSessionInfos();
      await this.getHelpData();
      await this.getSyncInfos();
      if (__DEV__) console.info("todo:rhj--------------end getInfos");
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getCommonInfos(): Promise<boolean> {
    try {
      // for testRange
      const value = await AsyncStorage.getItem("curTestRange");
      if (value !== null) {
        GLOBAL.curTestRange = JSON.parse(value);
      }

      return true;
    } catch (e) {
      return false;
    }
  }
  public async setCommonInfos(): Promise<boolean> {
    try {
      if (GLOBAL.curTestRange) {
        await AsyncStorage.setItem("curTestRange", JSON.stringify(GLOBAL.curTestRange));
      }

      return true;
    } catch (e) {
      return false;
    }
  }
  public async getSyncInfos(): Promise<boolean> {
    try {
      // for testRange
      let value = await AsyncStorage.getItem("lastSyncTime");
      if (value !== null) {
        AppSync.lastSyncTime = value;
      }
      value = await AsyncStorage.getItem("hasFullSynchronized");
      if (value !== null) {
        AppSync.hasFullSynchronized = JSON.parse(value);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  public async setSyncInfos(): Promise<boolean> {
    try {
      if (AppSync.lastSyncTime) await AsyncStorage.setItem("lastSyncTime", AppSync.lastSyncTime);
      if (AppSync.hasFullSynchronized) {
        await AsyncStorage.setItem(
          "hasFullSynchronized",
          JSON.stringify(AppSync.hasFullSynchronized)
        );
      }

      return true;
    } catch (e) {
      return false;
    }
  }
  public async getSessionInfos(): Promise<boolean> {
    try {
      // for user
      const value = await AsyncStorage.getItem("curRouteName");
      if (value !== null) {
        GLOBAL.curRouteName = value;
      }

      return true;
    } catch (e) {
      return false;
    }
  }
  public async setSessionInfos(): Promise<boolean> {
    try {
      if (GLOBAL.curRouteName) await AsyncStorage.setItem("curRouteName", GLOBAL.curRouteName);

      return true;
    } catch (e) {
      return false;
    }
  }
  public async getUserInfos(): Promise<boolean> {
    try {
      // for user
      let value = await AsyncStorage.getItem("saveInfo");
      if (value !== null) {
        GLOBAL.isSaveInfo = JSON.parse(value);
      }
      value = await AsyncStorage.getItem("signOut");
      if (value !== null) {
        GLOBAL.isSignOut = JSON.parse(value);
      }
      value = await AsyncStorage.getItem("userNick");
      if (value !== null) {
        GLOBAL.curUser.nick = value;
      }
      value = await AsyncStorage.getItem("password");
      if (value !== null) {
        GLOBAL.curUser.password = value;
      }
      value = await AsyncStorage.getItem("userId");
      if (value !== null) {
        GLOBAL.curUser.id = Number(value);
      }

      value = await AsyncStorage.getItem("SavedUsers");
      if (value !== null) {
        GLOBAL.savedUsers = JSON.parse(value);
      }
      value = await AsyncStorage.getItem('bluetoothServer');
      if (value !== null) {
        GLOBAL.bluetoothServer = JSON.parse(value);
      }
      value = await AsyncStorage.getItem('usingBluetoothServer');
      if (value !== null) {
        GLOBAL.usingBluetoothServer = value === "1" ? true : false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async setUserInfos(): Promise<boolean> {
    try {
      // for user
      await AsyncStorage.setItem("saveInfo", JSON.stringify(GLOBAL.isSaveInfo));
      await AsyncStorage.setItem("signOut", JSON.stringify(GLOBAL.isSignOut));
      if (GLOBAL.curUser.id) {
        await AsyncStorage.setItem("userId", JSON.stringify(GLOBAL.curUser.id));
      }
      if (GLOBAL.curUser.nick) await AsyncStorage.setItem("userNick", GLOBAL.curUser.nick);
      if (GLOBAL.curUser.password) await AsyncStorage.setItem("password", GLOBAL.curUser.password);

      if (GLOBAL.savedUsers) {
        await AsyncStorage.setItem("SavedUsers", JSON.stringify(GLOBAL.savedUsers));
      }
      if (GLOBAL.usingBluetoothServer) {
        await AsyncStorage.setItem("usingBluetoothServer", GLOBAL.usingBluetoothServer ? "1" : "0");
      }
      if (GLOBAL.bluetoothServer) {
        await AsyncStorage.setItem("bluetoothServer", JSON.stringify(GLOBAL.bluetoothServer));
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  // for config device
  public async getDeviceInfos(): Promise<boolean> {
    try {
      // for device
      const value = await AsyncStorage.getItem("curDevice");
      if (value !== null) {
        GLOBAL.curDevice = JSON.parse(value);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async setDeviceInfos(): Promise<boolean> {
    try {
      // console.log(GLOBAL.curDevice.id);
      // console.log(GLOBAL.curDevice.name);
      // console.log(GLOBAL.curDevice.nick);
      // console.log(GLOBAL.curDevice.sn);
      if (__DEV__) console.info('curDevice:', GLOBAL.curDevice);
      // for device
      await AsyncStorage.setItem("curDevice", JSON.stringify(GLOBAL.curDevice));
      return true;
    } catch (e) {
      return false;
    }
  }
  // for config server
  public async getConfigInfos(): Promise<boolean> {
    try {
      // for config
      let value = await AsyncStorage.getItem("hospital_num");
      if (value !== null) {
        GLOBAL.hospital_num = Number(value);
      }
      value = await AsyncStorage.getItem("server_ip");
      if (value !== null) {
        GLOBAL.server_ip = value;
      }
      value = await AsyncStorage.getItem("lan_server_ip");
      if (value !== null) {
        GLOBAL.lan_server_ip = value;
      }
      value = await AsyncStorage.getItem("server_mode");
      if (value !== null) {
        GLOBAL.server_mode = Number(value);
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  public async setConfigInfos(): Promise<boolean> {
    try {
      if (GLOBAL.hospital_num) {
        await AsyncStorage.setItem("hospital_num", JSON.stringify(GLOBAL.hospital_num));
      }
      if (GLOBAL.server_ip) await AsyncStorage.setItem("server_ip", GLOBAL.server_ip);
      if (GLOBAL.lan_server_ip) await AsyncStorage.setItem("lan_server_ip", GLOBAL.lan_server_ip);
      // if (GLOBAL.server_mode) {
      await AsyncStorage.setItem("server_mode", JSON.stringify(GLOBAL.server_mode));
      // }
      return true;
    } catch (e) {
      return false;
    }
  }
  // for portal items
  public async getPortalItems(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem("portalItems");
      if (value !== null) {
        const data = JSON.parse(value);
        data.forEach((element, i) => {
          GLOBAL.portalItems[i].disabled = element;
        });
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  public async setPortalItems(): Promise<boolean> {
    try {
      // array of disabled field
      const array_disabled = UTILS.getSingleArrFromMultiArr(GLOBAL.portalItems, "disabled");
      await AsyncStorage.setItem("portalItems", JSON.stringify(array_disabled));

      return true;
    } catch (e) {
      return false;
    }
  }
  // for config server
  public async getConfigAppEnv(): Promise<boolean> {
    try {
      // for config
      let value = await AsyncStorage.getItem("curMonitorAutoSaveDelayIdx");
      if (value !== null) {
        GLOBAL.curMonitorAutoSaveDelayIdx = Number(value);
      }
      value = await AsyncStorage.getItem("curTaskCheckIntervalIdx");
      if (value !== null) {
        GLOBAL.curTaskCheckIntervalIdx = Number(value);
      }
      value = await AsyncStorage.getItem("curDataSyncIntervalIdx");
      if (value !== null) {
        GLOBAL.curDataSyncIntervalIdx = Number(value);
        if (GLOBAL.curDataSyncIntervalIdx == undefined) {
          GLOBAL.curDataSyncIntervalIdx = 1;
        }
      } else {
        GLOBAL.curDataSyncIntervalIdx = 1;
      }

      value = await AsyncStorage.getItem("curWarningCheckIdx");
      if (value !== null) {
        GLOBAL.curWarningCheckIdx = Number(value);
      }
      value = await AsyncStorage.getItem("curWarningPlaySoundEnabled");
      if (value !== null) {
        GLOBAL.curWarningPlaySoundEnabled = Number(value);
      }
      value = await AsyncStorage.getItem("curGlobalHelpIdx");
      if (value !== null) {
        GLOBAL.curGlobalHelpIdx = Number(value);
      }
      value = await AsyncStorage.getItem("curDailyTest");
      if (value !== null) {
        GLOBAL.curDailyTest = JSON.parse(value);
      }
      value = await AsyncStorage.getItem("curFontSize");
      if (value !== null) {
        GLOBAL.curFontSize = value;
      }
      value = await AsyncStorage.getItem('signInMode');
      if (value != null) {
        GLOBAL.signInMode = Number(value);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async setConfigAppEnv(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        "curMonitorAutoSaveDelayIdx",
        JSON.stringify(GLOBAL.curMonitorAutoSaveDelayIdx)
      );
      await AsyncStorage.setItem(
        "curDataSyncIntervalIdx",
        JSON.stringify(GLOBAL.curDataSyncIntervalIdx)
      );
      await AsyncStorage.setItem(
        "curTaskCheckIntervalIdx",
        JSON.stringify(GLOBAL.curTaskCheckIntervalIdx)
      );
      await AsyncStorage.setItem("curWarningCheckIdx", JSON.stringify(GLOBAL.curWarningCheckIdx));
      await AsyncStorage.setItem(
        "curWarningPlaySoundEnabled",
        JSON.stringify(GLOBAL.curWarningPlaySoundEnabled)
      );
      await AsyncStorage.setItem("curGlobalHelpIdx", JSON.stringify(GLOBAL.curGlobalHelpIdx));
      await AsyncStorage.setItem("curDailyTest", JSON.stringify(GLOBAL.curDailyTest));
      await AsyncStorage.setItem("curFontSize", GLOBAL.curFontSize);
      await AsyncStorage.setItem("signInMode", GLOBAL.signInMode.toString());
      // await AsyncStorage.setItem("curFontSize", GLOBAL.curFontSize);

      return true;
    } catch (e) {
      return false;
    }
  }
  // for test quality
  public async getTestQuality(): Promise<boolean> {
    try {
      // for config
      const value = await AsyncStorage.getItem("curTestQuality");
      if (value !== null) {
        GLOBAL.curTestQuality = JSON.parse(value);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async setTestQuality(): Promise<boolean> {
    try {
      await AsyncStorage.setItem("curTestQuality", JSON.stringify(GLOBAL.curTestQuality));
      return true;
    } catch (e) {
      return false;
    }
  }

  // for data from web server
  public async getServerData(): Promise<boolean> {
    try {
      // for config
      let value = await AsyncStorage.getItem("serverMyUsers");
      if (value !== null) {
        GLOBAL.myUsers = JSON.parse(value);
      }
      value = await AsyncStorage.getItem("serverPoints");
      if (value !== null) {
        GLOBAL.serverPoints = JSON.parse(value);

        GLOBAL.todayTaskPoints = UTILS.makeTodayTaskPoints();
      }
      value = await AsyncStorage.getItem("serverTotalDepartments");
      if (value !== null) {
        GLOBAL.totalDepartments = JSON.parse(value);
      }
      value = await AsyncStorage.getItem("versionUp");
      if (value !== null) {
        GLOBAL.versionUp = value == '1' ? true : false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async setServerData(): Promise<boolean> {
    try {
      await AsyncStorage.setItem("serverMyUsers", JSON.stringify(GLOBAL.myUsers));
      await AsyncStorage.setItem("serverPoints", JSON.stringify(GLOBAL.serverPoints));
      await AsyncStorage.setItem("serverTotalDepartments", JSON.stringify(GLOBAL.totalDepartments));
      await AsyncStorage.setItem("versionUp", GLOBAL.versionUp ? '1' : '0');
      return true;
    } catch (e) {
      return false;
    }
  }


  public async getCashData(): Promise<boolean> {
    try {
      for (let completed = 0; completed < 2; completed++) {
        GLOBAL.cashData.todayTask[completed].forEach(data => (data = undefined));
        if (__DEV__) console.info("-------get cash data");
        for (
          let pointIndex = 0;
          pointIndex < GLOBAL.cashData.todayTask[completed].length;
          pointIndex++
        ) {
          const key =
            completed === 1
              ? `tasks_completed_index_${pointIndex}`
              : `tasks_incompleted_index_${pointIndex}`;
          const value = await AsyncStorage.getItem(key);

          if (value !== null) {
            const tasks = JSON.parse(value);
            // console.log(`completed:${completed} pointIndex:${pointIndex} count:${tasks.length}`);
            GLOBAL.cashData.todayTask[completed][pointIndex] = {
              tasks: JSON.parse(value)
            };
          }
        }
      }

      return true;
    } catch (e) {
      return false;
    }
  }
  public async setCashData(completed: number, pointIndex: number): Promise<boolean> {
    try {
      const key =
        completed === 1
          ? `tasks_completed_index_${pointIndex}`
          : `tasks_incompleted_index_${pointIndex}`;
      await AsyncStorage.setItem(
        key,
        JSON.stringify(GLOBAL.cashData.todayTask[completed][pointIndex].tasks)
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  public async setHelpData(): Promise<boolean> {
    try {
      await AsyncStorage.setItem("help", GLOBAL.help);
      return true;
    } catch (e) {
      return false;
    }
  }
  // for data from web server
  public async getHelpData(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem("help");
      if (value !== null) {
        GLOBAL.help = value;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Export a single instance of AsyncStorageHelperImpl
export const asyncStorageHelper = new AsyncStorageImpl();
