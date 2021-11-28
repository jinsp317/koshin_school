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

import { PatientModel, GlucoseMonitorModel, MANAGE_KIND, ObjectModel } from "@src/core/model";
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
import DateTimePicker from "react-native-modal-datetime-picker";
import { database } from "@src/core/utils/database";
interface ComponentProps {
  navigation: any;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  isTimeVisible: boolean;
  testTime: Date;
}

class MyComponent extends React.Component<Props, State> {
  private _curGlobalHelpIdx: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      isTimeVisible: false,
      testTime: UTILS.createDate(GLOBAL.curDailyTest.time)
    };
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

  private setNavigationParams() { }

  private updateState = () => { };

  private onEnableChange = (index: number) => {
    GLOBAL.curDailyTest.disabled = index;
    const xpath = "Quality Test";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    if (index === 0) this.props.navigation.navigate(xpath);
  };
  private onTargetKindChange = (index: number) => {
    GLOBAL.curDailyTest.target_kind = index;
  };
  showDateTimePicker = (isShow: boolean) => {
    this.setState({ isTimeVisible: isShow });
  };

  handleDatePicked = date => {
    this.setState({ testTime: date });
    GLOBAL.curDailyTest.time = UTILS.getFormattedDate(date, 1);
    this.showDateTimePicker(false);
  };
  private onTimePress = () => { };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return (
      <ContainerView
        style={themedStyle.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={"interactive"}
      >
        <View style={themedStyle.body}>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text
                style={commonStyles.sectionText}
              >{`${Strings.menu.setting_dailyTest} :  `}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"DAILYTEST_ENABLED"}
                data={GLOBAL.ONOFF_LABELS}
                curItemIndex={GLOBAL.curDailyTest.disabled}
                onMenuItemSelect={this.onEnableChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>

          <View style={themedStyle.section}>
            <TouchableOpacity onPress={() => this.showDateTimePicker(true)}>
              <View
                style={[
                  themedStyle.sectionCategoryPickerContent,
                  { paddingVertical: 15, paddingRight: 20 }
                ]}
              >
                <Text style={commonStyles.sectionText}>{`每日质控时间 :  `}</Text>
                <View style={{ width: 10 }} />
                <Text style={commonStyles.sectionText}>
                  {UTILS.getFormattedDate(this.state.testTime, 4)}
                </Text>
              </View>
              <DateTimePicker
                isVisible={this.state.isTimeVisible}
                is24Hour={true}
                mode={"time"}
                timePickerModeAndroid={"spinner"}
                date={this.state.testTime}
                onConfirm={date => this.handleDatePicked(date)}
                onCancel={() => this.showDateTimePicker(false)}
              />
            </TouchableOpacity>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`质控要求 :  `}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"DAILYTEST_TARGET"}
                data={GLOBAL.TEST_TARGETS}
                curItemIndex={GLOBAL.curDailyTest.target_kind}
                onMenuItemSelect={this.onTargetKindChange}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
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

export const DailyTest = withStyles(MyComponent, (theme: ThemeType) => ({
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
