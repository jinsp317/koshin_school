import React from "react";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
  ImageProps
} from "react-native";
import { ThemedComponentProps, ThemeType, withStyles } from "@src/core/react-native-ui-kitten/theme";
import { ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import DatePicker from "react-native-datepicker";
import { now } from "moment";

interface ComponentProps {
  ref1?: any;
  onDateChange: (data: Date) => void;
  date?: Date;
  minDate?: Date;
  maxDate?: Date;
  mode?: string; // The enum of date, datetime and time
  format?: string; // "YYYY-MM-DD"
  textColor?: string;
  disabled?: boolean;
  hideText?: boolean;
  width?: number;
}

export type MyDatePickerProps = ThemedComponentProps & ComponentProps;

export class MyDatePicker extends React.Component<MyDatePickerProps> {
  constructor(props: MyDatePickerProps) {
    super(props);
    this.state = {
      date: this.props.date ? this.props.date : new Date(now())
    };
  }

  componentWillReceiveProps(nextProps: MyDatePickerProps) {
    this.setState({ date: nextProps.date });
  }

  render() {
    return (
      <DatePicker
        ref={ref => (this.props.ref1 = ref)}
        disabled={this.props.disabled}
        hideText={this.props.hideText}
        style={this.props.mode == "datetime" ? { width: 160 } : { width: 100 }}
        date={this.state.date} // initial date from state
        mode={this.props.mode ? this.props.mode : "date"} // The enum of date, datetime and time
        placeholder="请选择日期"
        format={this.props.format ? this.props.format : "YYYY-MM-DD"} // "YYYY-MM-DD"
        minDate={this.props.minDate}
        maxDate={this.props.maxDate}
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateIcon: {
            width: 0,
            position: "absolute",
            left: 0,
            top: 4,
            marginLeft: 0
          },
          dateInput: {
            marginLeft: 0,
            marginRight: 0,
            padding: 0,
            borderWidth: 0
          },
          dateText: {
            color: this.props.textColor
          },
          disabled: {
            backgroundColor: "white"
          }
        }}
        onDateChange={date => {
          this.setState({ date: date });
          this.props.onDateChange(date);
        }}
      />
    );
  }
}

const styles = StyleSheet.create({});
