import Strings from "@src/assets/strings";
import React from "react";
import { Dimensions, View, processColor, TouchableOpacity, Text as NativeText } from "react-native";
import { SafeAreaView } from "@src/core/navigation";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Text, CheckBox } from "@src/core/react-native-ui-kitten/ui";
import { themes } from "@src/core/themes";
import { LineChart, PieChart, BarChart } from "react-native-charts-wrapper";
import { MyControlTab, MyDatePicker } from "@src/components/common";
import { ScrollView } from "react-native-gesture-handler";
import { GlucoseMonitorModel, MonitorDayModel } from "@src/core/model";
import { chartHelper } from "@src/core/utils/chartHelper";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import ImageButton from "@src/components/common/imageButton";
import commonStyles from "@src/containers/styles/common";
const screenWidth = Dimensions.get("window").width;

interface ComponentProps {
  dataMeasures: GlucoseMonitorModel[][];
  onSwipe: (dir: number) => void;
  monitorDays: MonitorDayModel[];
  onChangeMonitorDays: (monitorDaysChecked: boolean[]) => void;
}
interface State {
  maxGlucose: number;
  minGlucose: number;
  selectedEntry: string;
  chartZoom: {};
  lineChartxAxis: {};
  lineChartData: {};
  pieChartData: {};
  marker: any;
  monitorDaysChecked: boolean[];
  selAllChecked: boolean;
}
const xAxisDef = {
  textColor: processColor("gray"),
  textSize: 16,
  gridColor: processColor("gray"),
  gridLineWidth: 1,
  axisLineColor: processColor("darkgray"),
  axisLineWidth: 1.5,
  gridDashedLine: {
    lineLength: 10,
    spaceLength: 10
  },
  avoidFirstLastClipping: true,
  position: "BOTTOM",
  granularityEnabled: true,
  granularity: 1
};

const yAxisDef = {
  left: {
    drawGridLines: true,
    axisMaximum: GLOBAL.GLUCOSE_MAX_VAL,
    axisMinimum: 0
  },
  right: {
    enabled: false
  }
};

const legendDef = {
  enabled: true,
  textSize: 15,
  form: "CIRCLE",

  horizontalAlignment: "RIGHT",
  verticalAlignment: "CENTER",
  orientation: "VERTICAL",
  wordWrapEnabled: true
};

type Props = ThemedComponentProps & ComponentProps;
const lineColors = [
  "aqua",
  "magenta",
  "blue",
  "chartreuse",
  "chocolate",
  "darkred",
  "darkslateblue",
  "forestGreen",
  "indigo"
];
class MyComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const minGlucose = 0;
    const maxGlucose = 0;
    this.state = {
      maxGlucose: maxGlucose,
      minGlucose: minGlucose,
      selectedEntry: undefined,
      chartZoom: { scaleX: 1, scaleY: 1, xValue: 15, yValue: 0 },
      lineChartxAxis: {},
      lineChartData: {},
      pieChartData: {},
      monitorDaysChecked: this.props.monitorDays.map(e => {
        return e.checked;
      }),
      selAllChecked: true,
      marker: {
        enabled: true,
        markerColor: processColor("#1CAFF6"),
        textColor: processColor("white"),
        markerFontSize: 14
      }
    };
  }
  componentDidMount() {
    this.onSelAllPress(false); // for set Select All
    this.updateContent(this.props);
  }
  public componentWillReceiveProps(nextProps) {
    this.updateContent(nextProps);
  }
  getCheckedIndex = (index: number) => {
    let checkedIndex = 0;
    let checkedCount = 0;
    this.state.monitorDaysChecked.some((data, i) => {
      if (data) checkedCount++;
      if (checkedCount === index + 1) {
        checkedIndex = i;
        return true;
      }
    });
    return checkedIndex;
  };
  updateContent(props: Props) {
    let maxGlucose = 0;
    let minGlucose = 1000;
    let lineChartxAxis: any = xAxisDef;
    let lineChartData = {};
    let pieChartData = {};

    const dataSet: object[] = [];
    if (props.dataMeasures) {
      this.props.dataMeasures.forEach((data, index) => {
        if (data.length === 0) return;

        const glucoses = data.map(val => {
          return UTILS.glucoseConvMMolNum(val.value);
        });

        let min1 = 1000;
        let max1 = 0;
        min1 = glucoses ? Math.min(...glucoses) : 0;
        max1 = glucoses ? Math.max(...glucoses) : 0;
        minGlucose = minGlucose > min1 ? min1 : minGlucose;
        maxGlucose = maxGlucose < max1 ? max1 : maxGlucose;

        lineChartxAxis = chartHelper.getXAxisOneDay(data[0].time);
        const dataSetOne =
          data.length > 0
            ? chartHelper.getLineChartData(data, lineColors[this.getCheckedIndex(index)])
            : {};
        dataSet.push(dataSetOne);
        pieChartData = chartHelper.getPieChartData(data);
      });

      lineChartData = {
        dataSets: dataSet
      };
    }
    this.setState(
      {
        maxGlucose,
        minGlucose,
        pieChartData,
        lineChartxAxis
      },
      () => {
        this.setState({ lineChartData });
      }
    );
  }

  handleSelect(event) {
    const entry = event.nativeEvent;
    if (entry == null) {
      this.setState({ ...this.state, selectedEntry: null });
    } else {
      this.setState({ ...this.state, selectedEntry: JSON.stringify(entry) });
    }
    if (__DEV__) console.info(event.nativeEvent);
  }
  private selectAllDays = (check: boolean) => {
    this.setState(
      {
        selAllChecked: check,
        monitorDaysChecked: this.state.monitorDaysChecked.map((e, i) => {
          return check;
        })
      },
      () => {
        this.props.onChangeMonitorDays(this.state.monitorDaysChecked);
      }
    );
  };
  private onSelAllPress = (fromSelf: boolean = true) => {
    if (fromSelf) {
      const selAll = !this.state.selAllChecked;
      this.selectAllDays(selAll);
    } else {
      const checkedCount = this.state.monitorDaysChecked.filter(e => {
        return e;
      }).length;
      if (checkedCount === this.state.monitorDaysChecked.length) {
        this.setState({ selAllChecked: true });
      } else {
        this.setState({ selAllChecked: false });
      }
    }
  };
  private onDaysItemPress = (index: number) => {
    this.setState(
      {
        monitorDaysChecked: this.state.monitorDaysChecked.map((e, i) => {
          return index === i ? !e : e;
        })
      },
      () => {
        this.onSelAllPress(false);
        this.props.onChangeMonitorDays(this.state.monitorDaysChecked);
      }
    );
  };
  private renderToolbar = () => {
    const { themedStyle } = this.props;
    return (
      <View style={commonStyles.toolbarContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => this.onSelAllPress()} style={{ marginRight: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CheckBox
                checked={this.state.selAllChecked}
                onChange={checked => this.onSelAllPress()}
              />
              <NativeText style={themedStyle.dayText}>全选</NativeText>
            </View>
          </TouchableOpacity>

          {this.props.monitorDays.map((e, i) => {
            return (
              <TouchableOpacity
                key={i}
                onPress={() => this.onDaysItemPress(i)}
                style={{ marginRight: 3 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <CheckBox
                    checked={this.state.monitorDaysChecked[i]}
                    onChange={checked => this.onDaysItemPress(i)}
                  />
                  <NativeText style={[themedStyle.dayText, { color: lineColors[i] }]}>
                    {UTILS.getFormattedDate(this.props.monitorDays[i].date, 5)}
                  </NativeText>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return (
      <SafeAreaView style={themedStyle.safeAreaContainer}>
        <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
          <View style={themedStyle.toolbarContainer}>{this.renderToolbar()}</View>
          <ScrollView style={{ backgroundColor: "white" }}>
            <View style={themedStyle.chartTopbar}>
              <Text style={themedStyle.captionText}> 血糖值 (mmol/L)</Text>
              <Text style={themedStyle.captionText}>
                {` ${Strings.common.str_max}:${this.state.maxGlucose.toFixed(1)}  ${
                  Strings.common.str_min
                  }:${this.state.minGlucose.toFixed(1)}`}
              </Text>
            </View>
            {this.props.dataMeasures && this.props.dataMeasures[0] ? (
              <View style={{ alignItems: "center" }}>
                <View style={themedStyle.lineChartContainer}>
                  <LineChart
                    style={themedStyle.chart}
                    data={this.state.lineChartData}
                    xAxis={this.state.lineChartxAxis}
                    yAxis={yAxisDef}
                    legend={{ enabled: false }}
                    marker={this.state.marker}
                    onSelect={this.handleSelect.bind(this)}
                    onChange={event => {
                      if (__DEV__) console.info(event.nativeEvent);
                    }}
                    chartDescription={{ text: "" }}
                    zoom={this.state.chartZoom}
                    scaleYEnabled={false}
                    scaleXEnabled={false}
                    pinchZoom={false}
                    doubleTapToZoomEnabled={false}
                    animation={{ durationY: 600, easingY: "EaseInBounce" }}
                    visibleRange={{ x: { min: 3, max: 31 } }}
                  />
                </View>
                {/**
                 <View style={themedStyle.pieChartContainer}>
                  <PieChart
                    style={themedStyle.chart}
                    logEnabled={true}
                    chartBackgroundColor={processColor("white")}
                    chartDescription={{
                      text: "",
                      textSize: 15,
                      textColor: processColor("darkgray")
                    }}
                    data={this.state.pieChartData}
                    legend={legendDef}
                    //highlights={[{ x: 2 }]}
                    entryLabelColor={processColor("green")}
                    entryLabelTextSize={18}
                    drawEntryLabels={true}
                    rotationEnabled={true}
                    rotationAngle={45}
                    usePercentValues={true}
                    styledCenterText={{
                      text: `${Strings.common.app_isens}`,
                      color: processColor("pink"),
                      size: 18
                    }}
                    centerTextRadiusPercent={100}
                    holeRadius={40}
                    holeColor={processColor("#f0f0f0")}
                    transparentCircleRadius={45}
                    transparentCircleColor={processColor("#f0f0f088")}
                    maxAngle={350}
                    //onSelect={this.handleSelect.bind(this)}
                    onChange={event => console.log(event.nativeEvent)}
                    animation={{
                      durationX: 600,
                      easingX: "EaseInCirc"
                    }}
                  />
                </View>

                   */}
              </View>
            ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: 300,
                    backgroundColor: "white",
                    padding: 20
                  }}
                >
                  <ImageButton
                    onPress={() => this.props.onSwipe(1)}
                    imgSrc={require("@src/assets/icons/app/icon_right_driection.png")}
                    width={18}
                    height={30}
                  />
                  <Text category="h5" appearance="hint" style={{ color: "lightgray" }}>
                    {Strings.common.str_noData}
                  </Text>
                  <ImageButton
                    onPress={() => this.props.onSwipe(0)}
                    imgSrc={require("@src/assets/icons/app/icon_left_driection.png")}
                    width={18}
                    height={30}
                  />
                </View>
              )}
          </ScrollView>
        </ThemeProvider>
      </SafeAreaView>
    );
  }
}

export const GlucoseDayChart = withStyles(MyComponent, (theme: ThemeType) => ({
  safeAreaContainer: {
    backgroundColor: theme["color-basic-400"],
    paddingTop: 1
  },
  toolbarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    backgroundColor: theme["mycolor-background"],
    marginBottom: 1
  },
  tabsContainer: {
    width: screenWidth / 3,
    backgroundColor: theme["mycolor-background"]
  },
  tabContainer: {
    marginVertical: 3,
    marginHorizontal: 6,
    backgroundColor: theme["mycolor-background"]
  },
  chartTopbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "white",
    minHeight: 40
  },
  lineChartContainer: {
    flex: 1,
    backgroundColor: theme["mycolor-background"],
    width: "95%",
    minHeight: 400,
    marginBottom: 100
  },
  pieChartContainer: {
    flex: 1,
    backgroundColor: theme["mycolor-background"],
    width: "100%",
    height: 280,
    paddingTop: 10,
    paddingBottom: 60
  },
  chart: {
    flex: 1
  },
  captionText: {
    color: theme["text-hint-color"]
  },
  dayText: {
    color: theme["#ccc"],
    paddingRight: 3,
    marginLeft: 2
  }
}));
