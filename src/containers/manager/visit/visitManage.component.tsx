import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityProps,
  Image,
  PixelRatio
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button } from "@src/core/react-native-ui-kitten/ui";

import {
  PatientModel,
  GlucoseMonitorModel,
  MANAGE_KIND,
  ObjectModel,
  VisitModel
} from "@src/core/model";
import { MyDatePicker, textStyle, ContainerView, SlideMenu } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { SaveIconOutline } from "@src/assets/icons";
import { themes } from "@src/core/themes";
import CategoryPicker from "@src/components/common/categoryPicker.component";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { Input, RadioGroup, Radio, Text } from "@src/core/react-native-ui-kitten/ui";
import { EditInput } from "@src/components/common";
import ProgressBar from "@src/components/common/progressBar.component";
import ImagePicker from "react-native-image-picker";

interface ComponentProps {
  kind: number; // 0: in, 1: modify 2: out
  onSave: (data: VisitModel) => void;
  navigation: any;
  visitData?: VisitModel;
  isLoading: boolean;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  depart_index: number;
  memo: string;
  avatarSource: any;
  avatarData: any;
  Image_TAG: string;
}

class MyComponent extends React.Component<Props, State> {
  private _visitData: VisitModel;
  constructor(props: Props) {
    super(props);
    this.selectPhotoTapped = this.selectPhotoTapped.bind(this);

    const today = UTILS.getFormattedDate(undefined, 1);
    this._visitData = props.visitData
      ? props.visitData : {
        patient_id: GLOBAL.curPatient.id,
        hospital_id: GLOBAL.curUser.hospital_id,
        user_id: GLOBAL.curUser.id,
        department_id: GLOBAL.curPatient.department_id,
        doctor_id: GLOBAL.curPatient.doctor_id,
        state: 0,
        from_time: today,
        to_time: today
      };

    const depart_index = UTILS.getIndexFromId(
      GLOBAL.totalDepartments,
      this._visitData.department_id
    );

    this.state = {
      depart_index,
      memo: this._visitData.memo,
      avatarSource: null,
      avatarData: null,
      Image_TAG: ""
    };

    if (this.props.kind === MANAGE_KIND.ADD) {
      this._visitData.doctor_id = undefined;
    }
    if (this.props.kind === MANAGE_KIND.MODIFY) this._visitData.to_time = today;
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState();
  }
  componentDidMount() {
    this.updateState();
  }
  componentWillMount() {
    this.setNavigationParams();
  }

  private setNavigationParams() {
    const onRightPress = this.onSave;
    const rightIcon = SaveIconOutline;
    let caption = Strings.patient.faqisuifang;
    if (this.props.kind === MANAGE_KIND.MODIFY) caption = Strings.common.str_modify;

    this.props.navigation.setParams({
      onRightPress,
      rightIcon,
      caption
    });
  }

  private updateState = () => { };

  private onSave = () => {
    if (!this._visitData.department_id) {
      UTILS.alert(Strings.message.input_department);
      return;
    }
    if (!this._visitData.from_time) {
      UTILS.alert(Strings.message.input_startTime);
      return;
    }
    if (!this._visitData.doctor_id) {
      UTILS.alert(Strings.message.input_doctor1);
      return;
    }

    if (this.props.kind === MANAGE_KIND.MODIFY && !this._visitData.to_time) {
      UTILS.alert(Strings.message.input_consultTime);
      return;
    }

    this._visitData.image_file = this.state.avatarData;
    this.props.onSave(this._visitData);
  };

  private onDepartChange = (index: number) => {
    if (this.state.depart_index === index) return;
    const depart_index = index;
    this._visitData.department_id = GLOBAL.totalDepartments[depart_index].id;
    this._visitData.doctor_id = undefined;

    this.setState({ depart_index });
  };
  private onDoctorChange = (index: number) => {
    const doctors = this.getFullDoctors(this.state.depart_index);
    const ids = UTILS.getSingleArrFromMultiArr(doctors, "id");
    this._visitData.doctor_id = ids[index];
  };

  private onFromTimeChange = (date: Date) => {
    this._visitData.from_time = UTILS.getFormattedDate(date, 1);
  };
  private onEndTimeChange = (date: Date) => {
    this._visitData.to_time = UTILS.getFormattedDate(date, 1);
  };
  private onMemoChange = (value: string) => {
    this.setState({ memo: value });
    this._visitData.memo = value;
  };

  private getFullDoctors = (departIdx: number) => {
    return [{ id: undefined, name: "无" }, ...GLOBAL.totalDepartments[departIdx].doctors];
  };
  selectPhotoTapped() {
    const options = {
      title: "选择图像",
      storageOptions: {
        skipBackup: true,
        path: "dale"
      },
      takePhotoButtonTitle: "拍照",
      chooseFromLibraryButtonTitle: "相册",
      cancelButtonTitle: "取消",
      quality: 0.5, // 0~1
      maxWidth: 500,
      maxHeight: 500
    };

    ImagePicker.showImagePicker(options, response => {
      if (__DEV__) console.info("Response = ", response);

      if (response.didCancel) {
        if (__DEV__) console.info("User cancelled photo picker");
      } else if (response.error) {
        if (__DEV__) console.info("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        if (__DEV__) console.info("User tapped custom button: ", response.customButton);
      } else {
        const source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source,
          avatarData: response.data
        });
      }
    });
  }

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    if (this.props.isLoading) {
      return (
        <View style={commonStyles.progressBar}>
          <ProgressBar />
        </View>
      );
    }
    return (
      <ContainerView
        style={themedStyle.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={"interactive"}
      >
        <View style={themedStyle.body}>
          <View style={themedStyle.section}>
            <EditInput
              editable={false}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_name}
              value={GLOBAL.curPatient.name}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.patient.list_keshi} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"MENU_DEPARTMENTS"}
                // disabled={this.props.kind === MANAGE_KIND.OUT ? true : true}
                data={UTILS.getSingleArrFromMultiArr(GLOBAL.totalDepartments, "name")}
                curItemIndex={this.state.depart_index}
                onMenuItemSelect={this.onDepartChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${"医生"} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu
                name={"MENU_DOCTORS"}
                // disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                data={UTILS.getSingleArrFromMultiArr(
                  this.getFullDoctors(this.state.depart_index),
                  "name"
                )}
                curItemIndex={UTILS.getIndexFromId(
                  this.getFullDoctors(this.state.depart_index),
                  this._visitData.doctor_id
                )}
                onMenuItemSelect={this.onDoctorChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>

          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text
                style={commonStyles.sectionText}
              >{`${Strings.patient.list_faqishijian} :`}</Text>
              <MyDatePicker
                mode={"datetime"}
                format={"YYYY-MM-DD HH:mm"}
                onDateChange={date => this.onFromTimeChange(date)}
                date={
                  this._visitData.from_time
                    ? UTILS.createDate(this._visitData.from_time)
                    : UTILS.createDate(undefined)
                }
                maxDate={new Date()}
                textColor={themes["App Theme"]["color-basic-900"]}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text
                style={commonStyles.sectionText}
              >{`${Strings.patient.list_suifangshijian} :`}</Text>
              <MyDatePicker
                hideText={this._visitData.to_time ? false : true}
                onDateChange={date => this.onEndTimeChange(date)}
                mode={"datetime"}
                format={"YYYY-MM-DD HH:mm"}
                date={
                  this._visitData.to_time
                    ? UTILS.createDate(this._visitData.to_time)
                    : UTILS.createDate(undefined)
                }
                textColor={themes["App Theme"]["color-basic-900"]}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput
              editable={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_memo}
              onChangeText={this.onMemoChange}
              value={this._visitData.memo}
            />
          </View>
          <View style={themedStyle.imageContainer}>
            <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)} onLongPress={() => { }}>
              <View style={[themedStyle.avatar, themedStyle.avatarContainer, { marginBottom: 20 }]}>
                {this.state.avatarSource === null ? (
                  <Text>选择图片</Text>
                ) : (
                    <Image style={themedStyle.avatar} source={this.state.avatarSource} />
                  )}
              </View>
            </TouchableOpacity>
            {this.state.avatarSource && (
              <Button style={{ padding: 10 }} onPress={() => this.setState({ avatarSource: null })}>
                删除
              </Button>
            )}
          </View>
        </View>
      </ContainerView>
    );
  }
}

export const VisitManage = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  },
  body: {
    paddingBottom: 6
  },
  section: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"]
  },
  sectionDatePickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 0
  },
  sectionCategoryPickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 8
  },
  radioGroup: {
    flexDirection: "row",
    paddingVertical: 6
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
    // backgroundColor: "#F5FCFF"
  },
  avatarContainer: {
    borderColor: "#9B9B9B",
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: "center",
    alignItems: "center"
  },
  avatar: {
    borderRadius: 0,
    width: 150,
    height: 150
  }
}));
