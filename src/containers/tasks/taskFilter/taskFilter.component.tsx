import Strings from "@src/assets/strings";
import React from "react";
import { View, Alert, Dimensions, FlatList, ToastAndroid, TextInput, TouchableOpacity } from "react-native";
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Radio, Text, Button } from "@src/core/react-native-ui-kitten/ui";
import { SearchIconFill } from "@src/assets/icons";
import commonStyles from "@src/containers/styles/common";
import { MyControlTab, textStyle } from "@src/components/common";
import { ObjectModel, DepartmentModel, TaskDataModel } from "@src/core/model";
import { FilterListItem } from "./filterListItem.component";
import * as UTILS from "@src/core/app_utils";
import { themes } from "@src/core/themes";

const screenWidth = Dimensions.get("window").width;

interface ComponentProps {
  showPatients: boolean;
  isLoading: boolean;
  departments: DepartmentModel[];
  areas: ObjectModel[];
  onItemSelect?: (kind: number, index: number, checked: boolean) => void;
  onItemSelectAll?: (kind: number, checked: boolean) => void;
  onPatientsItemSelect: (index: number, id: number, checked: boolean) => void;
  patients: ObjectModel[];
  onUpdatePatients: (patients: ObjectModel[], keyword: string) => void;
  checkedBed: boolean;
  checkedCharge: boolean;
  keyword: string;
  onFilterOptionChange: (patientsChecked: boolean, chargeChecked: boolean) => void;
}
interface State {
  tabIndex: number;
  checkedBed: boolean;
  checkedCharge: boolean;
  keyword: string;
  patients: ObjectModel[];
  selectedPatientsCount: number;
}
type Props = ThemedComponentProps & ComponentProps;

class TasksComponent extends React.Component<Props, State> {
  private _departmentAll: DepartmentModel;
  private _keyword: string;
  constructor(props: Props) {
    super(props);
    this._departmentAll = { id: 0, name: "全选", checked: false };
    // this._keyword = props.keyword;
    this.state = {
      tabIndex: 0,
      checkedBed: props.checkedBed,
      checkedCharge: props.checkedCharge,
      patients: this.props.patients,
      keyword: this.props.keyword,
      selectedPatientsCount: 0
    };
  }
  componentDidMount() {
    UTILS.showToast(Strings.message.tip_save, ToastAndroid.LONG);
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.patients) {
      // this._keyword = nextProps.keyword;
      this.setState(
        {
          patients: nextProps.patients
        },
        () => {
          this.setState({ selectedPatientsCount: this.getCheckedCount() });
        }
      );
    }
  }
  private onTabSelect = (tabIndex: number) => {
    this.setState({ tabIndex });
  };
  private onRadioChange = (index: number, selected: boolean) => {
    if (index === 0) {
      if (selected) {
        this.setState({ checkedBed: true, checkedCharge: false });
        this.props.onFilterOptionChange(true, false);
      } else {
        this.setState({ checkedBed: false });
        this.props.onFilterOptionChange(false, false);
      }
    } else {
      if (selected) {
        this.setState({ checkedBed: false, checkedCharge: true });
        this.props.onFilterOptionChange(false, true);
      } else {
        this.setState({ checkedCharge: false });
        this.props.onFilterOptionChange(false, false);
      }
    }
  };
  private onItemPress = (index: number, checked: boolean) => {
    if (index === 0) {
      this.props.onItemSelectAll(this.state.tabIndex, checked);
    } else {
      index--;
      this.props.onItemSelect(this.state.tabIndex, index, checked);
    }
  };
  private onPatientsItemPress = (index: number, checked: boolean) => {
    const modifier = checked ? 1 : -1;
    const patients = this.state.patients;
    patients[index].checked = checked;
    const selectedPatientsCount = this.state.patients.filter((p, _id) => p.checked).length;
    this.setState({ selectedPatientsCount: selectedPatientsCount, patients: patients });

    // this.state.patients[index].checked = true;
    this.props.onPatientsItemSelect(index, this.state.patients[index].id, checked);
  };
  private onPatientsClearAll = () => {
    const patients = this.state.patients;
    const nwPatients = patients.map((p, _id) => {
      p.checked = false;
      return p;
    })
    // this.setState({
    //   patients: this.state.patients.map((p, index) => {
    //     p.checked = false;
    //     this.props.onPatientsItemSelect(index, p.id, p.checked);
    //     return p;
    //   })
    // });

    this.setState({
      patients: nwPatients,
      keyword: '',
      selectedPatientsCount: 0
    });
    // this._keyword = '';
    this.props.onUpdatePatients(nwPatients, this.state.keyword);
  };
  private onPatientReverseSelect = () => {
    const patients = this.state.patients;
    const selectecPatientsCount = patients.length - patients.filter((item, _id) => item.checked === true).length;
    const nwPatients = patients.map((p, _id) => {
      p.checked = p.checked ? false : true;
      return p;
    })
    this.setState({
      selectedPatientsCount: selectecPatientsCount,
      patients: nwPatients
    });
    this.props.onUpdatePatients(nwPatients, this.state.keyword);
    // this.setState({
    //   selectedPatientsCount: this.state.patients.length - this.state.selectedPatientsCount
    // });

    // this.setState({
    //   patients: this.state.patients.map((p, index) => {
    //     p.checked = !p.checked;
    //     this.props.onPatientsItemSelect(index, p.id, p.checked);
    //     return p;
    //   })
    // });
  };
  private getCheckedCount = () => {
    let count = 0;
    this.state.patients.forEach(p => {
      if (p.checked) count++;
    });
    return count;
  };
  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={commonStyles.toolbarContainer}>
        <MyControlTab
          values={[Strings.patient.str_filterDepart, Strings.patient.str_filterArea]}
          tabIndex={0}
          onTabItemPress={this.onTabSelect}
          containerStyle={themedStyle.tabContainer}
          tabsContainerStyle={themedStyle.tabsContainer}
        />
      </View>
    );
  };
  private render2Toolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={themedStyle.toolbar2Container}>
        <View style={[themedStyle.toolbar2Row, { justifyContent: "center" }]}>
          {this.props.showPatients && (
            <Radio
              text={Strings.patient.str_filterBed}
              style={themedStyle.radioItem}
              textStyle={themedStyle.radioText}
              checked={this.state.checkedBed}
              onChange={selected => this.onRadioChange(0, selected)}
            />
          )}
          <View style={{ width: 30 }} />
          <Radio
            text={Strings.patient.str_filterChargePatient}
            style={themedStyle.radioItem}
            textStyle={themedStyle.radioText}
            checked={this.state.checkedCharge}
            onChange={selected => this.onRadioChange(1, selected)}
          />
        </View>
        {this.props.showPatients && this.state.tabIndex === 0 && this.state.checkedBed && (
          <View style={themedStyle.toolbar2Row}>
            <Text style={themedStyle.toolbarText}
            >{`当前已选中${this.state.selectedPatientsCount}人`}</Text>
            <View style={{ flexDirection: "row" }}>
              <Button appearance="ghost" onPress={this.onPatientsClearAll}>
                清空
              </Button>
              <Button appearance="ghost" onPress={this.onPatientReverseSelect}>
                反选
              </Button>
            </View>
          </View>
        )}
      </View>
    );
  };
  private renderPatientsItem = (item: ObjectModel, index: number) => {
    return (
      <FilterListItem
        index={index}
        style={this.props.themedStyle.item}
        data={item}
        onItemPress={this.onPatientsItemPress}
      />
    );
  };
  private renderItem = (item: ObjectModel, index: number) => {
    return (
      <FilterListItem
        index={index}
        style={this.props.themedStyle.item}
        data={item}
        onItemPress={this.onItemPress}
      />
    );
  };
  private onKeywordTextChange = (value: string) => {
    // this._keyword = value;
    const patients = this.state.patients;
    const nwPatients = patients.map((p, _id) => {
      p.checked = p.name.indexOf(value) > -1 && value.length > 0;
      return p;
    })
    // if (this._keyword.length > 0) {
      this.onRadioChange(0, true);
      this.setState({
        patients: nwPatients,
        keyword: value,
        selectedPatientsCount: nwPatients.filter(_it => _it.checked).length
      });
    // }


    this.props.onUpdatePatients(nwPatients, this.state.keyword);
  }
  private selectedDepartmentCount = () => {
    let selectedCount = 0;
    this.props.departments.forEach(d => {
      if (d.checked) {
        selectedCount++;
      }
    });
    return selectedCount;
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    let listData: ObjectModel[];
    this._departmentAll.checked = this.selectedDepartmentCount() === this.props.departments.length;
    if (this.state.tabIndex === 0) listData = [this._departmentAll, ...this.props.departments];
    else listData = this.props.areas;

    const patients = this.selectedDepartmentCount() === 0 ? [] : this.state.patients;
    return (
      <View style={{ flex: 1 }}>
        {this.renderToolbar()}
        <View style={{ maxHeight: 400 }}>
          <FlatList
            contentContainerStyle={themedStyle.contentContainer}
            numColumns={2}
            data={listData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index, separators }) => this.renderItem(item, index)}
          />
        </View>
        <View style={[commonStyles.toolbarContainer, { height: 50 }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <SearchIconFill
              width={28}
              height={28}
              tintColor={themes["App Theme"]["mycolor-lightgray"]}
            />
            <TextInput
              style={{
                fontSize: 16,
                width: 250,
                borderBottomWidth: 0.5,
                borderColor: themes["App Theme"]["mycolor-lightgray"]
              }}
              value={this._keyword}
              onChangeText={this.onKeywordTextChange}
              placeholder={"请输入床号"}
            />
          </View>
        </View>
        {this.render2Toolbar()}
        {this.state.checkedBed && this.state.tabIndex === 0 && this.props.showPatients && (
          <View style={{ flex: 1 }}>
            <FlatList
              contentContainerStyle={themedStyle.contentContainer}
              numColumns={2}
              data={patients}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index, separators }) => this.renderPatientsItem(item, index)}
            />
          </View>
        )}
      </View>
    );
  }
}

export const TaskFilter = withStyles(TasksComponent, (theme: ThemeType) => ({
  contentContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0
  },
  tabsContainer: {
    flex: 1,
    backgroundColor: theme["mycolor-background"]
  },
  tabContainer: {
    flex: 1,
    marginVertical: 6,
    marginHorizontal: 0,
    backgroundColor: theme["mycolor-background"]
  },
  toolbar2Container: {
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderBottomWidth: 1,
    borderColor: theme["mycolor-lightgray"], // themes["App Theme"]["color-primary-300"],
    backgroundColor: "white", // themes["App Theme"]["color-primary-500"],
    width: "100%"
  },
  toolbar2Row: {
    flexDirection: "row",
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 3,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: theme["mycolor-lightgray"], // themes["App Theme"]["color-primary-300"],
    backgroundColor: "white", // themes["App Theme"]["color-primary-500"],
    height: 46,
    width: "100%"
  },
  toolbarButton: {
    borderWidth: 0.5,
    borderRadius: 3,
    marginHorizontal: 0
  },
  radioItem: { marginRight: 10 },
  radioText: { color: theme["color-primary-500"], fontSize: 16 },
  toolbarText: {
    ...textStyle.paragraph,
    fontSize: 16,
    color: theme["color-basic-600"]
  },
  item: {
    flex: 1,
    maxWidth: screenWidth / 2,
    marginHorizontal: 1,
    marginVertical: 1
  }
}));
