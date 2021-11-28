import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { VisitModel, RequestVisitModel, PatientModel } from "@src/core/model";
import { VisitLog } from "./visitLog.component";

import { database } from "@src/core/utils/database";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { ThemedComponentProps, withStyles, ThemeType } from "@src/core/react-native-ui-kitten";
import RNFetchBlob from "rn-fetch-blob";
import Modal from "react-native-modal";
import { ShowImageModal } from "@src/components/common";
import { AppSync } from "@src/core/appSync";
import { EventRegister } from "react-native-event-listeners";

enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: VisitModel[] | undefined;
  isLoading: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  isModalVisible: boolean;
  visit: VisitModel;
}
interface ComponentProps {
  navigation: NavigationParams;
}
type Props = ThemedComponentProps & ComponentProps;

class VisitLogScreen extends React.Component<Props, State> {
  private _seedInfo: PatientModel;
  private _endDate: Date;
  private _reqParam: RequestVisitModel;
  private isUpdating = false;
  private syncListener: any;

  constructor(props) {
    super(props);

    const today = new Date();
    this._endDate = today;

    this.state = {
      data: [],
      isLoading: true,
      downDataFailed: false,
      recentUpdateTime: undefined,
      isModalVisible: false,
      visit: undefined
    };
  }
  componentDidMount() {
    this._seedInfo = GLOBAL.curPatient; // this.props.navigation.getParam("seedInfo");
    this.updateData();
  }
  componentWillReceiveProps(nextProps) {
    // if (this._seedInfo === nextProps.seedInfo) return;
    // this._seedInfo = nextProps.seedInfo;
    // this.updateData();
  }
  componentWillMount() {
    EventRegister.addEventListener(GLOBAL.sync_success, data => {
      this.updateData();
    });
  }
  componentWillUnmount() {
    EventRegister.removeAllListeners();
  }
  public onRefresh = () => {
    this.setState({ isLoading: true });
    this.updateData(UpdateKind.ADD2HEADER);
  };

  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (kind: UpdateKind = UpdateKind.ADD2ZERO) => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    if (kind == UpdateKind.ADD2ZERO) this.setState({ isLoading: true });
    const that = this;
    this.updateDataPromise(kind)
      .then(data => {
        if (data) {
          let new_data: VisitModel[] = [];

          if (kind == UpdateKind.ADD2ZERO) {
            new_data = data;
          } else if (kind == UpdateKind.ADD2FOOTER) {
            new_data = that.state.data.concat(data);
          } else if (kind == UpdateKind.ADD2HEADER) {
            new_data = data.concat(that.state.data);
          }

          that.setState({
            recentUpdateTime: that._reqParam.end_time,
            data: new_data,
            isLoading: false,
            downDataFailed: false
          });
        } else {
          if (kind == UpdateKind.ADD2ZERO) {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              isLoading: false,
              downDataFailed: false,
              data: []
            });
          } else {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              isLoading: false,
              downDataFailed: false
            });
          }
        }
        this.isUpdating = false;
      })
      .catch(error => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<VisitModel[]> => {
    const that = this;

    this._reqParam = {};
    const reqParam = this._reqParam;

    if (this._seedInfo) {
      reqParam.patient_id = this._seedInfo.id;
    }
    if (this._endDate) {
      reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
        new Date(),
        2
      )}`;
    }

    if (kind == UpdateKind.ADD2HEADER) {
      reqParam.begin_time = this.state.recentUpdateTime;
      reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
        new Date(),
        2
      )}`;
    }
    return new Promise(function (resolve, reject) {
      database.patientsHelper.downloadVisits(reqParam)
        .then(responseJson => {
          if (responseJson.result) resolve(responseJson.result);
          else resolve(undefined);
        })
        .catch(exception => reject(exception));
    });
  };

  private onItemSelect = (item: VisitModel) => { };
  private onShowImage = (item: VisitModel) => {
    this.setState({ visit: item, isModalVisible: true });
    return;
    const filePath = `http://${GLOBAL.server_ip}/api/visit/image?token=${GLOBAL.token}&id=${item.id}`;
    RNFetchBlob.config({
      addAndroidDownloads: {
        useDownloadManager: true,
        title: "Show Visit Image",
        description: "An Image",
        mime: "image/png",
        mediaScannable: true,
        notification: true,
        path: RNFetchBlob.fs.dirs.DownloadDir + "/visit.tmp"
      },
      overwrite: true
    })
      .fetch("GET", filePath)
      .then(res => {
        RNFetchBlob.android.actionViewIntent(res.path(), "image/png");
      });
  };

  render() {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          <Modal
            isVisible={this.state.isModalVisible}
            onBackdropPress={() => this.setState({ isModalVisible: false })}
            onSwipeComplete={() => this.setState({ isModalVisible: false })}
            onBackButtonPress={() => this.setState({ isModalVisible: false })}
            swipeDirection="left"
          >
            <ShowImageModal data={this.state.visit} />
          </Modal>
          <VisitLog
            seedInfo={this._seedInfo}
            data={this.state.data}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={this.onItemSelect}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
            onShowImage={this.onShowImage}
          />
        </View>
      );
  }
}
export const VisitLogContainer = withStyles(VisitLogScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
