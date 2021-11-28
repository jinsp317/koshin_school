import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityProps
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";

import {
  PatientModel,
  GlucoseMonitorModel,
  MANAGE_KIND,
  ObjectModel,
  ConsultModel
} from "@src/core/model";
import { MyDatePicker, textStyle, ContainerView, SlideMenu } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { SaveIconOutline } from "@src/assets/icons";
import { themes } from "@src/core/themes";
import CategoryPicker from "@src/components/common/categoryPicker.component";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { Input, RadioGroup, Radio, Text } from "@src/core/react-native-ui-kitten/ui";
import { EditInput } from "@src/components/common";
import ProgressBar from "@src/components/common/progressBar.component";

interface ComponentProps {
  kind: number; // 0: in, 1: modify 2: out
  onSave: (consultData: ConsultModel) => void;
  navigation: any;
  consultData?: ConsultModel;
  isLoading: boolean;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  depart_index: number;
}

class MyComponent extends React.Component<Props, State> {
  private _consultData: ConsultModel;
  constructor(props: Props) {
    super(props);
    const today = UTILS.getFormattedDate(undefined, 1);
    this._consultData = props.consultData
      ? props.consultData
      : {
        patient_id: GLOBAL.curPatient.id,
        hospital_id: GLOBAL.curUser.hospital_id,
        department_id: GLOBAL.curPatient.department_id,
        request_time: today,
        requester_id: 0,
        state: 0,
        consult_time: today
      };

    const depart_index = UTILS.getIndexFromId(
      GLOBAL.totalDepartments,
      this._consultData.department_id
    );

    this.state = {
      depart_index
    };

    if (this.props.kind === MANAGE_KIND.ADD) {
      this._consultData.requester_id = undefined;
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState();
  }
  componentDidMount() {
    this.updateState();
  }
  componentWillMount() {
    this.setNavigationParams();
  }

  private setNavigationParams() {
    const onRightPress = this.onSave;
    const rightIcon = SaveIconOutline;
    let caption = Strings.patient.faqihuizhen;
    if (this.props.kind === MANAGE_KIND.MODIFY) caption = Strings.patient.xiugaizhuyuan;

    this.props.navigation.setParams({
      onRightPress,
      rightIcon,
      caption
    });
  }

  private updateState = () => { };

  private onSave = () => {
    if (!this._consultData.department_id) {
      UTILS.alert(Strings.message.input_department);
      return;
    }
    if (!this._consultData.requester_id) {
      UTILS.alert(Strings.message.input_doctor1);
      return;
    }
    if (this._consultData.requester_id === GLOBAL.curUser.id) {
      UTILS.alert(Strings.message.input_otherDoctor);
      return;
    }
    if (!this._consultData.request_time) {
      UTILS.alert(Strings.message.input_startTime);
      return;
    }

    if (!this._consultData.consult_time) {
      UTILS.alert(Strings.message.input_consultTime);
      return;
    }

    this.props.onSave(this._consultData);
  };

  private onDepartChange = (index: number) => {
    if (this.state.depart_index === index) return;
    const depart_index = index;
    this._consultData.department_id = GLOBAL.totalDepartments[depart_index].id;
    this._consultData.requester_id = undefined;

    this.setState({ depart_index });
  };
  private onDoctorChange = (index: number) => {
    const doctors = this.getFullDoctors(this.state.depart_index);
    const ids = UTILS.getSingleArrFromMultiArr(doctors, "id");
    this._consultData.requester_id = ids[index];
  };

  private onRequsetTimeChange = (date: Date) => {
    this._consultData.request_time = UTILS.getFormattedDate(date, 1);
  };
  private onConsultTimeChange = (date: Date) => {
    this._consultData.consult_time = UTILS.getFormattedDate(date, 1);
  };

  private getFullDoctors = (departIdx: number) => {
    return [{ id: undefined, name: "无" }, ...GLOBAL.totalDepartments[departIdx].doctors];
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    if (this.props.isLoading) {
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
        <View style={themedStyle.body}>
          <View style={themedStyle.section}>
            <EditInput
              editable={false}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_name}
              value={GLOBAL.curPatient.name}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.patient.list_keshi} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"MENU_DEPARTMENTS"}
                disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                data={UTILS.getSingleArrFromMultiArr(GLOBAL.totalDepartments, "name")}
                curItemIndex={this.state.depart_index}
                onMenuItemSelect={this.onDepartChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${"医生"} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"MENU_DOCTORS"}
                disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                data={UTILS.getSingleArrFromMultiArr(
                  this.getFullDoctors(this.state.depart_index),
                  "name"
                )}
                curItemIndex={UTILS.getIndexFromId(
                  this.getFullDoctors(this.state.depart_index),
                  this._consultData.requester_id
                )}
                onMenuItemSelect={this.onDoctorChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>

          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text
                style={commonStyles.sectionText}
              >{`${Strings.patient.list_faqishijian} :`}</Text>
              <MyDatePicker
                mode={"datetime"}
                format={"YYYY-MM-DD HH:mm"}
                onDateChange={date => this.onRequsetTimeChange(date)}
                date={
                  this._consultData.request_time
                    ? UTILS.createDate(this._consultData.request_time)
                    : UTILS.createDate(undefined)
                }
                maxDate={new Date()}
                textColor={themes["App Theme"]["color-basic-900"]}
              />
            </View>
          </View>
          {this.props.kind != MANAGE_KIND.IN && (
            <View style={themedStyle.section}>
              <View style={themedStyle.sectionDatePickerContent}>
                <Text
                  style={commonStyles.sectionText}
                >{`${Strings.patient.list_huizhenshijian} :`}</Text>
                <MyDatePicker
                  mode={"datetime"}
                  format={"YYYY-MM-DD HH:mm"}
                  hideText={this._consultData.consult_time ? false : true}
                  onDateChange={date => this.onConsultTimeChange(date)}
                  date={
                    this._consultData.consult_time
                      ? UTILS.createDate(this._consultData.consult_time)
                      : UTILS.createDate(undefined)
                  }
                  maxDate={new Date()}
                  textColor={themes["App Theme"]["color-basic-900"]}
                />
              </View>
            </View>
          )}
        </View>
      </ContainerView>
    );
  }
}

export const ConsultManage = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  },
  body: {
    paddingBottom: 6
  },
  section: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"]
  },
  sectionDatePickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 0
  },
  sectionCategoryPickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 8
  },
  radioGroup: {
    flexDirection: "row",
    paddingVertical: 6
  }
}));
