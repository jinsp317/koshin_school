import Strings from "@src/assets/strings";
import React from "react";
import { View, ToastAndroid } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { PatientModel, RequestPatientModel, PatientFindModel, MANAGE_KIND, HospitalModel } from "@src/core/model";
import { Patients } from "./patients.component";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { SearchIconFill, HospitalIcon } from "@src/assets/icons";
import { HospitalSelectModal } from "./hospitalSelect.modal";
import Modal from "react-native-modal";
import { GlobalHelpModal, GlobalHelpButton } from "@src/components/common";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import AlertPro from "@src/components/common/alertPro";
import { database } from "@src/core/utils/database";
import BackgroundJob from "react-native-background-job";
import { EventRegister } from 'react-native-event-listeners';
enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2,
  REFESH = 3
}
interface State {
  data: PatientModel[] | undefined;
  uploadOk: boolean;
  isLoading: boolean;
  downAllData: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  showFooterLabel: boolean;
  isIn: boolean;
  isModalVisible: boolean;
  isRefresh: boolean;
  showGlobalHelp: boolean;
  showGlobalHelpButton: boolean;
}
interface ComponentProps {
  pInfo?: PatientModel | undefined;
}

type Props = NavigationScreenProps & ComponentProps;
export class PatientsScreen extends React.Component<Props, State> {
  private _alertPro: any;
  private focusListener: any;
  private blurListener: any;

  private _isIn: boolean;
  private _beginDate: Date;
  private _endDate: Date;
  readonly _recordsPerPage = 50;
  private _recordCount: number;
  private _curPage: number;
  private _pageCount: number;


  private _reqParam: RequestPatientModel;

  private isUpdating = false;

  constructor(props: NavigationScreenProps) {
    super(props);
    const today = new Date();
    this._endDate = today;
    this._beginDate = this.getBeginDate(0); // all

    this._recordCount = 0;
    this._curPage = 0;
    this._pageCount = 0;
    this._reqParam = {};
    this._isIn = true;

    this.state = {
      data: [],
      uploadOk: true,
      isLoading: true,
      downAllData: false,
      downDataFailed: false,
      recentUpdateTime: undefined,
      showFooterLabel: false,
      isIn: true,
      isRefresh: false,
      isModalVisible: false,
      showGlobalHelp: false,
      showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0
    };
  }

  componentDidMount() {
    /* if (GLOBAL.IS_FIRST_VISIT) {
      GLOBAL.IS_FIRST_VISIT = false;
      if (GLOBAL.curRouteName) this.props.navigation.navigate(GLOBAL.curRouteName);
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData();
      });

    } */

    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      GLOBAL.curRouteName = this.props.navigation.state.routeName;
      asyncStorageHelper.setSessionInfos();

      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this.updateData();
      });
      EventRegister.addEventListener(GLOBAL.sync_success, () => {
        database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
          this.updateData(UpdateKind.REFESH);
        });
      });
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => {
      EventRegister.removeAllListeners();
    })
  }
  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
    EventRegister.removeAllListeners();
  }
  componentWillMount() {
    this.setNavigationParams();

  }
  componentWillReceiveProps(nextProps) {
    this.updateData();
  }

  onTopLeftPress = () => {
    this.setState({ showGlobalHelp: false, isModalVisible: true });
  };
  onTopRightPress = () => {
    this.props.navigation.navigate("Task FilterB", {
      onGoBack: this.onGoBack,
      kind: 1
    });
  };
  private procFindModalOK = (bUpdate: boolean) => {
    // ModalService.hide(this.findModalId);
    this.setState({ isModalVisible: false });
    if (bUpdate) this.updateData();
  };

  private setNavigationParams() {
    if (
      GLOBAL.curUser.relatedHospitals &&
      GLOBAL.curUser.relatedHospitals.length > 0 &&
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
    this.setState({ isRefresh: true });
    this.updateData(UpdateKind.REFESH);
  };

  private onEndReached = () => {
    // if (!this.state.downAllData) {
    //   this._curPage++;
    //   this.updateData(UpdateKind.ADD2FOOTER);
    // }
  };
  private onIsInChange = (kind: number) => {
    this._isIn = kind == 0 ? true : false;
    this.updateData(UpdateKind.ADD2ZERO);
  };

  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (kind: UpdateKind = UpdateKind.ADD2ZERO) => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    if (kind == UpdateKind.ADD2ZERO) this.setState({ isLoading: true });
    const that = this;
    let showFooterLabel = this.state.showFooterLabel;

    this.updateDataPromise(kind)
      .then(data => {
        if (data) {
          let new_data: PatientModel[] = [];

          // if (kind == UpdateKind.ADD2ZERO || UpdateKind.REFESH) {
          new_data = data;
          showFooterLabel = false;
          // } else if (kind == UpdateKind.ADD2FOOTER) {
          //   new_data = that.state.data.concat(data);
          //   showFooterLabel = true;
          // } else if (kind == UpdateKind.ADD2HEADER) {
          //   new_data = data.concat(that.state.data);
          // }

          const downAllData = kind == UpdateKind.ADD2ZERO ? false : that.state.downAllData;

          that.setState({
            recentUpdateTime: that._reqParam.end_time,
            downAllData,
            showFooterLabel,
            data: new_data,
            isLoading: false,
            isRefresh: false,
            downDataFailed: false,
            isIn: this._isIn
          });
          this.isUpdating = false;
        } else {
          if (kind == UpdateKind.ADD2ZERO) {
            showFooterLabel = false;
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              downAllData: true,
              showFooterLabel,
              isLoading: false,
              downDataFailed: false,
              isRefresh: false,
              data: [],
              isIn: this._isIn
            });
            this.isUpdating = false;
          } else {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              downAllData: true,
              showFooterLabel,
              isLoading: false,
              downDataFailed: false,
              isRefresh: false,
              isIn: this._isIn
            });
            this.isUpdating = false;
          }
        }
      })
      .catch(() => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        if (kind == UpdateKind.ADD2FOOTER) that._curPage--;
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<PatientModel[]> => {
    const that = this;

    this._reqParam = { departments: [], patients: [], patient: {} };
    const reqParam = this._reqParam;

    if (this._isIn != undefined) {
      reqParam.patient = { is_in: this._isIn ? 1 : 0, id: 0, name: '' };
    }
    if (this._beginDate) reqParam.begin_time = UTILS.getBeginEndTimeString(this._beginDate, true);
    if (kind == UpdateKind.ADD2FOOTER) {
      reqParam.end_time = this.state.recentUpdateTime;
    } else {
      if (this._endDate) {
        reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
          new Date(),
          2
        )}`;
      }
    }
    if (kind == UpdateKind.ADD2HEADER) {
      reqParam.begin_time = this.state.recentUpdateTime;
      reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
        new Date(),
        2
      )}`;
    }
    /*
    if (this._findInfo.doctor_name) {
      reqParam.patient.doctor_name = this._findInfo.doctor_name;
    }
    if (this._findInfo.patient_name) {
      reqParam.patient.name = this._findInfo.patient_name;
    }
*/
    // my patients
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
      reqParam.patient = { is_in: reqParam.patient.is_in };
    }
    // patients
    if (GLOBAL.isFilterPatients) {
      reqParam.patients = GLOBAL.filterPaitentIds;
    }
    return new Promise(function (resolve, reject) {
      // let dataHelper = GLOBAL.isOffline ? database.patientsHelper : httpHelper;
      const dataHelper = database.patientsHelper;
      // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
      dataHelper
        .getPatientsRecordCount(reqParam)
        .then(responseJson => {
          if (responseJson.success) {
            that._recordCount = responseJson.count;
            that._pageCount = parseInt((that._recordCount / that._recordsPerPage).toString(), 0) + 1;

            if (that._recordCount && that._recordCount > 0) {
              if (kind == UpdateKind.ADD2ZERO) {
                that._curPage = 0;
                reqParam.from = 0;
                reqParam.count = that._recordsPerPage;
              } else if (kind == UpdateKind.ADD2FOOTER) {
                if (that._curPage < that._pageCount) {
                  reqParam.from = that._recordsPerPage * that._curPage;
                  reqParam.count = that._recordsPerPage;
                } else {
                  // 갱신자료가 더 없는 경우
                  resolve(undefined);
                }
              } else if (kind == UpdateKind.ADD2HEADER) {
                if (that._curPage < that._pageCount) {
                  // add all recent data
                  // reqFPMParam.from = 0;
                  // reqFPMParam.count = that._recordsPerPage;
                } else {
                  // 갱신자료가 더 없는 경우
                  resolve(undefined);
                }
              }

              dataHelper
                .downloadPatients(reqParam)
                .then(responseJson => {
                  if (responseJson.result) resolve(responseJson.result);
                  else resolve(undefined);
                })
                .catch(exception => reject(exception));
            } else {
              resolve(undefined);
            }
          } else {
            reject(responseJson.message);
          }
        })
        .catch(exception => reject(exception));
    });
  };

  private onItemSelect = () => {
    const xpath = "Detail Main";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    GLOBAL.detailPatientTab = 0;
    if (GLOBAL.curPatient) this.props.navigation.navigate(xpath);
  };
  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      this.updateData();
    }
  };
  private onBtnInHospitalPress = () => {
    // 퇴원,입원대기중인 환자들에 대해서 입원수속을 진행

    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      UTILS.showToast(Strings.message.warning_noPrivillage);
      return;
    }
    // if (GLOBAL.isOffline) return;
    const xpath = "Patients OutHospital";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    this.props.navigation.navigate(xpath);
  };
  private onPopMenuPress = (index: number, kind: number) => {
    //        const { [index]: selectedItem } = this.state.data;
    if (kind === 0) {
      if (index === 0) {
        // Start Consult
        this.props.navigation.navigate("Consult Manage", {
          kind: MANAGE_KIND.ADD
        });
      } else if (index === 1) {
        // Proc OutHospital
        this.props.navigation.navigate("Inhospital Manage", {
          kind: MANAGE_KIND.OUT
        });
      } else if (index === 2) {
        // Modify InHospital
        this.props.navigation.navigate("Inhospital Manage", {
          kind: MANAGE_KIND.MODIFY
        });
      } else if (index === 10) {
        this.onDelete();
      }
    } else {
      if (index === 0) {
        // Start Visit
        this.props.navigation.navigate("Visit Manage", {
          kind: MANAGE_KIND.ADD
        });
      } else if (index === 1) {
        // Proc InInHospital
        this.props.navigation.navigate("Inhospital Manage", {
          kind: MANAGE_KIND.IN
        });
      } else if (index === 2) {
        // Delete
        this._alertPro.open();
      }
    }
  };
  private onDelete = () => {
    BackgroundJob.cancelAll();
    this._alertPro.open();
  };
  _renderAlert = () => {
    return (
      <AlertPro
        ref={ref => {
          this._alertPro = ref;
        }}
        onConfirm={() => this.deletePatient()}
        onCancel={() => {
          GLOBAL.startBackgroundJobs();
          this._alertPro.close();
        }}
        message={Strings.message.confirm_delete}
        textCancel={Strings.common.str_cancel}
        textConfirm={Strings.common.str_delete}
      />
    );
  };

  private deletePatient = () => {
    // if (GLOBAL.isOffline) {
    //   UTILS.alert(Strings.message.alert_isOffline);
    //   return;
    // }
    this.setState({ isLoading: true });
    const formData = new FormData();
    formData.append("id", GLOBAL.curPatient.id);
    database.patientsHelper.updateData(GLOBAL.curPatient, MANAGE_KIND.DEL).then(response => {
      if (response.success) {
        UTILS.showToast(Strings.message.op_success);
        this.updateData();

      } else {
        UTILS.showToast(Strings.message.op_fail);
        this.setState({ isLoading: false });
      }
      GLOBAL.startBackgroundJobs();
    }).catch(() => {
      this.setState({ isLoading: false });
      UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
      GLOBAL.startBackgroundJobs();
    });

  };
  render() {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          {this._renderAlert()}
          <Modal
            isVisible={this.state.isModalVisible}
            onBackdropPress={() => this.setState({ isModalVisible: false, showGlobalHelp: false })}
            onSwipeComplete={() => this.setState({ isModalVisible: false, showGlobalHelp: false })}
            onBackButtonPress={() => this.setState({ isModalVisible: false, showGlobalHelp: false })}
            swipeDirection="left"
            style={{ alignItems: "center" }}
          >
            {this.state.showGlobalHelp ? (
              <GlobalHelpModal />
            ) : (
                <HospitalSelectModal onOK={this.procFindModalOK} />
              )}
          </Modal>
          <Patients
            data={this.state.data}
            downAllData={this.state.downAllData}
            showFooterLabel={this.state.showFooterLabel}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={this.onItemSelect}
            onEndReached={this.onEndReached}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
            onBtnInHospitalPress={this.onBtnInHospitalPress}
            isLoading={this.state.isRefresh}
            onIsInChange={this.onIsInChange}
            isYuannei={this.state.isIn}
            onPopMenuPress={this.onPopMenuPress}
          />
          <GlobalHelpButton
            isVisible={this.state.showGlobalHelpButton}
            onPress={() => this.setState({ showGlobalHelp: true, isModalVisible: true })}
          />
        </View>
      );
  }
}
