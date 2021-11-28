import Strings from "@src/assets/strings";
import React, { memo } from "react";
import {
  View,
  Text,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityProps,

} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps,
} from "@src/core/react-native-ui-kitten/theme";

import { PatientModel, GlucoseMonitorModel, MANAGE_KIND, HospitalModel } from "@src/core/model";
import { MyDatePicker, textStyle, ContainerView } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { SaveIconOutline, DefAvataIconFill, MyPatientIcon } from "@src/assets/icons";
import { Notice } from '@src/core/model/table.model';
import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { Input, RadioGroup, Radio, Button } from "@src/core/react-native-ui-kitten/ui";
import { EditInput } from "@src/components/common";
import ProgressBar from "@src/components/common/progressBar.component";
import AlertPro from "@src/components/common/alertPro";
import DateTimePicker from "react-native-modal-datetime-picker";
import { ProfileSetting } from "@src/components/social";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUtensils, faUnlink, faTrash } from '@fortawesome/free-solid-svg-icons'
import {
  PersonIconFill,
  CreditCardIconFill,
  DoctorIconOutline,
  StateEatIconFill,
  StateDoubleIconFill,
  NewPatientIcon
} from "@src/assets/icons";
import { renderIconElement } from '@src/core/app_utils'
import CategoryPicker from "@src/components/common/categoryPicker.component";
import moment from 'moment';
interface ComponentProps {
  onSave: (monitor: GlucoseMonitorModel, notice: Notice, notice1: Notice, kind: MANAGE_KIND, otherRecs: GlucoseMonitorModel[], finish: boolean) => void;
  patient: PatientModel;
  monitor: GlucoseMonitorModel;
  noticeShow: boolean;
  isLoading: boolean;
  value: number;
  state: number;
  cid: number;
  onManualInput: (mId: number) => void;
  hospitalInfo: HospitalModel;
  tempMonitor?: GlucoseMonitorModel;
  curMoniters: GlucoseMonitorModel[];
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  isLoading: boolean;
  memo: string;
  tempMonitor: GlucoseMonitorModel;
  // curMoniters: GlucoseMonitorModel[];
  isMonitorTimeVisible: boolean;
  isEatTimeVisiable: boolean;
  measureTime: string;
  eat_time: string;
  isNoticeMealTimeVisible: boolean;
  noticeTime: Date;
  noticeCheck: boolean;
  noticeId: number;
  noticeId1: number;
  afterTime: number;
  afterTime1: number;
  mealFlag: boolean;
  retryFlag: boolean;
  isMeal: boolean;

}

class MyComponent extends React.Component<Props, State> {
  private _alertPro: any;
  private _monitor: GlucoseMonitorModel;
  private _afterTime1: number;
  private _mealTime: Date;
  private _editKind: boolean;
  private _deleteId: number;
  private _updateIds: number[];
  private _pId: number;

  constructor(props: Props) {
    super(props);
    this._monitor = props.monitor;
    this._mealTime = undefined;
    this._afterTime1 = 0;
    this._updateIds = [];
    const notices = this._monitor && this._monitor.notice_obj ? this._monitor.notice_obj.split(',') : [];
    const eat_time = this.props.monitor.eat_time;
    const mealFlag = this.props.monitor.state === GLOBAL.mealState;
    const retryFlag = this.props.monitor.state === GLOBAL.retryState;
    if (notices?.length > 0) {
      // console.log(notices);
      const after1 = notices[0].split('%');
      let noticeTime = UTILS.createDate(after1[1]);
      const ntId = parseInt(after1[0], 0);
      const time = UTILS.createDate(this._monitor.time);
      const minutes = Math.floor(moment(noticeTime).diff(moment(time), 'minute') / 5);
      let minutes1 = 0;
      let ntId1 = -1;
      if (notices.length == 2) {
        const after2 = notices[1].split('%');
        ntId1 = parseInt(after2[0], 0);
        noticeTime = UTILS.createDate(after2[1]);
        minutes1 = Math.floor(moment(noticeTime).diff(moment(time), 'minute') / 30);
      }
      // const after = GLOBAL.REMONITOR_A.findIndex(_it => Number.parseInt(_it, 0) == minutes);
      // console.log(after);

      this.state = {
        tempMonitor: this.props.monitor,
        // curMoniters: this.props.curMoniters,
        isLoading: this.props.isLoading,
        memo: this._monitor.memo,
        isMonitorTimeVisible: false,
        afterTime: minutes,
        afterTime1: minutes1,
        isNoticeMealTimeVisible: false,
        measureTime: this.props.monitor.time,
        noticeTime: noticeTime,
        noticeCheck: true,
        eat_time: eat_time,
        mealFlag: mealFlag,
        retryFlag: retryFlag,
        isEatTimeVisiable: false,
        isMeal: this.props.monitor.eat_time ? true : false,
        noticeId: ntId,
        noticeId1: ntId1,
      };

    } else {
      this.state = {
        tempMonitor: this.props.monitor,
        // curMoniters: this.props.curMoniters,
        isLoading: this.props.isLoading,
        memo: this._monitor.memo,
        isMonitorTimeVisible: false,
        isNoticeMealTimeVisible: false,
        measureTime: this.props.monitor.time,
        noticeTime: undefined,
        noticeCheck: false,
        afterTime: 0,
        afterTime1: 0,
        eat_time: eat_time,
        mealFlag: mealFlag,
        retryFlag: retryFlag,
        isEatTimeVisiable: false,
        isMeal: this.props.monitor.eat_time ? true : false,
        noticeId: -1,
        noticeId1: -1,
      };
    }

  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.cid == this.state.tempMonitor.id) {
      const monitor = this.state.tempMonitor;
      monitor.state = nextProps.state;
      monitor.value = nextProps.value;
      /// monitor.va
    } else {
      const moniters = this.props.curMoniters;
      if (moniters?.length > 0) {
        moniters.forEach(_it => {
          if (_it.id === nextProps.cid) {
            _it.state = nextProps.state;
            _it.value = nextProps.value;
            this.postUpdateData(_it.id);
          }
        });
      }

      /// moniters.sort('')
      // const mintor = moniters.find(_it => _it.id = nextProps.cid);



    }
    // console.log(nextProps.cid);
  }
  private onSave = () => {
    this.setState({ isLoading: true });
    const moniter = this.state.tempMonitor;
    moniter.time = this.state.measureTime;
    // if (this.state.isMeal) {
    moniter.eat_time = this.state.eat_time;
    // } else {
    //   moniter.eat_time = '';
    // }

    const notice: Notice = { id: -1 };
    const notice1: Notice = { id: -1 };
    if (this.state.noticeId > 0 || this.state.afterTime > 0) {
      const addMinutes = this.state.afterTime * 5;
      const noticeTime = UTILS.modifyDate(this.state.tempMonitor.time, addMinutes, true, 3);
      const patient_id = this.state.afterTime > 0 ? this.state.tempMonitor.patient_id : 0;
      notice.id = this.state.noticeId > 0 ? this.state.noticeId : 0;
      notice.patient_id = patient_id;
      notice.record_id = this.state.tempMonitor.id;
      notice.type = this.state.tempMonitor.point;
      notice.notice = UTILS.getFormattedDate(noticeTime, 1);
      notice.date = UTILS.getFormattedDate(noticeTime, 0);
      notice.flag = this.state.afterTime > 0 ? 1 : 0;
      // notice = {
      //   id: this.state.noticeId,
      //   patient_id: patient_id,
      //   record_id: this.state.tempMonitor.id,
      //   type: this.state.tempMonitor.point,
      //   date: UTILS.getFormattedDate(noticeTime, 0),
      //   notice: UTILS.getFormattedDate(noticeTime, 1),
      //   flag: this.state.noticeCheck ? 1 : 0
      // };
    }
    if (this.state.noticeId1 > 0 || this.state.afterTime1 > 0) {
      const addMinutes = this.state.afterTime1 * 30;
      const noticeTime = UTILS.modifyDate(this.state.tempMonitor.time, addMinutes, true, 3);
      const patient_id = this.state.afterTime1 > 0 ? this.state.tempMonitor.patient_id : 0;
      notice1.id = this.state.noticeId1 > 0 ? this.state.noticeId1 : 0;
      notice1.patient_id = patient_id;
      notice1.record_id = this.state.tempMonitor.id;
      notice1.type = this.state.tempMonitor.point;
      notice1.notice = UTILS.getFormattedDate(noticeTime, 1);
      notice1.date = UTILS.getFormattedDate(noticeTime, 0);
      notice1.flag = this.state.afterTime1 > 0 ? 1 : 0;
    }
    const otherRecs: GlucoseMonitorModel[] = this.getUpdateRecords();
    this.props.onSave(this.state.tempMonitor, notice, notice1, MANAGE_KIND.MODIFY, otherRecs, true);
  };
  private getUpdateRecords = () => {
    const otherRecs: GlucoseMonitorModel[] = [];
    if (this._updateIds.length > 0) {
      const updateIds = this._updateIds;
      this.props.curMoniters.forEach(_it => {
        const updateFlag = updateIds.findIndex(id => id === _it.id) > -1;
        if (updateFlag) {
          otherRecs.push(_it);
        }
      })
    }
    return otherRecs;
  }
  private onDelete = (id: number) => {
    this._deleteId = id;
    this._alertPro.open();
  };
  _renderAlert = () => {
    return (
      <AlertPro
        ref={(ref) => {
          this._alertPro = ref;
        }}
        onConfirm={() => this.onDeleteProc()}
        onCancel={() => this._alertPro.close()}
        message={Strings.message.confirm_delete}
        textCancel={Strings.common.str_cancel}
        textConfirm={Strings.common.str_delete}
      />
    );
  };
  private onDeleteProc = () => {
    this.setState({ isLoading: true });
    if (this._deleteId === this.state.tempMonitor.id) {
      const notice: Notice = { id: -1, patient_id: 0, record_id: 0, notice: '', flag: 0 };
      const notice1: Notice = { id: -1, patient_id: 0, record_id: 0, notice: '', flag: 0 };
      if (this.state.noticeId > 0) {
        notice.id = this.state.noticeId;
        notice.patient_id = this.state.tempMonitor.patient_id;
        notice.record_id = this.state.tempMonitor.id;
      }
      if (this.state.noticeId1 > 0) {
        notice.id = this.state.noticeId1;
        notice.patient_id = this.state.tempMonitor.patient_id;
        notice.record_id = this.state.tempMonitor.id;
      }
      const otherRecs: GlucoseMonitorModel[] = this.getUpdateRecords();
      this.props.onSave(this._monitor, notice, notice1, MANAGE_KIND.DEL, otherRecs, true);
    } else {
      const curMoniters = this.props.curMoniters;
      curMoniters.forEach(_it => {
        if (_it.id === this._deleteId) {
          _it.flag = 0;
          this.postUpdateData(_it.id);
        }
      });
    }

  };

  private onMemoChange = (memo: string) => {
    this.setState({ memo });
    this._monitor.memo = memo;
  };
  private showDateTimePicker = (isShow: boolean) => {
    this.setState({ isMonitorTimeVisible: isShow });
  };
  private hideEatTimePicker = () => {
    this.setState({ isEatTimeVisiable: false });
  }
  // private showEatTimePicker = () => {
  //   this.setState({ isEatTimeVisiable: true });
  // }
  private showMeasureTimePicker = (time: string, pId: number) => {
    this._editKind = true;
    this._pId = pId;
    this.setState({ measureTime: time, isMonitorTimeVisible: true });
  }
  private showEatTimePicker = (time: string, pId: number) => {
    this._editKind = false;
    this._pId = pId;
    this.setState({ measureTime: time, isMonitorTimeVisible: true });
  }
  private toggleNotice = () => {
    if (this.state.isMeal) {
      this._mealTime = undefined;
      this.setState({ isMeal: false });
    } else {
      this.setState({ isNoticeMealTimeVisible: true });
    }

  }
  private conFirmNotice(cdate: Date) {
    this.setState({ isNoticeMealTimeVisible: false, isMeal: true });
    this._mealTime = cdate;
  }
  private postUpdateData = (pId: number) => {
    const updateIds = this._updateIds;
    const eCheck = updateIds.findIndex(_id => _id === pId) < 0;
    if (eCheck) {
      this._updateIds.push(pId);
    }
  }
  handleDatePicked = (date) => {
    if (__DEV__) console.info("A date has been picked: ", date);
    const newMonitor = { ...this.state.tempMonitor };
    const time = UTILS.getFormattedDate(date, 3);
    if (this._pId == 0) {
      if (this._editKind) {
        newMonitor.time = time;
        this._monitor.time = time;
      } else {
        newMonitor.eat_time = time;
        this.setState({ eat_time: time });
        this._monitor.eat_time = time;
      }

    } else {
      const moniters = this.props.curMoniters;
      moniters.forEach(_it => {
        if (_it.id === this._pId) {
          if (this._editKind) {
            _it.time = time;
          } else {
            _it.eat_time = time;
          }
          this.postUpdateData(this._pId);
        }
      })
    }

    this.setState({ measureTime: newMonitor.time });
    this.showDateTimePicker(false);
  }
  private selectEatTimePicked = (date) => {
    const newMonitor = { ...this.state.tempMonitor };
    const eat_time = UTILS.getFormattedDate(date, 3);
    this.setState({ eat_time: eat_time });
    this.hideEatTimePicker();
  }
  private onChangeNoticeTime = (index: number, value: string) => {
    this.setState({ afterTime: index })
  }
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const isMyPatient = this.props.patient.doctor_id == GLOBAL.curUser.id ||
      this.props.patient.nurse_id == GLOBAL.curUser.id ? true : false;
    const notices = this.props.monitor.notice_obj ? this.props.monitor.notice_obj.split(',') : [];
    // const nTime = notices.length ? UTILS.createDate(notices[1]) : UTILS.createDate();

    if (this.state.isLoading && GLOBAL.SHOW_LOADING) {
      return (
        <View style={commonStyles.progressBar}>
          <ProgressBar />
        </View>
      );
    }

    return (
      <ContainerView
        style={themedStyle.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={"interactive"}
      >
        {this._renderAlert()}
        <View>
          <View style={themedStyle.sectionA}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
            }}
            >
              {UTILS.renderIconElement(DefAvataIconFill, commonStyles.iconAvata)}
              <Text style={themedStyle.sectionTextMain}>
                {this.props.patient.bed_number ? `${this.props.patient.name} ${this.props.patient.bed_number} 床`
                  : this.props.patient.name}
              </Text>
              {isMyPatient && UTILS.renderIconElement(MyPatientIcon, commonStyles.iconMark)}
            </View>
            <View>
              <Text style={themedStyle.sectionTextSub}>
                {this.props.patient.age
                  ? `${GLOBAL.SEXS[this.props.patient.gender === 1 ? 1 : 0]} ${this.props.patient.age}岁`
                  : GLOBAL.SEXS[this.props.patient.gender]}
              </Text>
            </View>
          </View>
          {this.state.mealFlag && (
            <View style={themedStyle.sectionA}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
              {renderIconElement(StateEatIconFill, commonStyles.iconMark)}
                <Text style={themedStyle.hintLabel}>{`  ${Strings.menu.task_mealShow}`}</Text>
              </View>
              <TouchableOpacity onPress={() => {
                this.showEatTimePicker(this.state.eat_time, 0);
              }}>
                <View>
                  <Text style={themedStyle.hintLabel}>{UTILS.getFormattedDate(this.state.eat_time, 3)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          {this.state.retryFlag && (
            <View style={themedStyle.sectionA}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={themedStyle.hintLabel}>{`${UTILS.getGlucoseValueString(this.state.tempMonitor)} ${Strings.menu.task_retryShow}`}</Text>
              </View>
              <TouchableOpacity onPress={() => {
                this.showEatTimePicker(this.state.eat_time, 0);
              }}>
                <View>
                  <Text style={themedStyle.hintLabel}>{UTILS.getFormattedDate(this.state.eat_time, 3)}</Text>
                </View>
              </TouchableOpacity>
              <View>
                <DateTimePicker
                  isVisible={this.state.isEatTimeVisiable}
                  is24Hour={true}
                  mode={"time"}
                  date={UTILS.createDate(this.state.eat_time)}
                  timePickerModeAndroid={"spinner"}
                  onConfirm={(date) => this.selectEatTimePicked(date)}
                  onCancel={() => this.hideEatTimePicker()}
                />
              </View>
            </View>
          )}
          {!(this.state.mealFlag || this.state.retryFlag) && (
            <Section style={themedStyle.sectionA}>
              <Text style={themedStyle.hintLabel}>{"提醒时间1 :  "}</Text>
              <CategoryPicker
                options={GLOBAL.REMONITOR_A}
                defCategoryIndex={this.state.afterTime}
                selectCategory={(i, v) => {
                  this.setState({ afterTime: i });
                }}
              />
            </Section>
          )}
          {(!(this.state.mealFlag || this.state.retryFlag) && this.state.afterTime > 0) && (
            <Section style={themedStyle.sectionA}>
              <Text style={themedStyle.hintLabel}>{"提醒时间2 :  "}</Text>
              <CategoryPicker
                options={GLOBAL.REMONITOR_B}
                defCategoryIndex={this.state.afterTime1}
                selectCategory={(i, v) => {
                  this.setState({ afterTime1: i });
                }}
              />
            </Section>
          )}
          {!(this.state.mealFlag || this.state.retryFlag) && (
            <TouchableOpacity onPress={() => {
              this.props.onManualInput(this.state.tempMonitor.id);
            }}>
              <View style={themedStyle.sectionA}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={themedStyle.hintLabel}>{Strings.common.str_glucoseVal}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                  <Text style={UTILS.getGlucoseValueStyle(this.state.tempMonitor, this.props.hospitalInfo)}>
                    {UTILS.getGlucoseValueString(this.state.tempMonitor)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <View style={themedStyle.sectionA}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={themedStyle.hintLabel}>{Strings.menu.task_measurePoint}</Text>
            </View>
            <View>
              <Text style={themedStyle.hintLabel}>{GLOBAL.COMMON_POINTS[this._monitor.point]}</Text>
            </View>
          </View>

          <Section style={themedStyle.sectionA} onPress={() => {
            this.showMeasureTimePicker(this.props.monitor.time, 0);
          }}>
            <View style={{ flexDirection: "row", flex: 1 }}>
              <ProfileSetting hint={Strings.menu.task_measureTime} value={UTILS.getFormattedDate(this.state.measureTime, 3)} />
            </View>
            <View>
              <DateTimePicker
                isVisible={this.state.isMonitorTimeVisible}
                is24Hour={true}
                mode={"time"}
                date={UTILS.createDate(this.state.measureTime)}
                timePickerModeAndroid={"spinner"}
                onConfirm={(date) => this.handleDatePicked(date)}
                onCancel={() => this.showDateTimePicker(false)}
              />
            </View>
          </Section>

          <View style={themedStyle.section}>
            <EditInput
              style={themedStyle.profileSetting}
              hint={Strings.common.str_memo}
              onChangeText={this.onMemoChange}
              value={this.state.memo}
              placeholder={Strings.message.input_memo}
            />
          </View>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            marginTop: 30,
            marginBottom: 12
          }}
          >
            <Button status="danger"
              style={{ width: 150 }}
              onPress={(ev) => {
                this.onDelete(this.state.tempMonitor.id);
              }}
            >
              {Strings.common.str_delete}
            </Button>
            <Button
              //              status="warning"
              style={{ width: 150 }}
              onPress={this.onSave}
            >
              {Strings.common.str_save}
            </Button>
          </View>
          {this.props.curMoniters?.length > 1 && (

            this.props.curMoniters.map(_it => {
              if (_it.id == this.state.tempMonitor.id || _it.flag !== 1) return;
              return (
                <View style={themedStyle.sectionA} key={_it.id}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={themedStyle.hintLabel}>{Strings.common.str_glucoseVal}</Text>
                  </View>
                  {(_it.state === GLOBAL.mealState || _it.state === GLOBAL.retryState) ? (
                    <TouchableOpacity onPress={() => {
                      this.showEatTimePicker(_it.eat_time, _it.id);
                    }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={themedStyle.hintLabel}>{`${UTILS.getGlucoseValueString(_it)}${UTILS.getFormattedDate(_it.eat_time, 4)}`}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => {
                      this.props.onManualInput(_it.id);
                    }}>
                      <Text style={UTILS.getGlucoseValueStyle(_it, this.props.hospitalInfo)}>
                        {UTILS.getGlucoseValueString(_it)}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => {
                    this.showMeasureTimePicker(_it.time, _it.id);
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={themedStyle.hintLabel}>{UTILS.getFormattedDate(_it.time, 4)}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => {
                      this.onDelete(_it.id);
                    }}>
                      <FontAwesomeIcon icon={faTrash} style={{
                        color: 'gray'
                      }} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ContainerView>
    );
  }
}

interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (props?: SectionProps): React.ReactElement<TouchableOpacityProps> => {
  return <TouchableOpacity activeOpacity={0.65} {...props} />;
};

export const MonitorResult = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
  },
  section: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"],
  },
  buttonCls: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'seagreen',
    borderRadius: 5,
    borderColor: 'seagreen',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row"
  },
  sectionA: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: theme["border-basic-color-2"],
  },
  sectionTextMain: {
    ...textStyle.subtitle,
    color: theme["text-basic-color"],
    fontSize: 18,
    marginHorizontal: 10,
  },
  sectionTextSub: {
    ...textStyle.subtitle,
    color: theme["#ccc"],
    fontSize: 18,
    marginRight: 10,
  },
  hintLabel: { ...textStyle.caption2, fontSize: 18 },
  sectionDatePickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 0,
  },
  sectionCategoryPickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 8,
  },
  profileSetting: {
    fontSize: 18,
  },
}));
