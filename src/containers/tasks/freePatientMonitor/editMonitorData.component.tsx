import Strings from "@src/assets/strings";
import React, { memo } from "react";
import {
  View,
  Text,
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

import { MANAGE_KIND, FPMDataModel } from "@src/core/model";
import { MyDatePicker, textStyle, ContainerView, SlideMenu } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { SaveIconOutline } from "@src/assets/icons";
import { themes } from "@src/core/themes";
import CategoryPicker from "@src/components/common/categoryPicker.component";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { Input, RadioGroup, Radio, Button } from "@src/core/react-native-ui-kitten/ui";
import { EditInput } from "@src/components/common";
import ProgressBar from "@src/components/common/progressBar.component";
import AlertPro from "@src/components/common/alertPro";
interface ComponentProps {
  onSave: (pinfo: FPMDataModel, kind: MANAGE_KIND) => void;
  pInfo?: FPMDataModel;
  isLoading: boolean;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  isLoading: boolean;
  name: string;
  certKind: number;
  certNum: string;
  address: string;
  glucoseVal: string;
  memo: string;
  temperature: string;
  pressure_high: string;
  pressure_low: string;
}

class MyComponent extends React.Component<Props, State> {
  private _alertPro: any;
  private _data: FPMDataModel;
  private _isEditable: boolean;
  constructor(props: Props) {
    super(props);
    /**
医生护士测的随测数据只可以由测量者本人删除及修改！！！
主任和护士长可以删除修改本科室的随测数据
管理员可以删除修改全院所有数据
     *
     */
    this._isEditable = false;

    this._data = props.pInfo;
    if (this._data.user_id === GLOBAL.curUser.id) this._isEditable = true;
    else {
      if (GLOBAL.curUser.is_admin) this._isEditable = true;
      else {
        if (GLOBAL.curUser.job_position_id === 4 || GLOBAL.curUser.job_position_id === 2 || GLOBAL.curUser.job_position_id === 1) {
          // 主任 或者 护士长
          GLOBAL.myUsers.forEach(e => {
            if (e.id === this._data.user_id) {
              if (e.department_id === GLOBAL.curUser.department_id) this._isEditable = true;
            }
          });
        }
      }
    }
    this.state = {
      isLoading: this.props.isLoading,
      name: this._data.name,
      certKind: this._data.cert_kind,
      certNum: this._data.cert_num,
      address: this._data.address,
      glucoseVal: UTILS.glucoseConvMMol(this._data.value),
      memo: this._data.memo,
      temperature: this._data.temperature ? this._data.temperature.toFixed(1) : undefined,
      pressure_high: this._data.pressure_high ? this._data.pressure_high.toFixed() : undefined,
      pressure_low: this._data.pressure_low ? this._data.pressure_low.toFixed() : undefined
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    this.setState({ isLoading: nextProps.isLoading });
    this.updateState();
  }
  componentDidMount() {
    this.updateState();
  }
  componentWillMount() {
    //    this.setNavigationParams();
  }

  private updateState = () => {};

  private onSave = () => {
    if (!this._data.name) {
      UTILS.alert(Strings.message.input_patientName);
      return;
    }

    this.setState({ isLoading: true });
    this.props.onSave(this._data, MANAGE_KIND.MODIFY);
  };
  private onDelete = () => {
    this._alertPro.open();
  };
  _renderAlert = () => {
    return (
      <AlertPro
        ref={ref => {
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
    this.props.onSave(this._data, MANAGE_KIND.DEL);
  };
  private onNameChange = (name: string) => {
    this.setState({ name });
    this._data.name = name;
  };
  private onCertKindChange = (certKind: number) => {
    this.setState({ certKind });
    this._data.cert_kind = certKind;
  };
  private onCertNumChange = (certNum: string) => {
    this.setState({ certNum });
    this._data.cert_num = certNum;
  };
  private onAddressChange = (address: string) => {
    this.setState({ address });
    this._data.address = address;
  };

  private onMemoChange = (memo: string) => {
    this.setState({ memo });
    this._data.memo = memo;
  };
  private onValueChange = (glucoseVal: string) => {
    const valNum = Number(glucoseVal);
    if (valNum) this._data.value = valNum;
    this.setState({ glucoseVal });
  };
  private onTemperatureChange = (temperature: string) => {
    const valNum = Number(temperature);
    if (valNum) this._data.temperature = valNum;
    this.setState({ temperature });
  };
  private onPressureHighChange = (pressure_high: string) => {
    const valNum = Number(pressure_high);
    if (valNum) this._data.pressure_high = valNum;
    this.setState({ pressure_high });
  };
  private onPressureLowChange = (pressure_low: string) => {
    const valNum = Number(pressure_low);
    if (valNum) this._data.pressure_low = valNum;
    this.setState({ pressure_low });
  };
  private onTimeChange = (date: Date) => {
    this._data.time = UTILS.getFormattedDate(date, 1);
  };

  private onPointChange = (index: number) => {
    this._data.point = index;
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    let cardNumHint = Strings.common.str_identity;
    if (this.state.certKind == 1) cardNumHint = Strings.common.str_hospitalCard;
    if (this.state.certKind == 2) cardNumHint = Strings.common.str_handphone;
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
        <View style={themedStyle.infoSection}>
          <View style={themedStyle.section}>
            <EditInput
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_name}
              onChangeText={this.onNameChange}
              value={this.state.name}
              placeholder={Strings.message.input_patientName}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              editable={true}
              style={themedStyle.profileSetting}
              hint={cardNumHint}
              onChangeText={this.onCertNumChange}
              value={this.state.certNum}
              placeholder={Strings.message.input_patientMobile}
              keyboardType={"numeric"}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.common.str_certKind} :`}</Text>
              <View style={{ width: 10 }} />

              <RadioGroup
                onChange={this.onCertKindChange}
                selectedIndex={this.state.certKind}
                style={themedStyle.radioGroup}
              >
                <Radio
                  text={Strings.common.str_identity}
                  style={themedStyle.radioItem}
                  textStyle={commonStyles.textSubtitle}
                />
                <Radio
                  text={Strings.common.str_hospitalCard}
                  style={themedStyle.radioItem}
                  textStyle={commonStyles.textSubtitle}
                />
                <Radio
                  text={Strings.common.str_handphone}
                  style={themedStyle.radioItem}
                  textStyle={commonStyles.textSubtitle}
                />
              </RadioGroup>
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_address}
              onChangeText={this.onAddressChange}
              value={this.state.address}
              placeholder={"无"}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              maxLength={5}
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_glucoseVal}
              onChangeText={this.onValueChange}
              value={this.state.glucoseVal}
              placeholder={Strings.message.input_measureValue}
              keyboardType={"numeric"}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.menu.task_measureTime} :`}</Text>
              <MyDatePicker
                onDateChange={date => this.onTimeChange(date)}
                date={
                  this._data.time ? UTILS.createDate(this._data.time) : UTILS.createDate(undefined)
                }
                maxDate={new Date()}
                textColor={themes["App Theme"]["color-basic-900"]}
                mode="datetime"
                format="YYYY-MM-DD HH:mm:ss"
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.menu.task_measurePoint} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"TASK_POINTS"}
                cols={2}
                data={GLOBAL.COMMON_POINTS}
                curItemIndex={this._data.point}
                onMenuItemSelect={this.onPointChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput
              maxLength={3}
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.message.input_pressure_high}
              onChangeText={this.onPressureHighChange}
              value={this.state.pressure_high}
              keyboardType={"numeric"}
            />
            <EditInput
              maxLength={3}
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.message.input_pressure_low}
              onChangeText={this.onPressureLowChange}
              value={this.state.pressure_low}
              keyboardType={"numeric"}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              maxLength={4}
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.message.input_temperature}
              onChangeText={this.onTemperatureChange}
              value={this.state.temperature}
              keyboardType={"numeric"}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              style={themedStyle.profileSetting}
              hint={Strings.common.str_memo}
              onChangeText={this.onMemoChange}
              value={this._data ? this._data.memo : undefined}
              placeholder={Strings.message.input_memo}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              marginTop: 30
            }}
          >
            <Button
              status="warning"
              style={{ width: 150 }}
              disabled={!this._isEditable}
              onPress={this.onSave}
            >
              {Strings.common.str_save}
            </Button>
            <Button
              status="danger"
              style={{ width: 150 }}
              disabled={!this._isEditable}
              onPress={this.onDelete}
            >
              {Strings.common.str_delete}
            </Button>
          </View>
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

export const EditMonitorData = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    paddingBottom: 3
  },
  infoSection: {
    paddingBottom: 20
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
