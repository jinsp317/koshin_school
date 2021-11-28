import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  Alert
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import {
  Toggle,
  Text,
  Button,
  RadioGroup,
  Radio
} from "@src/core/react-native-ui-kitten/ui";
import {
  ContainerView,
  textStyle,
  ValidationInput
} from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { StringValidator } from "@src/core/validators";
import { ScannerIconFill } from "@src/assets/icons";
import BarcodeScannerView from "react-native-scan-barcode";

interface ComponentProps {
  onGetDataPress: () => void;
}
interface State {
  isLoading: boolean;
  testPaperNum: string;
  testLiquidNum: string;
  testLiquidKind: number;
  showScanner: boolean;
}
export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  private _curScanKind: number;
  constructor(props: Props) {
    super(props);
    this._curScanKind = 0; // paper
    this.state = {
      isLoading: false,
      testPaperNum: undefined,
      testLiquidNum: undefined,
      testLiquidKind: 0,
      showScanner: false
    };
  }
  private onTestPaperNumChange = (value: string) => {
    this.setState({ testPaperNum: value });
  };
  private onTestLiquidNumChange = (value: string) => {
    this.setState({ testLiquidNum: value });
  };
  private onRadioChange = (index: number) => {
    this.setState({ testLiquidKind: index });
  };
  private onLoadPreDataPress = () => {
    this.setState({
      testPaperNum: GLOBAL.curTestQuality.paper_number,
      testLiquidNum: GLOBAL.curTestQuality.liquid_number,
      testLiquidKind: GLOBAL.curTestQuality.liquid_type
    });
  };
  private onGetDataPress = () => {
    if (!this.state.testPaperNum) {
      UTILS.showToast(Strings.message.input_testPaperNum);
      return;
    }
    if (!this.state.testLiquidNum) {
      UTILS.showToast(Strings.message.input_testLiquidNum);
      return;
    }
    GLOBAL.curTestQuality.paper_number = this.state.testPaperNum;
    GLOBAL.curTestQuality.liquid_number = this.state.testLiquidNum;
    GLOBAL.curTestQuality.liquid_type = this.state.testLiquidKind;
    this.props.onGetDataPress();
  };
  private onScanPress = (kind: number) => {
    this._curScanKind = kind;
    this.setState({ showScanner: !this.state.showScanner });
  };
  private barcodeReceived = e => {
    if (__DEV__) {
      console.info("Barcode: ", e.data);
      console.info("Type: ", e.type);
    }

    if (!this.state.showScanner) return;

    if (this._curScanKind == 0) {
      this.setState({ testPaperNum: e.data, showScanner: false });
    } else this.setState({ testLiquidNum: e.data, showScanner: false });
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const { testPaperNum, testLiquidNum, testLiquidKind } = this.state;
    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ProgressBar />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <ContainerView style={themedStyle.container}>
          <View>
            {this.state.showScanner && (
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <BarcodeScannerView
                  onBarCodeRead={this.barcodeReceived}
                  style={{ width: 300, height: 300 }}
                  torchMode={"off"}
                  cameraType={"back"}
                />
              </View>
            )}
            <ValidationInput
              placeholder={Strings.message.input_testPaperNum}
              icon={ScannerIconFill}
              validator={StringValidator}
              onChangeText={this.onTestPaperNumChange}
              value={testPaperNum}
              onIconPress={() => this.onScanPress(0)}
            />
            <ValidationInput
              placeholder={Strings.message.input_testLiquidNum}
              icon={ScannerIconFill}
              validator={StringValidator}
              onChangeText={this.onTestLiquidNumChange}
              value={testLiquidNum}
              onIconPress={() => this.onScanPress(1)}
            />
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Text style={themedStyle.radioText}>
                {Strings.common.str_testLiquidKind}
              </Text>
              <RadioGroup
                onChange={this.onRadioChange}
                selectedIndex={testLiquidKind}
                style={{ flexDirection: "row", paddingVertical: 6 }}
              >
                <Radio
                  text={GLOBAL.TEST_LIQUID_KINDS[0]}
                  style={themedStyle.radioItem}
                  textStyle={themedStyle.radioText}
                />
                <Radio
                  text={GLOBAL.TEST_LIQUID_KINDS[1]}
                  style={themedStyle.radioItem}
                  textStyle={themedStyle.radioText}
                />
                <Radio
                  text={GLOBAL.TEST_LIQUID_KINDS[2]}
                  style={themedStyle.radioItem}
                  textStyle={themedStyle.radioText}
                />
              </RadioGroup>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 30
              }}
            >
              <Button style={{ flex: 1 }} onPress={this.onGetDataPress}>
                下一步
              </Button>
              <View style={{ width: 20 }} />
              <Button style={{ flex: 1 }} onPress={this.onLoadPreDataPress}>
                填充上次批号
              </Button>
            </View>
          </View>
          <View style={{ marginVertical: 20 }}>
            <Text style={themedStyle.alertText}>
              {Strings.message.tip_testQuality}
            </Text>
          </View>
        </ContainerView>
      </View>
    );
  }
}

export const QualityTest = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    padding: 20
  },
  radioContainer: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center"
  },
  radioItem: { marginRight: 6 },
  radioText: {
    color: theme["color-primary-500"],
    fontSize: 16
  },
  alertText: {
    color: theme["color-warning-500"],
    fontSize: 16
  },
  tipText: {
    color: theme["color-danger-500"],
    fontSize: 16
  }
}));
