import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityProps,
  ToastAndroid
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
  DailyTestModel
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
  onSave: () => void;
  navigation: any;
  onDailyTestPress: () => void;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  dailyTest: DailyTestModel;
}

class MyComponent extends React.Component<Props, State> {
  private _curTaskCheckIntervalIdx: number;
  private _curDataSyncIntervalIdx: number;
  private _curWarningCheckIdx: number;
  private _curMonitorAutoSaveDelayIdx: number;
  private _curWarningPlaySoundEnabled: number;
  private _curSigninMode: number;
  private _curGlobalHelpIdx: number;
  private focusListener: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      dailyTest: { ...GLOBAL.curDailyTest }
    };

    this._curMonitorAutoSaveDelayIdx = GLOBAL.curMonitorAutoSaveDelayIdx;
    this._curDataSyncIntervalIdx = GLOBAL.curDataSyncIntervalIdx;
    this._curTaskCheckIntervalIdx = GLOBAL.curTaskCheckIntervalIdx;
    this._curWarningCheckIdx = GLOBAL.curWarningCheckIdx;
    this._curWarningPlaySoundEnabled = GLOBAL.curWarningPlaySoundEnabled;
    this._curGlobalHelpIdx = GLOBAL.curGlobalHelpIdx;
    this._curSigninMode = GLOBAL.signInMode;

  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({ dailyTest: { ...GLOBAL.curDailyTest } });
      UTILS.showToast(Strings.message.tip_save, ToastAndroid.LONG);
    });
    this.updateState();
  }
  componentWillMount() {
    this.setNavigationParams();
  }
  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
  }
  private setNavigationParams() {
    const onRightPress = this.onSave;
    const rightIcon = SaveIconOutline;

    this.props.navigation.setParams({
      onRightPress,
      rightIcon
    });
  }

  private updateState = () => { };

  private onSave = () => {
    GLOBAL.curTaskCheckIntervalIdx = this._curTaskCheckIntervalIdx;
    GLOBAL.curDataSyncIntervalIdx = this._curDataSyncIntervalIdx;
    GLOBAL.curMonitorAutoSaveDelayIdx = this._curMonitorAutoSaveDelayIdx;
    GLOBAL.curWarningCheckIdx = this._curWarningCheckIdx;
    GLOBAL.curWarningPlaySoundEnabled = this._curWarningPlaySoundEnabled;
    GLOBAL.curGlobalHelpIdx = this._curGlobalHelpIdx;
    GLOBAL.signInMode = this._curSigninMode;

    GLOBAL.alarmNotifDataDef.play_sound = GLOBAL.curWarningPlaySoundEnabled === 0 ? true : false;
    GLOBAL.startBackgroundJobs();
    this.props.onSave();
  };

  private onTaskCheckIntervalChange = (index: number) => {
    this._curTaskCheckIntervalIdx = index;
  };
  private onDataSyncIntervalChange = (index: number) => {
    this._curDataSyncIntervalIdx = index;
  };
  private onWarningCheckChange = (index: number) => {
    this._curWarningCheckIdx = index;
  };
  private onGlobalHelpChange = (index: number) => {
    this._curGlobalHelpIdx = index;
  };
  private onMonitorAutoSaveDelayChange = (index: number) => {
    this._curMonitorAutoSaveDelayIdx = index;
  };
  private onWarningPlaySoundEnabledChange = (index: number) => {
    this._curWarningPlaySoundEnabled = index;
  };
  private onSignModeChange = (index: number) => {
    this._curSigninMode = index;
  }
  private onDailyTestPress = () => {
    this.props.onDailyTestPress();
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const { dailyTest } = this.state;
    return (
      <ContainerView
        style={themedStyle.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={"interactive"}
      >
        <View style={themedStyle.body}>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`任务提醒间隔 :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"TASK_CHECK_INTERVAL_LABELS"}
                data={GLOBAL.TASK_CHECK_INTERVAL_LABELS}
                curItemIndex={this._curTaskCheckIntervalIdx}
                onMenuItemSelect={this.onTaskCheckIntervalChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>

          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`预警通知 :  `}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"WARNING_CHECK_LABELS"}
                data={GLOBAL.ONOFF_LABELS}
                curItemIndex={this._curWarningCheckIdx}
                onMenuItemSelect={this.onWarningCheckChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`通知铃音 :  `}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"WARNING_CHECK_LABELS_1"}
                data={GLOBAL.ONOFF_LABELS}
                curItemIndex={this._curWarningPlaySoundEnabled}
                onMenuItemSelect={this.onWarningPlaySoundEnabledChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`快捷登录 :  `}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"WARNING_CHECK_LABELS_2"}
                data={GLOBAL.ONOFF_LABELS}
                curItemIndex={this._curSigninMode}
                onMenuItemSelect={this.onSignModeChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`自动保存时间 :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"MONITOR_AUTOSAVE_DELAY_LABELS"}
                data={GLOBAL.MONITOR_AUTOSAVE_DELAY_LABELS}
                curItemIndex={this._curMonitorAutoSaveDelayIdx}
                onMenuItemSelect={this.onMonitorAutoSaveDelayChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
        </View>
        <View style={themedStyle.section}>
          <View style={themedStyle.sectionCategoryPickerContent}>
            <Text style={commonStyles.sectionText}>{`全局说明 :  `}</Text>
            <View style={{ width: 10 }} />
            <SlideMenu
              name={"GLOBAL_HELP_SHOW"}
              data={GLOBAL.ONOFF_LABELS}
              curItemIndex={this._curGlobalHelpIdx}
              onMenuItemSelect={this.onGlobalHelpChange}
              textStyle={commonStyles.slideMenuText}
              triggerStyle={commonStyles.slideMenuTrigger}
            />
          </View>
        </View>
        <View style={themedStyle.section}>
          <TouchableOpacity onPress={this.onDailyTestPress}>
            <View
              style={[
                themedStyle.sectionCategoryPickerContent,
                { paddingVertical: 15, paddingRight: 20 }
              ]}
            >
              <Text style={commonStyles.sectionText}>{`每日质控 :  `}</Text>
              <View style={{ width: 10 }} />
              <Text style={commonStyles.sectionText}>
                {dailyTest.disabled
                  ? GLOBAL.ONOFF_LABELS[1]
                  : `${GLOBAL.ONOFF_LABELS[0]},${UTILS.getFormattedDate(dailyTest.time, 4)},${
                  GLOBAL.TEST_TARGETS[dailyTest.target_kind]
                  }`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={themedStyle.section}>
          <View style={themedStyle.sectionCategoryPickerContent}>
            <Text style={commonStyles.sectionText}>{`数据同步间隔 :`}</Text>
            <View style={{ width: 10 }} />
            <SlideMenu
              name={"DATASYNC_INTERVAL_LABELS"}
              data={GLOBAL.DATA_SYNC_INTERVAL_LABELS}
              cols={2}
              curItemIndex={this._curDataSyncIntervalIdx}
              onMenuItemSelect={this.onDataSyncIntervalChange}
              textStyle={commonStyles.slideMenuText}
              triggerStyle={commonStyles.slideMenuTrigger}
            />
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

export const ConfigEnv = withStyles(MyComponent, (theme: ThemeType) => ({
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  radioGroup: {
    flexDirection: "row",
    paddingVertical: 6
  }
}));
