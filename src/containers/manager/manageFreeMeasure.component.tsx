import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  TouchableOpacityProps,
  DatePickerAndroid,
 } from 'react-native';
import {
  ThemeType,
  withStyles,
  ThemedComponentProps,
} from '@src/core/react-native-ui-kitten/theme';
import {
  Toggle,
  Text,
  Button,
} from '@src/core/react-native-ui-kitten/ui';
import {
  ContainerView,
  textStyle,
} from '@src/components/common';
interface ComponentProps {
  soundEnabled: boolean;
  onEditProfilePress: () => void;
  onChangePasswordPress: () => void;
  onNotificationPress: () => void;
  onPrivacyPress: () => void;
  onSoundEnabledValueChange: (value: boolean) => void;
  onBloodSugarPress: () => void;
}
import { StyleSheet, View} from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import {MyDatePicker} from '@src/components/common';

export type PortalProps = ThemedComponentProps & ComponentProps;

class PortalComponent extends React.Component<PortalProps> {
  constructor(props) {
    super(props);
    this.state = {
      tableHead: ['识别号', '姓名', '血糖值', '监测时间', '监测人'],
      widthArr: [80, 80, 60, 200, 80],
      date: "15-05-2019",
    }
  }
  private onEditProfilePress = () => {
    // this.props.onEditProfilePress();
  };

  private onChangePasswordPress = () => {
    this.props.onChangePasswordPress();
  };

  private onSoundEnabledPress = () => {
    const { soundEnabled } = this.props;
    this.onSoundEnabledChange(!soundEnabled);
  };

  private onSoundEnabledChange = (value: boolean) => {
    this.props.onSoundEnabledValueChange(value);
  };

  private onBloodSugarPress = () => {
    this.props.onBloodSugarPress();
  };

  public render() {
    const state = this.state;

    const rowdata = ['321111', '哈哈哈', '23.0', '2019-09-09 20:21:21', '壹亿壹'];
    const tableData = [];
    for (let i = 0; i < 30; i += 1) {
      // const newdata = [`${i+1}`, ...rowdata,]
      // tableData.push(newdata);
      tableData.push(rowdata);
    }

    const { themedStyle } = this.props;
    return (
      <View style={themedStyle.container} >
        <View style={themedStyle.toolbar}>
          <MyDatePicker/>
        </View>
        <ScrollView horizontal={true}>
          <View>
            <Table borderStyle={{borderColor: '#C1C0B9'}}>
              <Row data={state.tableHead} widthArr={state.widthArr} style={themedStyle.header} textStyle={themedStyle.text}/>
            </Table>
            <ScrollView style={themedStyle.dataWrapper}>
              <Table borderStyle={{borderColor: '#C1C0B9'}}>
                {
                  tableData.map((rowData, index) => (
                    <Row
                      key={index}
                      data={rowData}
                      widthArr={state.widthArr}
                      style={[themedStyle.row, index % 2 && {backgroundColor: '#F7F6E7'}]}
                      textStyle={themedStyle.text}
                    />
                  ))
                }
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    )
  }
}

interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (props?: SectionProps): React.ReactElement<TouchableOpacityProps> => {
  return (
    <TouchableOpacity
      activeOpacity={0.65}
      {...props}
    />
  );
};

export const ManageFreeMeasure = withStyles(PortalComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#fff'
  },
  header: {
    paddingTop: 10,
    height: 50,
    backgroundColor: theme['background-basic-color-2'],
  },
  text: {
    textAlign: 'center',
    fontWeight: '100'
  },
  dataWrapper: {
    marginTop: -1
  },
  row: {
    height: 40,
    backgroundColor: 'white',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
}));
