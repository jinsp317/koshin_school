import Strings from "@src/assets/strings";
import React from "react";
import { Dimensions, View, processColor } from "react-native";
import { SafeAreaView } from "@src/core/navigation";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Text } from "@src/core/react-native-ui-kitten/ui";
import { themes } from "@src/core/themes";
import { LineChart, PieChart, BarChart } from "react-native-charts-wrapper";
import { MyControlTab, MyDatePicker } from "@src/components/common";
import { ScrollView } from "react-native-gesture-handler";
import { FreePatientMeasureModel } from "@src/core/model";
import { chartHelper } from "@src/core/utils/chartHelper";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import ImageButton from "@src/components/common/imageButton";
const screenWidth = Dimensions.get("window").width;

interface ComponentProps {
  showKind: number;
  dataMeasure: FreePatientMeasureModel[];
  handleTabPress: (index: number) => void;
  handleDateChange: (date: Date) => void;
  onSwipe: (dir: number) => void;
  beginTime: string;
  endTime: string;
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
    axisMaximum: 30,
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
      marker: {
        enabled: true,
        markerColor: processColor("#1CAFF6"),
        textColor: processColor("white"),
        markerFontSize: 14
      }
    };
  }
  componentDidMount() {
    this.updateContent(this.props);
  }
  public componentWillReceiveProps(nextProps) {
    this.updateContent(nextProps);
  }

  updateContent(props: Props) {
    let maxGlucose = 0;
    let minGlucose = 0;
    let lineChartxAxis: any = xAxisDef;
    let lineChartData = {};
    let pieChartData = {};

    if (props.dataMeasure) {
      const glucoses = props.dataMeasure.map(val => {
        return UTILS.glucoseConvMMolNum(val.value);
      });

      minGlucose = glucoses ? Math.min(...glucoses) : 0;
      maxGlucose = glucoses ? Math.max(...glucoses) : 0;

      lineChartxAxis = chartHelper.getXAxis(
        props.dataMeasure,
        props.beginTime,
        props.endTime
      );
      lineChartData = {
        dataSets: [chartHelper.getLineChartData(props.dataMeasure)]
      };
      pieChartData = chartHelper.getPieChartData(props.dataMeasure);
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
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return (
      <SafeAreaView style={themedStyle.safeAreaContainer}>
        <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
          <View style={themedStyle.toolbarContainer}>
            <MyControlTab
              values={[Strings.common.str_week, Strings.common.str_month]}
              tabIndex={this.props.showKind}
              onTabItemPress={(tabIndex: number) =>
                this.props.handleTabPress(tabIndex)
              }
              containerStyle={themedStyle.tabContainer}
              tabsContainerStyle={themedStyle.tabsContainer}
            />
            <MyDatePicker
              onDateChange={this.props.handleDateChange}
              date={UTILS.createDate(this.props.endTime)}
              maxDate={new Date()}
            />
          </View>
          <ScrollView>
            <View style={themedStyle.chartTopbar}>
              <Text style={themedStyle.captionText}> 血糖值 (mmol/L)</Text>
              <Text style={themedStyle.captionText}>
                {` ${Strings.common.str_max}:${this.state.maxGlucose.toFixed(
                  1
                )}  ${Strings.common.str_min}:${this.state.minGlucose.toFixed(
                  1
                )}`}
              </Text>
            </View>
            {this.props.dataMeasure ? (
              <View>
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
                    // highlights={[{ x: 2 }]}
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
                    // onSelect={this.handleSelect.bind(this)}
                    onChange={event => {
                      if (__DEV__) console.log(event.nativeEvent);
                    }}
                    animation={{
                      durationX: 600,
                      easingX: "EaseInCirc"
                    }}
                  />
                </View>
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
                  <Text
                    category="h5"
                    appearance="hint"
                    style={{ color: "lightgray" }}
                  >
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

export const TrendGraph = withStyles(MyComponent, (theme: ThemeType) => ({
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
    backgroundColor: "white"
  },
  lineChartContainer: {
    flex: 1,
    backgroundColor: theme["mycolor-background"],
    width: "100%",
    height: 220,
    paddingVertical: 10
  },
  pieChartContainer: {
    flex: 1,
    backgroundColor: theme["mycolor-background"],
    width: "100%",
    height: 320,
    paddingTop: 10,
    paddingBottom: 60
  },
  chart: {
    flex: 1
  },
  captionText: {
    color: theme["text-hint-color"]
  }
}));
