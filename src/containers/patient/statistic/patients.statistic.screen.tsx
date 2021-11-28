import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert, BackHandler, NativeModules } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { PatientModel, RequestPatientModel, PatientFindModel, MANAGE_KIND, HospitalModel, PatientMonitorRawModel } from "@src/core/model";
import { Patients } from "./patients.component";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { SearchIconFill, HospitalIcon } from "@src/assets/icons";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import AlertPro from "@src/components/common/alertPro";
import { database } from "@src/core/utils/database";
import BackgroundJob from "react-native-background-job";
import { EventRegister } from 'react-native-event-listeners';
import moment from 'moment';
import { UserSummary } from '../../../core/model/monitor.model';
enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2,
  REFESH = 3
}
interface State {
  // data: PatientModel[] | undefined;
  orgSummary: PatientMonitorRawModel[];
  userSummary: UserSummary[];
  uploadOk: boolean;
  isLoading: boolean;
  downAllData: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  showFooterLabel: boolean;
  isPatient: number;
  isModalVisible: boolean;
  showGlobalHelp: boolean;
  showGlobalHelpButton: boolean;
}
interface ComponentProps {
  pInfo?: PatientModel | undefined;
}

type Props = NavigationScreenProps & ComponentProps;
export class PatientsSatisticScreen extends React.Component<Props, State> {
  private _alertPro: any;
  private focusListener: any;

  private _kind: number;
  private _beginDate: Date;
  private _endDate: Date;
  readonly _recordsPerPage = 50;
  private _recordCount: number;
  private _curPage: number;
  private _pageCount: number;

  private _findInfo: PatientFindModel;

  private _reqParam: RequestPatientModel;

  private findModalId: string;
  private isUpdating = false;
  private syncListener: any;
  private _hospitalInfo: HospitalModel;

  constructor(props: NavigationScreenProps) {
    super(props);
    this._findInfo = {};
    const today = new Date();
    this._endDate = today;
    this._beginDate = this.getBeginDate(0); // all

    this._recordCount = 0;
    this._curPage = 0;
    this._pageCount = 0;
    this._reqParam = {};
    this._kind = 0;

    this.state = {
      // data: [],
      uploadOk: true,
      isLoading: true,
      downAllData: false,
      downDataFailed: false,
      recentUpdateTime: undefined,
      showFooterLabel: false,
      isPatient: 0,
      isModalVisible: false,
      showGlobalHelp: false,
      orgSummary: [],
      userSummary: [],
      showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0
    };
  }

  componentDidMount() {
    this.setNavigationParams();
    /* if (GLOBAL.IS_FIRST_VISIT) {
      GLOBAL.IS_FIRST_VISIT = false;
      if (GLOBAL.curRouteName) this.props.navigation.navigate(GLOBAL.curRouteName);
      /* database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData();
      }); 

    } */

    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      GLOBAL.curRouteName = this.props.navigation.state.routeName;
      asyncStorageHelper.setSessionInfos();

      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData();
      });
    });
    EventRegister.addEventListener(GLOBAL.sync_success, data => {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData();
      });
    });
  }
  componentWillUnmount() {
    // this.focusListener && this.focusListener.remove();
    EventRegister.removeAllListeners();
  }
  /*  componentWillReceiveProps(nextProps) {
     this.updateData();
   } */

  onTopLeftPress = () => {
    this.setState({ showGlobalHelp: false, isModalVisible: true });
  };
  onTopRightPress = () => {
    this.props.navigation.navigate("Task FilterA", {
      onGoBack: this.onGoBack,
      kind: 1
    });
  };

  private procFindModalOK = (bUpdate: boolean) => {
    // ModalService.hide(this.findModalId);
    this.setState({ isModalVisible: false });
    if (bUpdate) this.updateData();
  };
  private onUpdateTime = (date: Date) => {
    this._endDate = date;

    this.updateData();
  }
  private setNavigationParams() {
    if (GLOBAL.curUser.relatedHospitals && GLOBAL.curUser.relatedHospitals.length > 0 &&
      !GLOBAL.isOffline
    ) {
      const onLeftPress = this.onTopLeftPress;
      this.props.navigation.setParams({
        onLeftPress,
        leftIcon: HospitalIcon
      });
    }
    const onRightPress = this.onTopRightPress;
    this.props.navigation.setParams({
      onRightPress,
      rightIcon: SearchIconFill
    });
  }

  private getBeginDate = (index: number) => {
    let beginDate: Date;
    if (index > 0) {
      let modNum = 0;
      let modUnit = 0;
      if (index == 1) {
        modNum = 7;
        modUnit = 0; // 7 days
      } else if (index == 2) {
        modNum = 14;
        modUnit = 0; // 14 days
      } else if (index == 3) {
        modNum = 1;
        modUnit = 1; // 1 month
      } else if (index == 4) {
        modNum = 3;
        modUnit = 1; // 3 month
      }
      beginDate = UTILS.modifyDate(this._endDate, modNum, false, modUnit);
    }
    return beginDate;
  };
  onBeginDateChange = (index: number) => {
    this._beginDate = this.getBeginDate(index);
    this.updateData();
  };
  onEndDateChange = (date: Date) => {
    this._endDate = date;
    this._beginDate = this.getBeginDate(GLOBAL.curFPMLogBeginTimeIndex);
    this.updateData();
  };
  public onRefresh = () => {
    this.setState({ isLoading: true });
    this.updateData();
  };

  private onEndReached = () => {
    if (!this.state.downAllData) {
      this._curPage++;
      this.updateData();
    }
  };
  private onIsInChange = (kind: number) => {
    this._kind = kind;
  };

  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = () => {
    if (this.isUpdating) return;
    // this.setState({ isLoading: true });
    const that = this;
    const showFooterLabel = this.state.showFooterLabel;

    this.updateDataPromise().then(data => {
      this.updateUsersPromise().then(users => {
        that.setState({
          recentUpdateTime: that._reqParam.end_time,
          orgSummary: data,
          userSummary: users,
          showFooterLabel,
          isLoading: false,
          downDataFailed: false
        });
      }).catch(error => {
        that.setState({
          recentUpdateTime: that._reqParam.end_time,
          orgSummary: data,
          userSummary: [],
          showFooterLabel,
          isLoading: false,
          downDataFailed: false
        });
      })
      /* that.setState({
        recentUpdateTime: that._reqParam.end_time,
        orgSummary: data,
        showFooterLabel,
        isLoading: false,
        downDataFailed: false
      }); */
    })
      .catch(error => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true, orgSummary: [], userSummary: [] });
        // if (kind == UpdateKind.ADD2FOOTER) that._curPage--;
        this.isUpdating = false;
      });
  };
  private updateUsersPromise = (): Promise<UserSummary[]> => {
    const that = this;

    this._reqParam = { departments: [], patients: [], end_time: moment(this._endDate).format('YYYY-MM-DD'), is_in: 1 };
    const reqParam = this._reqParam;
    if (GLOBAL.isFilterMyCharge) {
      if (GLOBAL.curUser.job_position_type === 1) reqParam.patient.o_doctor_id = GLOBAL.curUser.id;
      if (GLOBAL.curUser.job_position_type === 2) reqParam.patient.o_nurse_id = GLOBAL.curUser.id;
    }
    // departments
    reqParam.departments = [];
    GLOBAL.totalDepartments.forEach(e => {
      if (e.checked) reqParam.departments.push(e.id);
    });

    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      reqParam.hospital_id = GLOBAL.curHospitalId;
      reqParam.departments = undefined;
      reqParam.patients = undefined;
      reqParam.patient = { is_in: reqParam.patient.is_in, id: 0, name: '' };
    }
    // patients
    if (GLOBAL.isFilterPatients) {
      reqParam.patients = GLOBAL.filterPaitentIds;
    }
    return new Promise(function (resolve, reject) {
      // let dataHelper = GLOBAL.isOffline ? database.patientsHelper : httpHelper;
      const dataHelper = database.patientsHelper;
      // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
      dataHelper.getUsersSummary(reqParam)
        .then(summary => {
          resolve(summary);
        })
        .catch(exception => reject(exception));
    });
  }
  private updateDataPromise = (): Promise<PatientMonitorRawModel[]> => {
    const that = this;

    this._reqParam = { departments: [], patients: [], end_time: moment(this._endDate).format('YYYY-MM-DD'), is_in: 1 };
    const reqParam = this._reqParam;

    if (GLOBAL.isFilterMyCharge) {
      if (GLOBAL.curUser.job_position_type === 1) reqParam.patient.o_doctor_id = GLOBAL.curUser.id;
      if (GLOBAL.curUser.job_position_type === 2) reqParam.patient.o_nurse_id = GLOBAL.curUser.id;
    }
    // departments
    reqParam.departments = [];
    GLOBAL.totalDepartments.forEach(e => {
      if (e.checked) reqParam.departments.push(e.id);
    });

    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      reqParam.hospital_id = GLOBAL.curHospitalId;
      reqParam.departments = undefined;
      reqParam.patients = undefined;
      reqParam.patient = { is_in: reqParam.patient.is_in, id: 0, name: '' };
    }
    // patients
    if (GLOBAL.isFilterPatients) {
      reqParam.patients = GLOBAL.filterPaitentIds;
    }
    return new Promise(function (resolve, reject) {
      // let dataHelper = GLOBAL.isOffline ? database.patientsHelper : httpHelper;
      const dataHelper = database.patientsHelper;
      // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
      dataHelper.getPatientSummary(reqParam)
        .then(summary => {
          resolve(summary);
        })
        .catch(exception => reject(exception));
    });
  };


  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      this.updateData();
    }
  };

  render() {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          <Patients
            patientData={this.state.orgSummary}
            userData={this.state.userSummary}
            downAllData={this.state.downAllData}
            showFooterLabel={this.state.showFooterLabel}
            downDataFailed={this.state.downDataFailed}
            onEndReached={this.onEndReached}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
            onIsInChange={this.onIsInChange}
            kind={this._kind}
            onUpdateTime={this.onUpdateTime}
            curDate={this._endDate}
          />

        </View>
      );
  }
}
