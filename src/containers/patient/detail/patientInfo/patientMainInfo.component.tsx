import Strings from "@src/assets/strings";
import React from "react";
import { View, TouchableOpacity, TouchableOpacityProps } from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Toggle, Text, Button } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle } from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import GLOBAL from "@src/core/globals";
import { PatientModel } from "@src/core/model";

interface ComponentProps {
  data: PatientModel;
  onItemPress: (index: number) => void;
}
interface State {
  curHospitalMode: number;
}
type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  public state: State = {
    curHospitalMode: GLOBAL.curHospitalMode
  };
  public render(): React.ReactNode {
    const { themedStyle, data } = this.props;

    return (
      <ContainerView style={themedStyle.container}>
        <View style={themedStyle.infoSection}>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(0)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_name}
              value={data.name && data.name}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(1)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_sex}
              value={data.gender == 0 ? Strings.common.str_male : Strings.common.str_female}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(2)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_age}
              value={`${data.age}`}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(3)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.list_chuanghao}
              value={data.bed_number && data.bed_number.toString()}
            />
          </Section>

          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(3)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.list_zhenduanshijian}
              value={data.diagnostic_time}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={
                data.is_in ? Strings.patient.list_zhuyuanriqi : Strings.patient.list_chuyuanriqi
              }
              value={data.is_in ? data.in_date : data.out_date}
            />
          </Section>

          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(3)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.list_zhuyuanhao}
              value={data.patient_number && data.patient_number.toString()}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.list_zerenyisheng}
              value={data.doctor_name}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.list_zerenhushi}
              value={data.nurse_name}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.str_diabetesType}
              value={GLOBAL.MENUDATA_DIABETES[data.diabetes_id]}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.str_isMarried}
              value={data.is_married === 1 ? "已婚" : data.is_married === 0 ? "未婚" : ""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.str_hasFamily}
              value={data.has_child === 1 ? "有" : data.has_child === 0 ? "无" : ""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.str_smoking}
              value={data.smoking === 1 ? "是" : data.smoking === 0 ? "否" : ""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.str_drinking}
              value={data.drinking === 1 ? "是" : data.drinking === 0 ? "否" : ""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.patient.str_idCard}
              value={data.id_card_number}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={"家属手机"}
              value={data.family_contact}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={"医保类型"}
              value={
                data.has_medical_insurance === 0
                  ? "医保"
                  : data.has_medical_insurance === 1
                  ? "自费"
                  : ""
              }
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={"医保卡"}
              value={data.medical_insurance_number}
            />
          </Section>

          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={"备注"}
              value={data.note}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={"地址"}
              value={data.address}
            />
          </Section>
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

export const PatientMainInfo = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  },
  section: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"]
  }
}));
