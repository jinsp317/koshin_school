import Strings from '@src/assets/strings';
import React from 'react';
import {
  View,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native';
const { width } = Dimensions.get('window');
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from '@src/core/react-native-ui-kitten/theme';

import { PatientModel, GlucoseMonitorModel, MANAGE_KIND, HospitalModel, UNIQUE_KIND } from '@src/core/model';
import { MyDatePicker, textStyle, ContainerView, SlideMenu } from '@src/components/common';
import * as UTILS from '@src/core/app_utils';
import { SaveIconOutline, StateEatIconFill } from '@src/assets/icons';
import { themes } from '@src/core/themes';
import CategoryPicker from '@src/components/common/categoryPicker.component';

import GLOBAL from '@src/core/globals';
import commonStyles from '../../styles/common';
import { Input, RadioGroup, Radio, Text } from '@src/core/react-native-ui-kitten/ui';
import { EditInput } from '@src/components/common';
import ProgressBar from '@src/components/common/progressBar.component';
import { database } from '@src/core/utils/database';
import { now } from 'moment';

interface ComponentProps {
  kind: number; // 0: in, 1: modify 2: out
  onSave: (pinfo: PatientModel) => void;
  navigation: any;
  pInfo?: PatientModel;
  isLoading: boolean;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  depart_index: number;
  sex: number;
  name: string;
  mobile: string;
  age: number;
  bed_num: string;
  patient_num: string;
  is_married: number;
  has_child: number;
  smoking: number;
  drinking: number;
  id_card: string;
  family_mobile: string;
  isurance_card: string;
  isurance_kind: number;
  note: string;
  address: string;
}

class MyComponent extends React.Component<Props, State> {
  private _pInfo: PatientModel;
  private _hospitalInfo: HospitalModel;
  constructor(props: Props) {
    super(props);
    this._hospitalInfo = undefined;
    const today = UTILS.getFormattedDate(undefined, 1);
    this._pInfo = props.pInfo ? props.pInfo : { gender: 0, in_date: today, out_date: today, birthday: today, diabetes_id: 0, id: 0, name: '' };
    this._pInfo.diabetes_id === undefined ? 0 : this._pInfo.diabetes_id;

    if (this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.ADD) {
      this._pInfo.department_id = GLOBAL.totalDepartments[0].id;
      // this._pInfo.department_id = GLOBAL.defDepartId;
      this._pInfo.doctor_id = undefined;
      this._pInfo.nurse_id = undefined;
      this._pInfo.in_date = today;
      this._pInfo.out_date = undefined;
      this._pInfo.bed_number = undefined;
      this._pInfo.patient_number = undefined;
    }

    // TODO: 입원처리때 닥터,간호사인경우 자기의 과실만 선택하기
    const departmentId = this.props.kind === MANAGE_KIND.IN && !GLOBAL.curUser.is_admin ? GLOBAL.curUser.department_id : this._pInfo.department_id;
    this._pInfo.department_id = departmentId;
    // console.log(GLOBAL.totalDepartments);
    const depart_index = UTILS.getIndexFromId(GLOBAL.totalDepartments, departmentId);

    this.state = {
      sex: this._pInfo.gender,
      depart_index,
      name: this._pInfo.name,
      age: this._pInfo.age,
      mobile: this._pInfo.mobile,
      bed_num: this._pInfo.bed_number,
      patient_num: this._pInfo.patient_number,
      is_married: this._pInfo.is_married,
      has_child: this._pInfo.has_child,
      drinking: this._pInfo.drinking,
      smoking: this._pInfo.smoking,
      id_card: this._pInfo.id_card_number,
      family_mobile: this._pInfo.family_contact,
      isurance_kind: this._pInfo.has_medical_insurance,
      isurance_card: this._pInfo.medical_insurance_number,
      note: this._pInfo.note,
      address: this._pInfo.address
    };

    if (this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.ADD) {
      this._pInfo.doctor_id = undefined;
      this._pInfo.nurse_id = undefined;
    }
    if (this.props.kind === MANAGE_KIND.OUT) { this._pInfo.out_date = today; }
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
    let caption = Strings.patient.banliruyuan;
    if (this.props.kind === MANAGE_KIND.MODIFY) {
      caption = Strings.patient.xiugaizhuyuan;
    } else if (this.props.kind === MANAGE_KIND.OUT) {
      caption = Strings.patient.banlichuyuan;
    } else if (this.props.kind === MANAGE_KIND.ADD) {
      caption = Strings.patient.tianjiahuanzhe;
    }

    this.props.navigation.setParams({
      onRightPress,
      rightIcon,
      caption
    });
  }

  private updateState = async () => {
    this._hospitalInfo = await database.getHospitalModel(GLOBAL.curHospitalId);
  };

  private onSave = () => {
    // if (GLOBAL.isOffline) {
    //   UTILS.showToast(Strings.message.alert_isOffline);
    //   return;
    // }
    if (this._pInfo.department_id) {
      const dept = GLOBAL.totalDepartments.find(_it => _it.id === this._pInfo.department_id);
      if (dept) {
        this._pInfo.alarm_max = dept.alarm_max;
        this._pInfo.alarm_min = dept.alarm_min;
        this._pInfo.pulse_after_max = dept.pulse_after_max;
        this._pInfo.pulse_after_min = dept.pulse_after_min;
        this._pInfo.pulse_anytime_max = dept.pulse_anytime_max;
        this._pInfo.pulse_anytime_min = dept.pulse_anytime_min;
        this._pInfo.pulse_before_max = dept.pulse_before_max;
        this._pInfo.pulse_before_min = dept.pulse_before_min;
        this._pInfo.target_after_max = dept.target_after_max;
        this._pInfo.target_after_min = dept.target_after_min;
        this._pInfo.target_before_max = dept.target_before_max;
        this._pInfo.target_before_min = dept.target_before_min;
      }
    }
    if (!this._pInfo.name) {
      UTILS.alert(Strings.message.input_patientName);
      return;
    }

    if (this._hospitalInfo.patient_unique === UNIQUE_KIND.MOBILE || this._hospitalInfo.patient_required_mobile) {
      if (!this._pInfo.mobile) {
        UTILS.alert(Strings.message.input_patientMobile);
        return;
      }
      if (this._pInfo.mobile.length !== 11) {
        UTILS.alert(Strings.message.input_validMobile);
        return;
      }
    }
    if (!this._pInfo.age) {
      UTILS.alert(Strings.message.input_age);
      return;
    }
    if (!this._pInfo.birthday) {
      UTILS.alert(Strings.message.input_birthday);
      return;
    }
    if (!this._pInfo.birthday) {
      UTILS.alert(Strings.message.input_birthday);
      return;
    }
    if (!this._pInfo.department_id) {
      UTILS.alert(Strings.message.input_department);
      return;
    }
    if (this._hospitalInfo.patient_required_bed_number && !this._pInfo.bed_number) {
      UTILS.alert(Strings.message.input_bedNumber);
      return;
    }
    if ((this._hospitalInfo.patient_required_patient_number ||
      this._hospitalInfo.patient_unique === UNIQUE_KIND.HOSPITAL_NUM) && !this._pInfo.patient_number) {
      UTILS.alert(Strings.message.input_patientNumber);
      return;
    }

    if (!this._pInfo.in_date) {
      UTILS.alert(Strings.message.input_inDate);
      return;
    }
    if (this._hospitalInfo.patient_required_doctor && !this._pInfo.doctor_id) {
      UTILS.alert(Strings.message.input_doctor);
      return;
    }
    if (this._hospitalInfo.patient_required_nurse && !this._pInfo.nurse_id) {
      UTILS.alert(Strings.message.input_nurse);
      return;
    }
    // if( && )
    // if (this._pInfo.mobile && this.props.kind === MANAGE_KIND.ADD) {
    //   // httpHelper.downloadPatientsByMobile(this._pInfo.mobile)
    //   //   .then(response => {
    //   //     if (response.result && response.result.length > 0) {
    //   //       GLOBAL.curPatient = response.result[0];

    //   //       UTILS.showToast("该患者信息已存在");
    //   //       this.props.navigation.navigate("Detail Main");
    //   //       return;
    //   //     }
    //   //   })
    //   //   .catch(e => { });
    // }

    /*
    if (!this._pInfo.mobile) {
      UTILS.alert(Strings.message.input_patientMobile);
      return;
    }
    */
    if (this._pInfo.mobile && this._pInfo.mobile.length !== 11) {
      UTILS.alert(Strings.message.input_validMobile);
      return;
    }
    if (!this._pInfo.birthday) {
      UTILS.alert(Strings.message.input_birthday);
      return;
    }
    if (!this._pInfo.department_id) {
      UTILS.alert(Strings.message.input_department);
      return;
    }
    if (!this._pInfo.in_date) {
      UTILS.alert(Strings.message.input_inDate);
      return;
    }
    if (!this._pInfo.bed_number) {
      UTILS.alert(Strings.message.input_bedNumber);
      return;
    }
    if (this.props.kind === MANAGE_KIND.OUT && !this._pInfo.out_date) {
      UTILS.alert(Strings.message.input_outDate);
      return;
    }

    this.props.onSave(this._pInfo);
  };

  private onPatientNameChange = (name: string) => {
    this._pInfo.name = name;
    // this.setState({ name: name });
  };
  private onMobileChange = (mobile: string) => {
    this._pInfo.mobile = mobile;
    // this.setState({ mobile: mobile });
  };

  private onSexChange = (index: number) => {
    this._pInfo.gender = index;
    this.setState({ sex: this._pInfo.gender });
  };
  private onAgeChange = (value: string) => {
    this._pInfo.age = Number(value);
    const date = new Date();
    date.setFullYear(date.getFullYear() - this._pInfo.age);
    this._pInfo.birthday = UTILS.getFormattedDate(date, 0);
  };
  private onBirthdayChange = (date: Date) => {
    this._pInfo.birthday = UTILS.getFormattedDate(date, 0);
  };

  private onDepartChange = (index: number) => {
    if (this.state.depart_index === index) { return; }
    const depart_index = index;
    this._pInfo.department_id = GLOBAL.totalDepartments[depart_index].id;
    this._pInfo.doctor_id = undefined;
    this._pInfo.nurse_id = undefined;
    this.setState({ depart_index });
  };
  private onDoctorChange = (index: number) => {
    const doctors = this.getFullDoctors(this.state.depart_index);
    const ids = UTILS.getSingleArrFromMultiArr(doctors, 'id');
    this._pInfo.doctor_id = ids[index];
  };

  private onNurseChange = (index: number) => {
    const nurses = this.getFullNurses(this.state.depart_index);
    const ids = UTILS.getSingleArrFromMultiArr(nurses, 'id');
    this._pInfo.nurse_id = ids[index];
  };
  private onBedNumChange = (value: string) => {
    const bed_num = value;
    this._pInfo.bed_number = bed_num;
  };
  private onPatientNumChange = (value: string) => {
    const patient_num = value;
    this._pInfo.patient_number = patient_num;
    // this.setState({ patient_num });
  };

  private onInDateChange = (date: Date) => {
    this._pInfo.in_date = UTILS.getFormattedDate(date, 1);
  };
  private onOutDateChange = (date: Date) => {
    this._pInfo.out_date = UTILS.getFormattedDate(date, 1);
  };
  private onDiagDateChange = (date: Date) => {
    this._pInfo.diagnostic_time = UTILS.getFormattedDate(date, 1);
  };
  private onDiabetesChange = (index: number) => {
    this._pInfo.diabetes_id = index;
  };
  private onIsMarriedChange = (index: number, checked: boolean) => {
    const is_married = checked ? index : undefined;
    this._pInfo.is_married = is_married;
    this.setState({ is_married: is_married });
  };
  private onHasChildChange = (index: number, checked: boolean) => {
    const has_child = checked ? index : undefined;
    this._pInfo.has_child = has_child;
    this.setState({ has_child: has_child });
  };
  private onSmokingChange = (index: number, checked: boolean) => {
    const smoking = checked ? index : undefined;
    this._pInfo.smoking = smoking;
    this.setState({ smoking: smoking });
  };
  private onDrinkingChange = (index: number, checked: boolean) => {
    const drinking = checked ? index : undefined;
    this._pInfo.drinking = drinking;
    this.setState({ drinking: drinking });
  };
  private onInsuranceKindChange = (index: number, checked: boolean) => {
    const isurance_kind = checked ? index : undefined;
    this._pInfo.has_medical_insurance = isurance_kind;
    this.setState({ isurance_kind });
  };
  private onIdCardChange = (value: string) => {
    this._pInfo.id_card_number = value;
    // this.setState({ id_card: value });
  };
  private onFamilyMobileChange = (value: string) => {
    this._pInfo.family_contact = value;
    // this.setState({ family_mobile: value });
  };
  private onInsuranceCardChange = (value: string) => {
    this._pInfo.medical_insurance_number = value;
    // this.setState({ isurance_card: value });
  };
  private onNoteChange = (value: string) => {
    this._pInfo.note = value;
    // this.setState({ note: value });
  };
  private onAddressChange = (value: string) => {
    this._pInfo.address = value;
    // this.setState({ address: value });
  };
  private getFullDoctors = (departIdx: number) => {
    return [{ id: undefined, name: '无' }, ...GLOBAL.totalDepartments[departIdx].doctors];
  };
  private getFullNurses = departIdx => {
    return [{ id: undefined, name: '无' }, ...GLOBAL.totalDepartments[departIdx].nurses];
  };
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
        keyboardShouldPersistTaps='always'
        keyboardDismissMode={'interactive'}
      >
        <View style={themedStyle.body}>
          <View style={themedStyle.section}>
            <Text style={{ color: 'red' }}>*</Text>
            <EditInput editable={this.props.kind === MANAGE_KIND.IN
              || this.props.kind === MANAGE_KIND.OUT ? false : true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_name}
              onChangeText={this.onPatientNameChange}
              defaultValue={this.state.name}
              placeholder={Strings.message.input_patientName}
            />
          </View>
          <View style={themedStyle.section}>
            <Text style={{ color: 'blue' }}>*</Text>
            <EditInput
              // editable={this.props.kind === MANAGE_KIND.ADD ? true : false}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_handphone}
              defaultValue={this.state.mobile}
              placeholder={Strings.message.input_patientMobile}
              onChangeText={this.onMobileChange}
              keyboardType={'numeric'}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.common.str_sex} :`}</Text>
              <View style={{ width: 10 }} />
              <RadioGroup onChange={this.onSexChange}
                selectedIndex={this.state.sex ? 1 : 0}
                style={themedStyle.radioGroup}
              >
                <Radio disabled={this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                  ? true
                  : false
                }
                  text={Strings.common.str_male}
                  style={themedStyle.radioItem}
                  textStyle={commonStyles.textSubtitle}
                />
                <Radio disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                  text={Strings.common.str_female}
                  style={themedStyle.radioItem}
                  textStyle={commonStyles.textSubtitle}
                />
              </RadioGroup>
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput editable={this.props.kind === MANAGE_KIND.OUT ? false : true}
              style={themedStyle.profileSetting}
              placeholder={Strings.message.input_age}
              keyboardType={'numeric'}
              hint={Strings.patient.list_nianling}
              onChangeText={this.onAgeChange}
              defaultValue={this.state.age ? this.state.age.toString() : undefined}
            />
          </View>
          <View style={themedStyle.section}>
            <Text style={{ color: 'red' }}>*</Text>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.patient.list_keshi} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu name={'MENU_DEPARTMENT'}
                disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                // disabled={this.props.kind === MANAGE_KIND.OUT ||
                //   (this.props.kind === MANAGE_KIND.IN && !GLOBAL.curUser.is_admin) ? true : false
                // }
                data={UTILS.getSingleArrFromMultiArr(GLOBAL.totalDepartments, 'name')}
                curItemIndex={this.state.depart_index}
                onMenuItemSelect={this.onDepartChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}
              >{`${Strings.patient.list_zerenyisheng} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu name={'MENU_DOCTOTS'}
                disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                data={UTILS.getSingleArrFromMultiArr(
                  this.getFullDoctors(this.state.depart_index),
                  'name'
                )}
                curItemIndex={UTILS.getIndexFromId(
                  this.getFullDoctors(this.state.depart_index),
                  this._pInfo.doctor_id
                )}
                cols={2}
                onMenuItemSelect={this.onDoctorChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.patient.list_zerenhushi} :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu name={'MENU_NURSES'}
                disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                data={UTILS.getSingleArrFromMultiArr(
                  this.getFullNurses(this.state.depart_index),
                  'name'
                )}
                curItemIndex={UTILS.getIndexFromId(
                  this.getFullNurses(this.state.depart_index),
                  this._pInfo.nurse_id
                )}
                onMenuItemSelect={this.onNurseChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <Text style={{ color: 'red' }}>*</Text>
            <EditInput editable={this.props.kind === MANAGE_KIND.OUT ? false : true}
              style={themedStyle.profileSetting}
              placeholder={Strings.message.input_bedNumber}
              keyboardType={'numeric'}
              hint={Strings.patient.list_chuanghao}
              onChangeText={this.onBedNumChange}
              defaultValue={this.state.bed_num ? this.state.bed_num.toString() : undefined}
            />
          </View>
          <View style={themedStyle.section}>
            <Text style={{ color: 'red' }}>*</Text>
            <EditInput editable={this.props.kind === MANAGE_KIND.OUT ? false : true}
              style={themedStyle.profileSetting}
              placeholder={Strings.message.input_patientNumber}
              keyboardType={'numeric'}
              hint={Strings.patient.list_zhuyuanhao}
              onChangeText={this.onPatientNumChange}
              defaultValue={this.state.patient_num ? this.state.patient_num.toString() : undefined}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text style={commonStyles.sectionText}
              >{`${Strings.patient.list_zhuyuanriqi} :`}</Text>
              <MyDatePicker mode={'datetime'}
                format={'YYYY-MM-DD HH:mm:ss'}
                disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                onDateChange={date => this.onInDateChange(date)}
                date={
                  this._pInfo.in_date ? UTILS.createDate(this._pInfo.in_date)
                    : UTILS.createDate(undefined)
                }
                maxDate={new Date()}
                textColor={themes['App Theme']['color-basic-900']}
              />
            </View>
          </View>
          {(this.props.kind === MANAGE_KIND.OUT || !this._pInfo.is_in) && (
            <View style={themedStyle.section}>
              <View style={themedStyle.sectionDatePickerContent}>
                <Text style={commonStyles.sectionText}
                >{`${Strings.patient.list_chuyuanriqi} :`}</Text>
                <MyDatePicker mode={'datetime'} format={'YYYY-MM-DD HH:mm:ss'}
                  disabled={this.props.kind === MANAGE_KIND.OUT ? false : true}
                  hideText={this._pInfo.out_date ? false : true}
                  onDateChange={date => this.onOutDateChange(date)}
                  date={
                    this._pInfo.out_date ? UTILS.createDate(this._pInfo.out_date)
                      : UTILS.createDate(undefined)
                  }
                  maxDate={new Date()}
                  textColor={themes['App Theme']['color-basic-900']}
                />
                {this.props.kind === MANAGE_KIND.OUT && (
                  <Text appearance='p1' style={{ color: 'red' }}>
                    (确认出院日期)
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text style={commonStyles.sectionText}
              >{`${Strings.patient.list_zhenduanshijian} :`}</Text>
              <MyDatePicker mode={'datetime'}
                format={'YYYY-MM-DD HH:mm:ss'}
                disabled={this.props.kind === MANAGE_KIND.OUT ? true : false}
                onDateChange={date => this.onDiagDateChange(date)}
                date={this._pInfo.diagnostic_time
                  ? UTILS.createDate(this._pInfo.diagnostic_time)
                  : UTILS.createDate(undefined)
                }
                maxDate={new Date()}
                textColor={themes['App Theme']['color-basic-900']}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`糖尿病类型 :`}</Text>
              <View style={{ width: 10 }} />
              <SlideMenu name={'MENU_DIABETES'}
                data={GLOBAL.MENUDATA_DIABETES}
                curItemIndex={this._pInfo.diabetes_id}
                onMenuItemSelect={this.onDiabetesChange}
                textStyle={commonStyles.slideMenuText_1}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`婚姻状况 :`}</Text>
              <View style={{ width: 10 }} />
              <Radio checked={this.state.is_married === 0}
                disabled={this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                  ? true
                  : false
                }
                onChange={checked => this.onIsMarriedChange(0, checked)}
                text={'未婚'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
              <Radio checked={this.state.is_married === 1}
                disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                onChange={checked => this.onIsMarriedChange(1, checked)}
                text={'已婚'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`家属史 :    `}</Text>
              <View style={{ width: 10 }} />
              <Radio onChange={checked => this.onHasChildChange(0, checked)}
                checked={this.state.has_child === 0}
                disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                text={'无'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
              <Radio checked={this.state.has_child === 1}
                onChange={checked => this.onHasChildChange(1, checked)}
                disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                text={'有'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`是否吸烟 :`}</Text>
              <View style={{ width: 10 }} />
              <Radio checked={this.state.smoking === 0}
                onChange={checked => this.onSmokingChange(0, checked)}
                disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                text={'否'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
              <Radio checked={this.state.smoking === 1}
                onChange={checked => this.onSmokingChange(1, checked)}
                disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                text={'是'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`是否饮酒 :`}</Text>
              <View style={{ width: 10 }} />
              <Radio checked={this.state.drinking === 0}
                onChange={checked => this.onDrinkingChange(0, checked)}
                disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                text={'否'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
              <Radio checked={this.state.drinking === 1}
                onChange={checked => this.onDrinkingChange(1, checked)}
                disabled={
                  this.props.kind === MANAGE_KIND.IN || this.props.kind === MANAGE_KIND.OUT
                    ? true
                    : false
                }
                text={'是'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput editable={this.props.kind === MANAGE_KIND.ADD ? true : false}
              style={themedStyle.profileSetting}
              hint={'身份证'}
              defaultValue={this.state.id_card}
              onChangeText={this.onIdCardChange}
              keyboardType={'numeric'}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput style={themedStyle.profileSetting}
              hint={'家属手机'}
              defaultValue={this.state.family_mobile}
              onChangeText={this.onFamilyMobileChange}
              keyboardType={'numeric'}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`医保类型 :`}</Text>
              <View style={{ width: 10 }} />
              <Radio checked={this.state.isurance_kind === 0}
                onChange={checked => this.onInsuranceKindChange(0, checked)}
                text={'医保'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
              <Radio checked={this.state.isurance_kind === 1}
                onChange={checked => this.onInsuranceKindChange(1, checked)}
                text={'自费'}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput style={themedStyle.profileSetting}
              hint={'医保卡'}
              defaultValue={this.state.isurance_card}
              onChangeText={this.onInsuranceCardChange}
              keyboardType={'numeric'}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput style={themedStyle.profileSetting}
              hint={'备注'}
              defaultValue={this.state.note}
              onChangeText={this.onNoteChange}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput style={themedStyle.profileSetting}
              hint={'地址'}
              defaultValue={this.state.address}
              onChangeText={this.onAddressChange}
            />
          </View>
        </View>
      </ContainerView>
    );
  }
}

interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (props?: SectionProps): React.ReactElement<TouchableOpacityProps> => {
  return <TouchableOpacity activeOpacity={0.65} {...props} />;
};

export const InhospitalManage = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1']
  },
  body: {
    paddingBottom: 6
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme['border-basic-color-2']
  },
  sectionDatePickerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 10,
    paddingVertical: 0
  },
  sectionCategoryPickerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 10,
    paddingVertical: 8
  },
  radioGroup: {
    flexDirection: 'row',
    paddingVertical: 6
  }
}));
