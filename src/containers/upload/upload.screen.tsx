import React from "react";
import { View, Alert, ToastAndroid, Text } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Upload } from "./upload.component";
import { UploadListItemModel, MANAGE_KIND, HospitalModel } from "@src/core/model";
import { database } from "@src/core/utils/database";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import Strings from "@src/assets/strings";
import GLOBAL from "@src/core/globals";
import { httpHelper } from "@src/core/utils/httpHelper";
import { UploadIconFill } from "@src/assets/icons";
import * as UTILS from "@src/core/app_utils";
import { GlobalHelpButton, GlobalHelpModal } from "@src/components/common";
import Modal from "react-native-modal";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import AlertPro from "@src/components/common/alertPro";
import { AppSync } from "@src/core/appSync";
import { EventRegister } from "react-native-event-listeners";

interface State {
  isLoading: boolean;
  data: UploadListItemModel[];
  tabIndex: number;
  isModalVisible: boolean;
  showGlobalHelpButton: boolean;
}

export class UploadScreen extends React.Component<NavigationScreenProps, State> {
  private _alertPro: any;
  private _item: UploadListItemModel;
  private _hospitalInfo: HospitalModel;
  private listener: any;
  private focusListener: any;
  private _timer: any;
  private _beAutoUpload = false;

  private _isRefresh: boolean;
  public state: State = {
    isLoading: true,
    data: [],
    tabIndex: 0,
    isModalVisible: false,
    showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0
  };
  componentDidMount() {
    this._isRefresh = false;
    GLOBAL.curRouteName = this.props.navigation.state.routeName;
    asyncStorageHelper.setSessionInfos();

    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      // get list form local db
      if (AppSync.hasLocalUpdate && !this.state.isLoading) {
        this.updateData();
      }
    });
    database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
      this._hospitalInfo = _hItem;
      this.updateData();
    });



    this._timer = setInterval(this.tick, 6000);
  }
  componentWillUnmount() {
    if (this._timer) clearInterval(this._timer);
    this.focusListener && this.focusListener.remove();
     EventRegister.removeAllListeners();
  }
  componentWillMount() {
     EventRegister.addEventListener(GLOBAL.sync_success, data => {
      this.updateData();
    });
    this.setNavigationParams();
  }

  private setNavigationParams() {
    const onRightPress = this.onUpload;
    const rightIcon = UploadIconFill;

    this.props.navigation.setParams({
      onRightPress,
      rightIcon
    });
  }

  private uploadData = (bShowLoading = false) => {
    // console.log('Upload Data -- kim');
    if (this.state.data.length <= 0) return;

    if (bShowLoading) this.setState({ isLoading: true });

    AppSync.uploadToServer()
      .then(() => {
        if (AppSync.hasLocalUpdate) {
          UTILS.showToast(Strings.message.upload_success);
        } else UTILS.showToast(Strings.message.upload_noData);

        this.updateData();
      })
      .catch(error => {
        UTILS.showToast(Strings.message.op_fail);
        this.setState({ isLoading: false });
      });
  };
  private onUpload = async (): Promise<void> => {
    // for (const item of AppSync.syncTables) {
    //   await database.emptyTable(item.table);
    // }

    // AppSync.lastSyncTime = "2019-01-01 00:00:00";
    if (GLOBAL.isOffline) {
      UTILS.showToast(Strings.message.warning_current_wifi_bad);
      return;
    }
    if (this.state.data.length > 0) {
      this.setState({ isLoading: true });
      AppSync.synchronize(false)
        .then(result => {
          const res = result;
          if (__DEV__) console.info("------ end sync count", res);
          this.updateData();
        })
        .catch(e => this.setState({ isLoading: false }));
    }

    return;
  };

  private tick = async () => {
    // upload to server
    if (GLOBAL.isOffline) return;
    await httpHelper
      .isServerAlive()
      .then(responseJson => {
        if (responseJson.success == true) {
          if (__DEV__) console.info("ServerAlive is ok");
          if (this._beAutoUpload) {
            if (this.state.data.length > 0) {
              if (this._timer) clearInterval(this._timer);
              this._timer = undefined;

              UTILS.showToast("数据即将自动上传到服务器");
              this.onUpload();
              // this.uploadData(false);
            }
          }
        }
      })
      .catch(error => { });
  };

  public updateData = () => {
    this.setState({ isLoading: true });
    if (this.state.tabIndex == 0) {
      database.uploadsHelper
        .getUploads(AppSync.lastSyncTime)
        .then(response => {
          if (response.success) {
            this.setState({ data: response.result, isLoading: false });
            if (response.result.length > 0) {
              this._beAutoUpload = true;
            }
          } else {
            this.setState({ data: [], isLoading: false });
          }
        })
        .catch(error => {
          if (__DEV__) console.error(error);
          this.setState({ isLoading: false });
        });
    } else {
      const data = [];
      this.setState({ data, isLoading: false });
    }
  };

  private onTabSelect = (tabIndex: number) => {
    // this.setState({ tabIndex }, () => {
    //  this.updateData();
    // });
  };

  private onItemSelect = (item: UploadListItemModel) => {
    // this.props.navigation.navigate(selectedItem.route);
  };
  private procDelete = () => {
    const formData = new FormData();
    formData.append("id", this._item.id);
    /// formData.append("delete_user_id", monitor.delete_user_id);
    if (this._item.kind === 0) {
      database.recordsHelper.manageGlucoseMonitor(formData, MANAGE_KIND.DEL).then(response => {
        if (response.success) {
          this.updateData();
        } else {
          UTILS.showToast(Strings.common.str_opFailed);
        }
      });
    } else if (this._item.kind === 1) {
      // fpm
      database.freeMeasuresHelper
        .manageFreePatientMeasure(formData, MANAGE_KIND.DEL)
        .then(response => {
          if (response.success) {
            this.updateData();
          } else {
            UTILS.showToast(Strings.common.str_opFailed);
          }
        });
    } else if (this._item.kind === 2) {
      // notice
      database.noticeHelper.setPatientNotice(formData, MANAGE_KIND.DEL).then(response => {
        if (response.success) this.updateData();
        else {
          UTILS.showToast(Strings.common.str_opFailed);
        }
      });
    }
  };
  private onItemLongPress = (item: UploadListItemModel) => {
    this._item = item;
    this._alertPro.open();
  };
  private onRefresh = () => {
    this._isRefresh = true;
    this.updateData();
  };
  _renderAlert = () => {
    return (
      <AlertPro
        ref={ref => {
          this._alertPro = ref;
        }}
        onConfirm={() => this.procDelete()}
        onCancel={() => this._alertPro.close()}
        message={Strings.message.confirm_delete}
      />
    );
  };

  public render(): React.ReactNode {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
        <Text style={{ marginVertical: 20 }}>{Strings.message.info_syncIsCurrentlyInProgress}</Text>
      </View>
    ) : (
        <View style={commonStyle.container}>
          {this._renderAlert()}
          <Modal
            isVisible={this.state.isModalVisible}
            onBackdropPress={() => this.setState({ isModalVisible: false })}
            onSwipeComplete={() => this.setState({ isModalVisible: false })}
            onBackButtonPress={() => this.setState({ isModalVisible: false })}
            swipeDirection="left"
          >
            <GlobalHelpModal />
          </Modal>
          <Upload
            data={this.state.data}
            selectedIndex={this.state.tabIndex}
            onItemPress={this.onItemSelect}
            onItemLongPress={this.onItemLongPress}
            onSelect={this.onTabSelect}
            onRefresh={this.onRefresh}
            isLoading={this.state.isLoading}
            hospitalInfo={this._hospitalInfo}
          />
          <GlobalHelpButton
            isVisible={this.state.showGlobalHelpButton}
            onPress={() => this.setState({ isModalVisible: true })}
          />
        </View>
      );
  }
}
