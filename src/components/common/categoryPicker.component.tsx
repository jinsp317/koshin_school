import React, { Component } from "react";
import { StyleSheet, ViewProps, StyleProp } from "react-native";
import ModalDropdown from "react-native-modal-dropdown";
import { themes } from "@src/core/themes";
import { number } from "prop-types";

interface ComponentProps {
  selectCategory: (index: number, value: string) => void;
  options: string[];
  defCategoryIndex?: number;
  textColor?: string;
  disabled?: boolean;
  style?: any;
  curIndex?: number;
}
interface State {
  // defCategoryIndex: number;
}
type Props = ViewProps & ComponentProps;

export default class CategoryPicker extends Component<Props, State> {
  private _pickerRef;
  private _curIndex: number;
  constructor(props: Props) {
    super(props);
    this._pickerRef = React.createRef();
    this._curIndex = props.defCategoryIndex ? props.defCategoryIndex : 0;
    this.onSelect = this.onSelect.bind(this);
    this.renderButtonText = this.renderButtonText.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.curIndex === undefined) return;
    if (nextProps.curIndex === this._curIndex) return;
    this.select(nextProps.curIndex);
  }
  renderButtonText(value: string) {
    return value + " ▼";
  }

  onSelect(key: string, value: string) {
    const index = Number(key);
    if (this._curIndex == index) return;
    this._curIndex = index;

    this.props.selectCategory(index, value);
  }
  select = (index: number) => {
    this._pickerRef.current.select(index);
    this._curIndex = index;
  };
  render() {
    let textColor = this.props.textColor
      ? this.props.textColor
      : themes["App Theme"]["color-primary-500"];
    if (this.props.disabled) textColor = "darkgray";
    return (
      <ModalDropdown
        ref={this._pickerRef}
        style={this.props.style}
        disabled={this.props.disabled}
        textStyle={[styles.text, { color: textColor }]}
        dropdownStyle={[
          styles.dropdown,
          {
            height: (42 + StyleSheet.hairlineWidth) * this.props.options.length
          }
        ]}
        dropdownTextStyle={styles.dropdownText}
        defaultValue={`${this.props.options[this.props.defCategoryIndex]} ▼`}
        options={this.props.options}
        renderButtonText={this.renderButtonText}
        onSelect={this.onSelect}
      />
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: "white",
    fontSize: 16
    //    fontFamily: "Rubik-Light"
  },
  dropdownText: {
    fontSize: 16,
    paddingHorizontal: 16
  },
  dropdown: {
    borderColor: themes["App Theme"]["color-primary-500"],
    marginTop: 10,
    height: (33 + StyleSheet.hairlineWidth) * 3
  }
});
