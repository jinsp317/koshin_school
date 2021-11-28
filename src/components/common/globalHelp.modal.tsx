import React from "react";
import { View, Dimensions, ScaledSize, ProgressBarAndroid, NativeModules } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  ModalComponentCloseProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input } from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common/style";
import Strings from "@src/assets/strings";
import {
  PersonIconFill,
  CreditCardIconFill,
  DoctorIconOutline,
  StateEatIconFill,
  StateDoubleIconFill,
  NewPatientIcon
} from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import { VersionInfoModel } from "@src/core/model/versionInfo.model";
import commonStyles from "@src/containers/styles/common";
import { EventRegister } from "react-native-event-listeners";
import {

  HospitalModel,
  TaskDataModel,
} from "@src/core/model";
import { database } from "@src/core/utils/database";
interface ComponentProps { }

type Props = ThemedComponentProps & ComponentProps;
interface State {
  hospitalInfo: HospitalModel;
}
class MyModalComponent extends React.Component<Props, State> {
  private focusListener: any;
  private _isMounted: boolean;
  private _hospitalInfo: HospitalModel;
  constructor(props: Props) {
    super(props);
    this.state = {
      hospitalInfo: null
    };
  }
  componentDidMount() {
    this._isMounted = true;
    EventRegister.addEventListener(GLOBAL.sync_success, data => {
      this.updateData();
    });
    this.updateData();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  updateData = () => {
    if (this._isMounted) {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this.setState({ hospitalInfo: _hItem });
      });
    }

  }
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            {Strings.menu.setting_showGlobalHelp}
          </Text>
        </View>
        <View
          style={{
            borderBottomWidth: 0.5,
            borderColor: "lightgray",
            padding: 10
          }}
        >
          <View style={themedStyle.rowContainer}>
            <View style={themedStyle.colHead}>
              <Text>任务 :</Text>
            </View>
            <View style={themedStyle.colBody}>
              {UTILS.renderIconElement(StateEatIconFill, commonStyles.iconMark)}

              <Text style={{ paddingLeft: 6 }}>{Strings.common.str_noticeEat}</Text>
            </View>
            <View style={themedStyle.colBody}>
              {UTILS.renderIconElement(StateDoubleIconFill, commonStyles.iconMark)}
              <Text style={{ paddingLeft: 6 }}>{Strings.common.str_noticeDouble}</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            padding: 10
          }}
        >
          <View style={themedStyle.rowContainer}>
            <View style={themedStyle.colHead}>
              <Text>全局 :</Text>
            </View>
            <View style={themedStyle.colBody}>
              <Text
                style={[
                  commonStyles.glucoseWarningText,
                  {
                    backgroundColor: this.state.hospitalInfo?.low_color ? this.state.hospitalInfo.low_color : GLOBAL.GLUCOSE_LOW_COLOR
                  }
                ]}
              >
                {UTILS.glucoseConvMMol(GLOBAL.GLUCOSE_WARNING_MIN_VAL)}
              </Text>
              <Text style={{ paddingLeft: 6 }}>{"mmol/L 低预警"}</Text>
            </View>
          </View>
          <View style={themedStyle.rowContainer}>
            <View style={themedStyle.colHead}></View>
            <View style={themedStyle.colBody}>
              <Text
                style={[
                  commonStyles.glucoseWarningText,
                  {
                    backgroundColor: this.state.hospitalInfo?.high_color ? this.state.hospitalInfo.high_color : GLOBAL.GLUCOSE_HIGH_COLOR
                  }
                ]}
              >
                {UTILS.glucoseConvMMol(GLOBAL.GLUCOSE_WARNING_MAX_VAL)}
              </Text>
              <Text style={{ paddingLeft: 6 }}>{"mmol/L 高预警"}</Text>
            </View>
          </View>
          <View style={themedStyle.rowContainer}>
            <View style={themedStyle.colHead}></View>
            <View style={themedStyle.colBody}>
              <Text style={{ color: this.state.hospitalInfo?.below_color ? this.state.hospitalInfo.below_color : GLOBAL.GLUCOSE_LOW_COLOR_1 }}>
                {UTILS.glucoseConvMMol(GLOBAL.GLUCOSE_LOW_VAL)}
              </Text>
              <Text style={{ paddingLeft: 6 }}>{"mmol/L      低于血糖目标"}</Text>
            </View>
          </View>
          <View style={themedStyle.rowContainer}>
            <View style={themedStyle.colHead}></View>
            <View style={themedStyle.colBody}>
              <Text style={{ color: this.state.hospitalInfo?.above_color ? this.state.hospitalInfo?.above_color : GLOBAL.GLUCOSE_HIGH_COLOR_1 }}>
                {UTILS.glucoseConvMMol(GLOBAL.GLUCOSE_HIGH_VAL)}
              </Text>
              <Text style={{ paddingLeft: 6 }}>{"mmol/L    高于血糖目标"}</Text>
            </View>
          </View>
          <View style={themedStyle.rowContainer}>
            <View style={themedStyle.colHead}></View>
            <View style={themedStyle.colBody}>
              <Text style={{ color: this.state.hospitalInfo?.pass_color ? this.state.hospitalInfo.pass_color : GLOBAL.GLUCOSE_NORMAL_COLOR }}>
                {UTILS.glucoseConvMMol(
                  GLOBAL.GLUCOSE_LOW_VAL + (GLOBAL.GLUCOSE_HIGH_VAL - GLOBAL.GLUCOSE_LOW_VAL) / 2
                )}
              </Text>
              <Text style={{ paddingLeft: 6 }}>{"mmol/L      血糖目标内"}</Text>
            </View>
          </View>

          <View style={themedStyle.rowContainer}>
            <View style={themedStyle.colHead}></View>
            <View style={themedStyle.colBody}>
              {UTILS.renderIconElement(NewPatientIcon, commonStyles.iconMarkNew)}
              <Text style={{ paddingLeft: 66 }}>{"  当天新住院患者"}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export const GlobalHelpModal = withStyles(MyModalComponent, (theme: ThemeType) => {
  const dimensions: ScaledSize = Dimensions.get("window");
  const contentWidth: number = dimensions.width - 24;
  const contentHeight: number = 192;

  return {
    container: {
      borderWidth: 0,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 10,
      // width: contentWidth,
      // height: contentHeight,
      borderRadius: 12,
      // top: (dimensions.height - contentHeight) / 2,
      // left: (dimensions.width - contentWidth) / 2,
      backgroundColor: theme["mycolor-background"]
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,

      borderColor: theme["mycolor-lightgray"],
      padding: 10
    },
    titleLabel: {
      ...textStyle.headline,
      color: theme["#ccc"]
    },
    descriptionLabel: {
      marginVertical: 24,
      ...textStyle.paragraph
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6
    },
    colHead: { width: 60 },
    colBody: {
      flexDirection: "row",
      paddingHorizontal: 10,
      alignItems: "center"
    }
  };
});
