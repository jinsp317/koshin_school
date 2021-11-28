import React from "react";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Input, InputProps } from "@src/core/react-native-ui-kitten/ui";
import { enablePromise } from "react-native-sqlite-storage";
import { Alert } from "react-native";

interface ComponentProps extends InputProps {
  isGlucoseInput?: boolean;
  enableIcon?: boolean;
  validator: (value: string) => boolean;
  formatter?: (value: string, stateValue: string) => string;
  /**
   * Will emit changes depending on validation:
   * Will be called with input value if it is valid, otherwise will be called with undefined
   */
  onChangeText?: (value: string | undefined) => void;
  onIconPress?: () => void; // rhj
}

interface State {
  value: string;
  enableIcon: boolean;
}

export type ValidationInputProps = ThemedComponentProps & ComponentProps;

/**
 * You probably don't need to pass `value` prop into this component
 */
class ValidationInputComponent extends React.Component<
  ValidationInputProps,
  State
> {
  public state: State = {
    value: this.props.value,
    enableIcon: this.props.enableIcon
  };
  componentWillReceiveProps(nextProps) {
    // this.setState({ enableIcon: nextProps.enableIcon });
    this.setState({ enableIcon: nextProps.enableIcon, value: nextProps.value });
  }
  public componentDidUpdate(prevProps: ValidationInputProps, prevState: State) {
    const { value: oldValue } = prevState;
    const { value: newValue } = this.state;

    const becomeValid: boolean =
      !this.isValid(oldValue) && this.isValid(newValue);
    const becomeInvalid: boolean =
      !this.isValid(newValue) && this.isValid(oldValue);

    if (becomeValid) {
      this.props.onChangeText(newValue);
    } else if (becomeInvalid) {
      this.props.onChangeText(undefined);
    }
  }

  private onChangeText = (text: string) => {
    const { formatter } = this.props;

    const value: string = formatter ? formatter(text, this.state.value) : text;

    this.setState({ value }, this.onValueChange);
  };
  private onIconPress = () => {
    if (this.props.onIconPress) this.props.onIconPress();
  };
  private onValueChange = () => {
    const { value } = this.state;

    if (this.isValid(value) && this.props.onChangeText) {
      this.props.onChangeText(value);
    }
  };

  private isValid = (value: string): boolean => {
    const { validator } = this.props;

    return validator(value);
  };

  private getStatus = (): string | undefined => {
    const { value } = this.state;

    if (this.props.isGlucoseInput) return "primary";

    if (value && value.length) {
      return this.isValid(value) ? "success" : "danger";
    }
    if (this.state.enableIcon) return "primary";

    return undefined;
  };

  public render(): React.ReactNode {
    const { style, themedStyle, ...restProps } = this.props;

    return (
      <Input
        autoCapitalize="none"
        status={this.getStatus()}
        {...restProps}
        value={this.state.value}
        style={[themedStyle.container, style]}
        onChangeText={this.onChangeText}
        onIconPress={this.onIconPress}
      />
    );
  }
}

export const ValidationInput = withStyles(
  ValidationInputComponent,
  (theme: ThemeType) => ({
    container: {}
  })
);
