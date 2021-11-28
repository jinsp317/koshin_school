import Strings from "@src/assets/strings";
import React, { memo } from "react";
import {
  View,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityProps,
  TextInput,
  StyleSheet
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";

import { MANAGE_KIND, TestDataModel } from "@src/core/model";
import { MyDatePicker, textStyle, ContainerView } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { themes } from "@src/core/themes";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { Input, RadioGroup, Radio, Button, Text } from "@src/core/react-native-ui-kitten/ui";
import { EditInput } from "@src/components/common";
import ProgressBar from "@src/components/common/progressBar.component";
import { SimpleStepper } from "react-native-simple-stepper";

interface ComponentProps {
  onSave: (data: TestDataModel, kind: MANAGE_KIND) => void;
  data: TestDataModel;
  isLoading: boolean;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  isLoading: boolean;
  memo: string;
  used_papers: number;
  safe_ranges_min: number;
  safe_ranges_max: number;
  is_passed: number;
}

class MyComponent extends React.Component<Props, State> {
  private _data: TestDataModel;
  constructor(props: Props) {
    super(props);
    this._data = props.data;
    const min = this.getRange(this._data.liquid_type, false);
    const max = this.getRange(this._data.liquid_type, true);
    const isPass = this._data.value >= min && this._data.value <= max ? 1 : 0;
    this.state = {
      isLoading: this.props.isLoading,
      memo: this._data.memo,
      used_papers: this._data.use_number,
      safe_ranges_min: min,
      safe_ranges_max: max,
      is_passed: isPass
    };
    this._data.result_type = isPass;
  }
  getRange = (liquidKind: number, isMax: boolean) => {
    let rangeValue = 0;
    if (isMax) {
      if (liquidKind === 2) rangeValue = GLOBAL.curTestRange.low_max;
      else if (liquidKind === 1) rangeValue = GLOBAL.curTestRange.middle_max;
      else if (liquidKind === 0) rangeValue = GLOBAL.curTestRange.high_max;
    } else {
      if (liquidKind === 2) rangeValue = GLOBAL.curTestRange.low_min;
      else if (liquidKind === 1) rangeValue = GLOBAL.curTestRange.middle_min;
      else if (liquidKind === 0) rangeValue = GLOBAL.curTestRange.high_min;
    }
    return rangeValue;
  };
  componentDidMount() {
    this.updateState();
  }
  private updateState = () => { };

  private onSave = () => {
    //this.setState({ isLoading: true });
    this._data.time = UTILS.getFormattedDate(undefined, 1);
    this._data.max = this.state.safe_ranges_max;
    this._data.min = this.state.safe_ranges_min;
    this.props.onSave(this._data, MANAGE_KIND.ADD);
  };

  private onMemoChange = (memo: string) => {
    this.setState({ memo });
    this._data.memo = memo;
  };
  private onRadioChange = (index: number) => {
    this.setState({ is_passed: index });
    this._data.result_type = index;
    //UTILS.alert("" + index);
  };

  private onChangeMin = (value: number) => {
    const strVal = value.toFixed(1);
    this.setState({ safe_ranges_min: Number(strVal) });
    this._data.min = Number(strVal);
  };
  private onChangeMax = (value: number) => {
    const strVal = value.toFixed(1);
    this.setState({ safe_ranges_max: Number(strVal) });
    this._data.min = Number(strVal);
  };
  private onUsedPapersChange = value => {
    this.setState({ used_papers: value });
    this._data.use_number = value;
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    if (this.state.isLoading) {
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
        <View>
          <View style={themedStyle.sectionA}>
            <Text status="danger" category="h1">{`${UTILS.glucoseConvMMol(
              this.props.data.value
            )} `}</Text>
            <Text category="h3" style={{ color: themes["App Theme"]["#ccc"] }}>
              {"mmol/L"}
            </Text>
          </View>
          <View style={themedStyle.section}>
            <EditInput
              editable={false}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_testPaperNum}
              value={this.props.data.paper_number}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              editable={false}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_testLiquidNum}
              value={this.props.data.liquid_number}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              editable={false}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_testLiquidKind}
              value={GLOBAL.TEST_LIQUID_KINDS[this.props.data.liquid_type]}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ paddingHorizontal: 8 }}>
                <Text
                  style={commonStyles.sectionText}
                >{`${Strings.common.str_testSafeRange}`}</Text>
              </View>
              <SimpleStepper
                minimumValue={this.state.safe_ranges_min - 2}
                maximumValue={this.state.safe_ranges_min + 2}
                initialValue={this.state.safe_ranges_min}
                stepValue={0.1}
                valueChanged={value => this.onChangeMin(value)}
                showText={true}
                textStyle={themedStyle.stepperText}
                containerStyle={themedStyle.stepperContainer}
                separatorStyle={themedStyle.separatorStyle}
                incrementStepStyle={themedStyle.incrementStepStyle}
                decrementStepStyle={themedStyle.decrementStepStyle}
              />
              <Text style={commonStyles.sectionText}>~</Text>
              <SimpleStepper
                minimumValue={this.state.safe_ranges_max - 2}
                maximumValue={this.state.safe_ranges_max + 2}
                initialValue={this.state.safe_ranges_max}
                stepValue={0.1}
                valueChanged={value => this.onChangeMax(value)}
                showText={true}
                textStyle={themedStyle.stepperText}
                containerStyle={themedStyle.stepperContainer}
                separatorStyle={themedStyle.separatorStyle}
                incrementStepStyle={themedStyle.incrementStepStyle}
                decrementStepStyle={themedStyle.decrementStepStyle}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ paddingHorizontal: 8 }}>
                <Text
                  style={commonStyles.sectionText}
                >{`${Strings.common.str_testUsedPapers}`}</Text>
              </View>

              <SimpleStepper
                minimumValue={1}
                maximumValue={9}
                initialValue={this.state.used_papers}
                stepValue={1}
                disabled={false}
                wraps={false}
                valueChanged={value => this.onUsedPapersChange(value)}
                showText={true}
                textStyle={themedStyle.stepperText}
                containerStyle={themedStyle.stepperContainer}
                separatorStyle={themedStyle.separatorStyle}
                incrementStepStyle={themedStyle.incrementStepStyle}
                decrementStepStyle={themedStyle.decrementStepStyle}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput
              maxLength={50}
              multiline={true}
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_testAddMemo}
              onChangeText={this.onMemoChange}
              value={this.state.memo}
              placeholder={Strings.message.input_memo}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <RadioGroup
              onChange={this.onRadioChange}
              selectedIndex={this.state.is_passed}
              style={{ flexDirection: "row", paddingVertical: 6 }}
            >
              <Radio
                text={"检测不通过"}
                style={themedStyle.radioItem}
                textStyle={themedStyle.radioText}
              />
              <Radio
                text={"检测通过"}
                style={themedStyle.radioItem}
                textStyle={themedStyle.radioText}
              />
            </RadioGroup>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 15,
              marginTop: 30
            }}
          >
            <Button
              //              status="warning"
              style={{ flex: 1 }}
              onPress={this.onSave}
            >
              {Strings.common.str_save}
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

export const TestResult = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    paddingBottom: 10
  },
  section: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"]
  },
  sectionA: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: theme["border-basic-color-2"]
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
    marginRight: 10
  },
  hintLabel: { ...textStyle.caption2, fontSize: 18 },
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
  profileSetting: {
    fontSize: 18
  },
  radioContainer: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center"
  },
  radioItem: { marginRight: 6 },
  radioText: {
    color: theme["#ccc"],
    fontSize: 16
  },
  column: {
    padding: 8
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222222",
    padding: 8
  },
  key: {
    fontSize: 14,
    color: "#222222"
  },
  content: {
    paddingVertical: 8,
    justifyContent: "space-evenly"
  },
  stepper: {
    flexDirection: "row",
    margin: 8
  },
  stepperContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    borderColor: theme["color-primary-500"]
  },
  stepperText: {
    padding: 2,
    fontSize: 22,
    fontWeight: "bold",
    color: theme["color-danger-500"]
  },
  incrementStepStyle: { padding: 2 },
  decrementStepStyle: { padding: 2 },
  separatorStyle: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: theme["color-primary-500"],
    height: "100%"
  },
  stepperStepText: { padding: 10, fontSize: 20, color: theme["#ccc"] }
}));
