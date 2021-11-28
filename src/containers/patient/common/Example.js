import Strings from '@src/assets/strings'
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Menu, {
  MenuProvider,
  MenuTrigger,
  MenuOptions,
  MenuOption,
  renderers,
} from 'react-native-popup-menu';
import {
  ArrowIosBackFill,
  SearchIconOutline,
  MoreVerticalIconFill,
  Icon,
} from '@src/assets/icons';
import { TableDemo } from '@src/containers/patient/common/table.component';

let unique = 0;
const { SlideInMenu } = renderers;

export default class Example extends Component {

  constructor(props, ctx) {
    super(props, ctx);
    this.state = { log: [] };
  }

  selectNumber(value) {
    this.addLog(`selecting number: ${value}`);
  }

  selectOptionType(value) {
    const v = typeof value === 'object' ? JSON.stringify(value) : value;
    this.addLog(`selecting type: ${v}`);
    return value !== 'Do not close';
  }

  addLog(value) {
    this.setState({
      log: [...this.state.log, {
        value,
        id: ++unique,
      }],
    });
  }

  toggleHighlight(id) {
    const log = this.state.log.map(l => {
      if (l.id === id) {
        return Object.assign({}, l, { highlighted: !l.highlighted });
      }
      return l;
    })
    this.setState({ log });
  }

  deleteLogItem(id) {
    const log = this.state.log.filter(l => l.id !== id);
    this.setState({ log });
  }
  render() {
    return (
      <MenuProvider style={{ flex: 1 }}>
        <View style={styles.container}>

          <View style={styles.topbar}>
            <Menu name="numbers" renderer={SlideInMenu} onSelect={value => this.selectNumber(value)}>
              <MenuTrigger style={styles.trigger}>
                <Text style={[styles.text, styles.triggerText]}>SlideMenu</Text>
              </MenuTrigger>
              <MenuOptions customStyles={{ optionText: [styles.text, styles.slideInOption] }}>
                <MenuOption value={1} text='Option one' />
                <MenuOption value={2} text='Option two' />
                <MenuOption value={3} text='Option three' />
                <MenuOption value={4} text='Option four' />
                {null /* conditional not rendered option */}
                <MenuOption value={5} text='Option five' />
              </MenuOptions>
            </Menu>
            <View style={{ flex: 1, alignItems: 'center', }}><Text style={[styles.text, styles.triggerText]}>患者信息</Text></View>
            <Menu name="types" onSelect={(value) => this.props.navigation.navigate(value)}
              onBackdropPress={() => this.addLog('menu will be closed by backdrop')}
              onOpen={() => this.addLog('menu is opening')}
              onClose={() => this.addLog('menu is closing')}
            >
              <MenuTrigger
                onAlternativeAction={() => this.addLog('trigger longpressed')}
                style={styles.trigger}>
                <Text style={[styles.text, styles.triggerText]}>...</Text>
              </MenuTrigger>
              <MenuOptions customStyles={{ optionText: styles.text }}>
                <MenuOption value="PatientInfo" text={Strings.patient.info_bingrenxinxi} />
                <MenuOption value="PatientDoctorsOrder" text={Strings.patient.info_yizhujilu} />
                <MenuOption value="PatientBloodSugar" text={Strings.patient.info_xuetangjilu} />
                <MenuOption value="PatientInHospital" text={Strings.patient.info_zhuyuanjilu} />
                <MenuOption value="PatientConsult" text={Strings.patient.info_huizhenjilu} />
                <MenuOption value="PatientVisit" text={Strings.patient.info_suifangjilu} />
              </MenuOptions>
            </Menu>
          </View>

          <TableDemo />
        </View>
      </MenuProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'lightgray',
  },
  topbar: {
    flexDirection: 'row',
    backgroundColor: '#1CAFF6',
    paddingTop: 15,
  },
  trigger: {
    padding: 5,
    margin: 5,
  },
  triggerText: {
    color: 'white',
  },
  disabled: {
    color: '#ccc',
  },
  divider: {
    marginVertical: 5,
    marginHorizontal: 2,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  logView: {
    flex: 1,
    flexDirection: 'column',
  },
  logItem: {
    flexDirection: 'row',
    padding: 8,
  },
  slideInOption: {
    padding: 5,
  },
  text: {
    fontSize: 18,
  },
});
