import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView
} from "react-native";
import { NavigationScreenProps, FlatList } from "react-navigation";
import { Button } from "@kitten/ui";
import GLOBAL from "@src/core/globals";
import { StarIconFill } from "@src/assets/icons";
import { imageDelete } from "@src/assets/images";
import Strings from "@src/assets/strings";
import { GlucoseMonitorModel } from "@src/core/model";
import * as UTILS from "@src/core/app_utils";
import { ContainerView } from "@src/components/common";
import { AppSync } from "@src/core/appSync";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const arrayOfNumbers = [
  { key: 1 },
  { key: 2 },
  { key: 3 },
  { key: 4 },
  { key: 5 },
  { key: 6 },
  { key: 7 },
  { key: 8 },
  { key: 9 },
  { key: 10 },
  { key: 0 },
  { key: 12 }
];

const empties = [
  { key: 1, value: " " },
  { key: 2, value: " " },
  { key: 3, value: " " },
  { key: 4, value: " " }
];

let counter = 0;

interface State {
  code: string;
  digitDisabled: boolean;
  clearDisabled: boolean;
  allowClear: boolean;
  monitorState: number;
}

export type Props = NavigationScreenProps;

export class ManualMonitorScreen extends React.Component<Props, State> {
  componentDidMount() {
    const a = 0;
  }
  private _monitorGlucose: number;
  public state = {
    code: "",
    digitDisabled: false,
    clearDisabled: false,
    allowClear: false,
    monitorState: 0
  };
  onSavePress = () => {
    if (!this.verifyValue()) return;

    const { navigation } = this.props;

    navigation.goBack();
    navigation.state.params.onGoBack({
      value: UTILS.glucoseConvMgNum(this._monitorGlucose),
      state: this.state.monitorState
    });

    this.onClearAll();
  };
  verifyValue = () => {
    return true;

    let result = true;
    const monitorVal = UTILS.glucoseConvMgNum(this._monitorGlucose);
    if (this.state.monitorState <= 0) {
      if (monitorVal > GLOBAL.GLUCOSE_MAX_VAL) {
        UTILS.showToast(`血糖值不能大于${UTILS.glucoseConvMMol(GLOBAL.GLUCOSE_MAX_VAL)}`);
        result = false;
      } else if (monitorVal < GLOBAL.GLUCOSE_MIN_VAL) {
        UTILS.showToast(`血糖值不能小于${UTILS.glucoseConvMMol(GLOBAL.GLUCOSE_MIN_VAL)}`);
        result = false;
      }
    }

    return result;
  };
  onEnterDigit = num => {
    const { code } = this.state;
    if (counter + 1 <= 4) {
      counter++;
      empties[counter - 1].value = num === 10 ? "." : num;
      this.setState({
        clearDisabled: false,
        monitorState: 0
      });
    }
  };
  onEnterState = index => {
    this.onClearAll();
    this.setState({
      monitorState: index + 1
    });
  };
  joinElements = () => {
    let pincode = "";
    empties.forEach(item => {
      pincode += `${item.value}`;
    });
    return pincode;
  };
  onRemoveDigit = () => {
    if (counter - 1 >= 0) {
      --counter;
      empties[counter].value = " ";
      this.setState({
        digitDisabled: false,
        monitorState: 0
      });
    } else {
      this.setState({
        allowClear: true,
        monitorState: 0
      });
    }
  };

  onClearAll = () => {
    counter = 0;
    empties.forEach(item => (item.value = " "));
    this.setState({
      clearDisabled: false,
      monitorState: 0
    });
  };

  renderItemCell = ({ item, index }) => {
    if (index === 11) {
      return (
        <TouchableOpacity
          style={[styles.round, styles.centerAlignment]}
          onPress={this.onRemoveDigit}
          disabled={this.state.clearDisabled}
        >
          <Image source={imageDelete.imageSource} style={[styles.icon]} />
        </TouchableOpacity>
      );
    } else if (index === 9) {
      return (
        <TouchableOpacity
          style={[styles.round, styles.centerAlignment]}
          onPress={() => this.onEnterDigit(item.key)}
          disabled={this.state.digitDisabled}
        >
          <Text style={styles.digit}>.</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={[styles.round, styles.centerAlignment]}
          onPress={() => this.onEnterDigit(item.key)}
          disabled={this.state.digitDisabled}
        >
          <Text style={styles.digit}>{item.key}</Text>
        </TouchableOpacity>
      );
    }
  };
  renderItemState = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[styles.stateButton, styles.centerAlignment]}
        onPress={() => this.onEnterState(index)}
      >
        <Text style={{ color: "#ccc", fontSize: 20 }}>{item}</Text>
      </TouchableOpacity>
    );
  };
  render() {
    let glucoseVal = "";
    let glucoseValFontSize = 50;
    empties.forEach(item => {
      glucoseVal += item.value;
    });
    glucoseVal = glucoseVal.trim();
    this._monitorGlucose = Number(glucoseVal);
    if (this.state.monitorState > 0) {
      glucoseVal = GLOBAL.MONITOR_STATES[this.state.monitorState];
      glucoseValFontSize = 50;
    }

    return (
      <ContainerView style={styles.container}>
        <View style={styles.enterView}>
          <View style={styles.digitView}>
            <Text style={[styles.digit, { fontSize: glucoseValFontSize }]}>{glucoseVal}</Text>
            <View style={[styles.redSpace, { backgroundColor: "#E8E8E8" }]} />
          </View>

          <Text style={{ paddingLeft: 20, color: "#ccc", fontSize: 22 }}>mmol/L</Text>
        </View>
        <View style={styles.flatcontainer}>
          <FlatList
            style={styles.flatlist}
            contentContainerStyle={styles.flatlistContent}
            data={GLOBAL.MONITOR_STATES.map((e, i) => {
              if (i > 0) return e;
            }).filter(e => e)}
            renderItem={this.renderItemState}
            keyExtractor={(item, index) => index.toString()}
            numColumns={4}
          />
        </View>

        <View style={styles.flatcontainer}>
          <FlatList
            contentContainerStyle={styles.flatlistContent}
            style={styles.flatlist}
            data={arrayOfNumbers}
            renderItem={this.renderItemCell}
            numColumns={3}
          />
        </View>
        <View style={{ paddingVertical: 10 }}>
          <Button
            size="giant"
            style={{ flex: 1 }}
            onPress={this.onSavePress}
            disabled={glucoseVal == "" || glucoseVal == "." || glucoseVal == "0"}
          >
            {Strings.common.str_save}
          </Button>
        </View>
      </ContainerView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6
  },
  centerAlignment: {
    justifyContent: "center",
    alignItems: "center"
  },
  enterView: {
    alignSelf: "center",
    margin: 15,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  flatcontainer: {
    marginVertical: 10
  },
  flatlist: {
    alignSelf: "center",
    width: "100%"
  },
  flatlistContent: {
    width: "100%",
    alignItems: "center"
  },
  icon: {
    height: 24,
    width: 24
  },
  round: {
    minWidth: 100,
    height: 60,
    borderColor: "#E8E8E8",
    borderWidth: 0.5,
    borderRadius: 0,
    margin: 0
  },
  stateButton: {
    minWidth: 80,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 3,
    margin: 3
  },
  digit: {
    fontSize: 30,
    color: "black"
  },
  digitView: {
    flexDirection: "column",
    alignItems: "center"
  },
  redSpace: {
    height: 2,
    width: 100,
    marginHorizontal: 0
  },
  stateView: {
    marginBottom: 10
  },
  deleteIcon: {
    height: 20,
    width: 20
  }
});
