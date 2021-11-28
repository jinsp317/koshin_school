import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  Platform,
  StyleSheet,
  NativeEventEmitter,
  NativeModules,
  Image,
  ToastAndroid
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Radio } from "@src/core/react-native-ui-kitten/ui";
import {
  ContainerView,
  textStyle,
  ValidationInput,
  ScrollableAvoidKeyboard
} from "@src/components/common";
import { IdentityInfo } from "../type";
import {
  StringValidator,
  CardNumberValidator,
  DateValidator,
  CardholderNameValidator
} from "@src/core/validators";
import {
  CardNumberFormatter,
  ExpirationDateFormatter,
  CvvFormatter,
  CardholderNameFormatter
} from "@src/core/formatters";
import { ScrollView } from "react-native-gesture-handler";

import GLOBAL from "@src/core/globals";

interface ComponentProps {
  onItemPress: (index: number) => void;
  data: IdentityInfo;
}

export type GetIdentityProps = ThemedComponentProps & ComponentProps;
interface State {
  p_name: string | undefined;
  p_identityNum: string | undefined;
  p_birthday: string | undefined;
  p_sexKind: number | undefined; // 0 male, 1 female
  p_address: string | undefined;
  isDataOk: boolean | undefined;
}
class GetIdentityInfoComponent extends React.Component<GetIdentityProps, State> {
  constructor(props) {
    super(props);
  }

  public state: State = {
    p_name: GLOBAL.curFreePatient.name,
    p_identityNum: GLOBAL.curFreePatient.cert_num,
    p_birthday: GLOBAL.curFreePatient.birthday,
    p_sexKind: GLOBAL.curFreePatient.gender,
    p_address: GLOBAL.curFreePatient.address,
    isDataOk: true
  };
  private onNameChange = (p_name: string) => {
    this.setState({ p_name });
  };
  private onIdentityNumChange = (p_identityNum: string) => {
    this.setState({ p_identityNum });
  };
  private onBirthdayChange = (p_birthday: string) => {
    this.setState({ p_birthday });
  };
  private onSexChange = (p_sexKind: number) => {
    this.setState({ p_sexKind });
  };
  private onAddressChange = (p_address: string) => {
    this.setState({ p_address });
  };
  private isValid = (state: State): boolean => {
    return (
      state.p_name !== undefined &&
      state.p_identityNum !== undefined &&
      state.p_sexKind !== undefined &&
      state.p_birthday !== undefined
    );
  };
  private onSaveButtonPress = () => {
    GLOBAL.curFreePatient.name = this.state.p_name;
    GLOBAL.curFreePatient.birthday = this.state.p_birthday;
    GLOBAL.curFreePatient.cert_num = this.state.p_identityNum;
    GLOBAL.curFreePatient.gender = this.state.p_sexKind;
    GLOBAL.curFreePatient.address = this.state.p_address;

    this.props.onItemPress(0);
  };
  public componentDidUpdate(prevProps: GetIdentityProps, prevState: State) {
    const oldFormValid: boolean = this.isValid(prevState);
    const newFormValid: boolean = this.isValid(this.state);

    const becomeValid: boolean = !oldFormValid && newFormValid;
    const becomeInvalid: boolean = oldFormValid && !newFormValid;

    if (becomeValid) {
      this.setState({ isDataOk: true });
    } else if (becomeInvalid) {
      this.setState({ isDataOk: false });
    }
  }

  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ScrollView style={themedStyle.container}>
        <ScrollableAvoidKeyboard contentContainerStyle={themedStyle.contentContainer}>
          <View style={{ padding: 10 }}>
            <ValidationInput
              style={[themedStyle.input, themedStyle.cardholderNameInput]}
              textStyle={textStyle.paragraph}
              labelStyle={textStyle.label}
              label={Strings.common.str_name}
              placeholder={Strings.message.input_name}
              validator={StringValidator}
              onChangeText={this.onNameChange}
              value={this.state.p_name}
            />

            <ValidationInput
              style={themedStyle.input}
              textStyle={textStyle.paragraph}
              labelStyle={textStyle.label}
              label={Strings.common.str_identityNum}
              placeholder="000000000000000000"
              validator={CardNumberValidator}
              maxLength={18}
              keyboardType="numeric"
              onChangeText={this.onIdentityNumChange}
              value={this.state.p_identityNum}
            />
            {/*
            <ValidationInput
              style={[themedStyle.input, themedStyle.expireInput]}
              textStyle={textStyle.paragraph}
              labelStyle={textStyle.label}
              label={Strings.common.str_birthday}
              placeholder="YYYYMMDD"
              validator={DateValidator}
              maxLength={8}
              keyboardType="numeric"
              onChangeText={this.onBirthdayChange}
              value={this.state.p_birthday}
            />
*/}
            <ValidationInput
              multiline={true}
              style={[themedStyle.input, themedStyle.cardholderNameInput]}
              textStyle={textStyle.paragraph}
              labelStyle={textStyle.label}
              label={Strings.common.str_address}
              placeholder={Strings.message.input_address}
              validator={StringValidator}
              onChangeText={this.onAddressChange}
              value={this.state.p_address}
            />

            <View style={themedStyle.radioContainer}>
              <Radio
                text={Strings.common.str_male}
                checked={this.state.p_sexKind === 0}
                onChange={() => this.onSexChange(0)}
                style={themedStyle.radioItem}
              />
              <Radio
                text={Strings.common.str_female}
                checked={this.state.p_sexKind === 1}
                onChange={() => this.onSexChange(1)}
                style={themedStyle.radioItem}
              />
            </View>
          </View>
        </ScrollableAvoidKeyboard>
        <Button
          style={{ marginHorizontal: 10 }}
          textStyle={textStyle.button}
          size="giant"
          disabled={!this.state.isDataOk}
          onPress={this.onSaveButtonPress}
        >
          {Strings.common.str_ok}
        </Button>
      </ScrollView>
    );
  }
}

export const GetIdentityInfo = withStyles(GetIdentityInfoComponent, (theme: ThemeType) => ({
  container: {
    backgroundColor: theme["background-basic-color-2"],
    paddingHorizontal: 16
  },
  contentContainer: {
    flex: 1
  },
  formContainer: {
    flex: 1,
    marginTop: 40
  },
  addButton: {
    marginVertical: 24
  },
  radioContainer: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center"
  },
  radioItem: { marginRight: 10 }
}));
