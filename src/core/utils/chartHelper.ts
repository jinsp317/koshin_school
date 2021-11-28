/**
 *
 * created by @rihyokju
 * provder dataset for react-native-charts-wrapper
 */
import { processColor } from "react-native";
import { MonitorModel } from "@src/core/model";
import Strings from "@src/assets/strings";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import { Monitor } from "../model/monitor.model";
import moment from 'moment';
const COLOR_PURPLE = processColor("#697dfb");
const greenBlue = "rgb(26, 182, 151)";

export interface ChartHelper {
  getPieChartData(measureData: MonitorModel[]): object;
  getLineChartData(measureData: MonitorModel[], lineColor: string): object;
  getXAxis(measureData: MonitorModel[], beginTime: string, endTime: string): object;
  getXAxisOneDay(date: Date | string): object;
}

class ChartHelperImpl implements ChartHelper {
  private _xAxisValues: string[];
  private _beginDate: Date;
  private _endDate: Date;
  constructor() {
    this._xAxisValues = [];
    this._beginDate = undefined;
    this._endDate = undefined;
  }

  getPieChartData(measureData: MonitorModel[]) {
    const glucoses = measureData.map(val => {
      return val.value;
    });
    let popuLow = 0;
    let popuNormal = 0;
    let popuHigh = 0;

    for (let i = 0; i < glucoses.length; i++) {
      if (glucoses[i] < GLOBAL.GLUCOSE_LOW_VAL) popuLow++;
      else if (glucoses[i] > GLOBAL.GLUCOSE_HIGH_VAL) popuHigh++;
      else popuNormal++;
    }

    return {
      dataSets: [
        {
          values: [
            {
              value: popuNormal,
              label: Strings.common.str_resultNormal
            },
            {
              value: popuHigh,
              label: Strings.common.str_resultHigh
            },
            {
              value: popuLow,
              label: Strings.common.str_resultLow
            }
          ],
          label: "",
          config: {
            colors: this.getPieColors(),
            valueTextSize: 16,
            valueTextColor: processColor("green"),
            sliceSpace: 5,
            selectionShift: 13,
            // xValuePosition: "OUTSIDE_SLICE",
            // yValuePosition: "OUTSIDE_SLICE",
            valueFormatter: "#.#'%'",
            valueLineColor: processColor("green"),
            valueLinePart1Length: 0.5
          }
        }
      ]
    };
  }
  getPieColors = () => {
    const colors = [
      processColor(GLOBAL.GLUCOSE_NORMAL_COLOR),
      processColor(GLOBAL.GLUCOSE_HIGH_COLOR),
      processColor(GLOBAL.GLUCOSE_LOW_COLOR)
    ];

    return colors;
  };
  getXAxis = (measureData: MonitorModel[], beginTime: string, endTime: string) => {
    this._xAxisValues = [];
    const labels: any[] = [];
    if (beginTime && endTime) {
      this._beginDate = moment(UTILS.getBeginEndTimeString(beginTime, true)).toDate();
      this._endDate = moment(UTILS.getBeginEndTimeString(endTime, false)).toDate();
      // const currDay = 24 * 60 * 60 * 1000; // 시 * 분 * 초 * 밀리세컨
      const days = moment(this._endDate).diff(moment(this._beginDate), 'days') + 1;
      // const days = Math.ceil((this._endDate.getTime() - this._beginDate.getTime()) / currDay);

      const tempDate = new Date(this._beginDate);

      if (days === 0) {
        this._xAxisValues.push(`${tempDate.getMonth() + 1}/${tempDate.getDate()}`);
      } else {
        for (let i = 0; i <= days; i++) {
          // moment(tempDate).format('M/D');
          labels.push({ x: i, label: `${moment(tempDate).format('M/D')}` });
          // this._xAxisValues.push(`${ moment(tempDate).format('M/D') }`);
          // this._xAxisValues.push(`${ tempDate.getMonth() + 1 } / ${ tempDate.getDate() }`);
          tempDate.setDate(tempDate.getDate() + 1);
        }
      }
    }

    return {
      textColor: processColor("gray"),
      textSize: 16,
      gridColor: processColor("gray"),
      gridLineWidth: 1,
      axisLineColor: processColor("darkgray"),
      axisLineWidth: 1.5,
      gridDashedLine: {
        lineLength: 1,
        spaceLength: 5
      },
      avoidFirstLastClipping: false,
      position: "BOTTOM",
      valueFormatterLabels: labels,
      granularityEnabled: true,
      granularity: 1,
      // axisMaximum: this._xAxisValues.length + 1,
      axisMiniumm: 0
    };
  };

  getXAxisOneDay = (date: Date | string) => {
    this._beginDate = UTILS.getBeginEndTime(date, true);
    this._endDate = UTILS.getBeginEndTime(date, false);
    this._xAxisValues = [];
    for (let i = 0; i < 24; i++) {
      this._xAxisValues.push(`${i}: 00`);
    }

    return {
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
      avoidFirstLastClipping: false,
      position: "BOTTOM",
      valueFormatter: this._xAxisValues,
      granularityEnabled: true,
      granularity: 1,
      // axisMaximum: this._xAxisValues.length + 1,
      axisMiniumm: 0
    };
  };

  getChartColors = (glucoses: number[]) => {
    return glucoses.map(val => {
      return this.getGlucoseColor(val);
    });
  };
  getGlucoseColor = (glucose: number) => {
    let colorVal;
    if (glucose < GLOBAL.GLUCOSE_LOW_VAL) colorVal = GLOBAL.GLUCOSE_LOW_COLOR;
    else if (glucose > GLOBAL.GLUCOSE_HIGH_VAL) colorVal = GLOBAL.GLUCOSE_HIGH_COLOR;
    else colorVal = GLOBAL.GLUCOSE_NORMAL_COLOR;

    return processColor(colorVal);
  };
  getLineChartXValue = (measureTime: Date): number => {
    let ret;

    if (this._xAxisValues.length > 0) {
      const totalMins = moment(this._endDate).diff(moment(this._beginDate), 'minutes');
      // const totalSeconds = Math.ceil((this._endDate.getTime() - this._beginDate.getTime()) / 1000); // total seconds
      const oneUnitMins = this._xAxisValues.length > 1 ? Math.ceil(totalMins / (this._xAxisValues.length - 1)) : totalMins;
      const curMins = moment(measureTime).diff(moment(this._beginDate), 'minutes');
      // const curSeconds = Math.ceil((measureTime.getTime() - this._beginDate.getTime()) / 1000); // total seconds
      ret = oneUnitMins > 0 ? Number((curMins / oneUnitMins).toFixed(1)) : 0; // ;
    }
    // return Math.floor(ret);
    return ret;
  };

  getLineChartData(measureData: MonitorModel[], lineColor = "darkgrey") {
    const fpmValues = measureData.map(val => {
      return val.value;
    });

    let datasetItems: any[];
    datasetItems = [];
    const dataCount = measureData === undefined ? 0 : measureData.length;
    if (dataCount == 0) {
      datasetItems.push({ y: 0 });
    } else {
      for (let i = 0; i < dataCount; i++) {
        const state = measureData[i].state;
        let value = measureData[i].value;
        if (state == 5) {
          value = 33.4;
        }
        else if (state == 6) {
          value = 1.0;
        }
        datasetItems.push({
          x: this.getLineChartXValue(UTILS.createDate(measureData[i].time)),
          // y: 4,
          y: value,
          marker: `${Strings.common.str_glucoseVal}: ${UTILS.glucoseConvMMol(value)}
          \n${Strings.menu.task_measureTime}: ${UTILS.getShortTime(measureData[i].time, 0)}`
        });
      }
    }

    return {
      values: datasetItems.reverse(), // important!!!
      label: "",
      config: {
        lineWidth: 1,
        drawCircles: true,
        drawCircleHole: false,
        drawCubicIntensity: 0.0,
        drawCubic: false,
        mode: 'LINEAR',
        drawHighlightIndicators: true,
        highlightColor: processColor("red"),
        circleColor: processColor(greenBlue),
        circleColors: this.getChartColors(fpmValues.reverse()),
        circleRadius: 3,
        color: processColor(lineColor),
        drawFilled: false,
        fillColor: COLOR_PURPLE,
        fillAlpha: 90,
        valueTextSize: 0, // 15,
        valueFormatter: "#.#"
      }
    };
  }
}

// Export a single instance of chartHelper
export const chartHelper: ChartHelper = new ChartHelperImpl();
