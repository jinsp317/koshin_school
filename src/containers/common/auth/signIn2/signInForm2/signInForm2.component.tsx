import Strings from "@src/assets/strings";
import React from "react";
import { View, ViewProps, FlatList, Text, TouchableOpacity } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Button, ListItem, ListItemProps } from "@src/core/react-native-ui-kitten/ui";
import { textStyle, ValidationInput, SlideMenu } from "@src/components/common";
import {
  EyeOffIconFill,
  PersonIconFill,
  PersionDoneIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@src/assets/icons";
import commonStyles from "@src/containers/styles/common";
import { NameValidator, PasswordValidator, AccountValidator } from "@src/core/validators";
import { SignInForm2Data } from "./type";
import GLOBAL from "@src/core/globals";
import { UserModel } from '@src/core/model';

import { SvgXml } from "react-native-svg";
interface ComponentProps {
  defFormData: SignInForm2Data;
  onForgotPasswordPress: () => void;
  /**
   * Will emit changes depending on validation:
   * Will be called with form value if it is valid, otherwise will be called with undefined
   */
  onDataChange: (value: SignInForm2Data | undefined) => void;
  onUserNameIconPress: () => void;
  onPasswordIconPress: () => void;
  onListItemPress: (value: string) => void;
  users: UserModel[];
  signinMode: number;
}

export type SignInForm2Props = ThemedComponentProps & ViewProps & ComponentProps;

interface State {
  username: string | undefined;
  password: string | undefined;
  showUserList: boolean;
  cuserId: number;
}

class SignInForm2Component extends React.Component<SignInForm2Props, State> {
  public state: State = {
    username: this.props.defFormData ? this.props.defFormData.username : undefined,
    password: this.props.defFormData && GLOBAL.isSaveInfo ? this.props.defFormData.password : undefined,
    showUserList: false,
    cuserId: -1
  };

  public componentDidUpdate(prevProps: SignInForm2Props, prevState: State) {
    const oldFormValid: boolean = this.isValid(prevState);
    const newFormValid: boolean = this.isValid(this.state);

    const isStateChanged: boolean = this.state !== prevState;
    const becomeValid: boolean = !oldFormValid && newFormValid;
    const becomeInvalid: boolean = oldFormValid && !newFormValid;
    const remainValid: boolean = oldFormValid && newFormValid;

    if (becomeValid) {
      this.props.onDataChange(this.state);
    } else if (becomeInvalid) {
      // this.props.onDataChange(this.state);
      this.props.onDataChange(undefined);
    } else if (isStateChanged && remainValid) {
      this.props.onDataChange(this.state);
    }
  }

  private onForgotPasswordButtonPress = () => {
    this.props.onForgotPasswordPress();
  };

  private onUsernameInputTextChange = (username: string) => {
    let password = "";
    if (!GLOBAL.isSaveInfo) {
      this.setState({ username });
      return;
    }
    GLOBAL.savedUsers.some(e => {
      if (e.hospital_num === GLOBAL.hospital_num && e.nick === username && GLOBAL.isSaveInfo) {
        password = e.password;
        return true;
      }
    });

    this.setState({ username, password });
  };

  private onPasswordInputTextChange = (password: string) => {
    this.setState({ password });
  };

  private isValid = (value: SignInForm2Data): boolean => {
    const { username, password } = value;

    return true; // username !== undefined && password !== undefined;
  };
  _renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        this.setState({
          username: item.nick,
          password: GLOBAL.isSaveInfo ? item.password : '',
          showUserList: false
        })
      }
    >
      <View key={item.id} style={{ paddingVertical: 10 }}>
        <Text>{item.nick}</Text>
      </View>
    </TouchableOpacity>
  );
  _renderAItem = ({ item }) => {
    const { style, themedStyle } = this.props;
    return (
      <ListItem style={[style, themedStyle.userItem]}>
        <TouchableOpacity
          onPress={() =>
            this.setState({
              username: item.nick,
              password: GLOBAL.isSaveInfo ? item.password : '',
              showUserList: false
            })
          }
        >
          <View key={item.id} style={{ paddingVertical: 4 }}>
            <Text>{item.nick}</Text>
          </View>
        </TouchableOpacity>
      </ListItem>

    );
  }


  private onTaskCheckIntervalChange(index: number) {

  }
  _keyExtractor = (item, index) => item.nick;
  ListViewItemSeparator = () => {
    return <View style={{ height: 0.5, width: "100%", backgroundColor: "lightgray" }} />;
  };
  public render(): React.ReactNode {
    const { style, themedStyle, users, ...restProps } = this.props;
    const arUsers = users.map(_it => _it.nick);
    const cusers = GLOBAL.savedUsers
      .map(e => {
        if (e.hospital_num === GLOBAL.hospital_num) return e;
      })
      .filter(e => e);


    return (
      <View style={[themedStyle.container, style]} {...restProps}>
        <View style={themedStyle.formContainer}>
          <ValidationInput
            textStyle={textStyle.paragraph}
            placeholder={Strings.menu.signin_input_user}
            icon={this.state.showUserList ? ArrowUpIcon : ArrowDownIcon}
            validator={AccountValidator}
            onChangeText={this.onUsernameInputTextChange}
            // value={this.props.defFormData && this.props.defFormData.username}
            onIconPress={() => {
              this.setState({ showUserList: !this.state.showUserList });
            }}
            value={this.state.username}
          />
          {this.state.showUserList && this.props.signinMode != 0 && cusers.length > 0 && (
            <FlatList
              contentContainerStyle={themedStyle.userList}
              keyExtractor={this._keyExtractor}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              data={cusers}
              renderItem={this._renderItem}
            />
          )}
          {this.state.showUserList && this.props.signinMode == 0 && users.length > 0 && (
            <FlatList
              contentContainerStyle={themedStyle.userList}
              keyExtractor={this._keyExtractor}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              numColumns={2}
              data={users}
              renderItem={this._renderAItem}
            />
          )}
          {/* {this.props.signinMode != 0 && this.state.showUserList && (cusers.length > 0 || users.length > ) ? (
            <FlatList
              contentContainerStyle={themedStyle.userList}
              keyExtractor={this._keyExtractor}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              data={cusers}
              renderItem={this._renderItem}
            />
          ) : (
              <FlatList
                contentContainerStyle={themedStyle.userList}
                keyExtractor={this._keyExtractor}
                ItemSeparatorComponent={this.ListViewItemSeparator}
                data={users}
                renderItem={this._renderItem}
              />

            )} */}
          {/* {this.state.showUserList && cusers.length > 0 && (
            
          )} */}
          <ValidationInput
            style={themedStyle.passwordInput}
            textStyle={textStyle.paragraph}
            placeholder={Strings.menu.signin_input_password}
            icon={EyeOffIconFill}
            secureTextEntry={true}
            validator={PasswordValidator}
            onChangeText={this.onPasswordInputTextChange}
            // value={this.props.defFormData && this.props.defFormData.password}
            value={this.state.password}
            onIconPress={() => this.setState({ password: undefined })}
          />
          <View style={themedStyle.forgotPasswordContainer}>
            <Button
              style={[themedStyle.forgotPasswordButton]}
              textStyle={themedStyle.forgotPasswordText}
              appearance="ghost"
              activeOpacity={0.75}
              onPress={this.onForgotPasswordButtonPress}
            >
              Forgot your password?
            </Button>
          </View>          
        </View>
      </View>
    );
  }
}

export const SignInForm2 = withStyles(SignInForm2Component, (theme: ThemeType) => ({
  container: {},
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    opacity: 0
  },
  passwordInput: {
    marginTop: 16
  },
  forgotPasswordButton: {
    paddingHorizontal: 0
  },
  forgotPasswordText: {
    fontSize: 15,
    color: theme["text-hint-color"],
    ...textStyle.subtitle
  },
  userList: {
    paddingHorizontal: 20,
    borderWidth: 0.8,
    borderTopWidth: 0.8,
    borderColor: theme["color-success-500"],
    borderRadius: 4
  },
  userItem: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
}));
