import Strings from "@src/assets/strings";
import React, { Component } from "react";
import {

  View
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { SaveIconOutline } from "@src/assets/icons";
import { TaskFilter } from "./taskFilter.component";
import GLOBAL from "@src/core/globals";
import commonStyles from "@src/containers/styles/common";
import { DepartmentModel, ObjectModel, RequestPatientModel } from "@src/core/model";
import * as UTILS from "@src/core/app_utils";
import { database } from "@src/core/utils/database";

interface State {
  isLoading: boolean;
  isModalVisible: boolean;
  // keyword: string;
  patients: ObjectModel[];
}
export class TaskFilterScreen extends React.Component<NavigationScreenProps, State> {
  private _departments: DepartmentModel[];
  private _areas: ObjectModel[];
  private _filterPatientIds: number[];
  private _reqParam: RequestPatientModel;
  // private _keyword: string;
  private _isFilterMyCharge: boolean;
  private _isFilterPatients: boolean;

  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = {
      isLoading: true,
      isModalVisible: false,
      patients: []
    };
  }
  componentWillMount() {
    this.setNavigationParams();

    if (GLOBAL.curUser.job_position_level <= 4) {
      // 관리자권한이 없는 어카운트 4:부원장이상----
      /*
      GLOBAL.totalDepartments.forEach(e => {
        if (e.id === GLOBAL.curUser.department_id) {
          this._departments = [{ ...e }];
        }
      });
      */
      this._departments = GLOBAL.totalDepartments.map(object => ({ ...object }));
    } else {
      // 전체과실 다 보기
      this._departments = GLOBAL.totalDepartments.map(object => ({ ...object })); // GLOBAL.totalDepartments.map(val => {...val}});
    }
    this._areas = [{ id: 0, name: Strings.common.str_selectAll }];
    this._filterPatientIds = Array.from(GLOBAL.filterPaitentIds);
    this._keyword = GLOBAL.keyWord;
    this._isFilterMyCharge = GLOBAL.isFilterMyCharge;
    this._isFilterPatients = GLOBAL.isFilterPatients;

    this.setReqParams();
  }

  componentDidMount() {
    this.updatePatients();
  }

  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    this.props.navigation.setParams({
      onRightPress,
      rightIcon: SaveIconOutline
    });
  }

  onTopRightPress = () => {
    let selectedDepartmentCount = 0;
    this._departments.forEach(d => {
      if (d.checked) selectedDepartmentCount++;
    });
    if (selectedDepartmentCount === 0) {
      UTILS.showToast("至少选择一个科室");
      return;
    }

    GLOBAL.totalDepartments = this._departments.map(object => ({ ...object }));
    // console.log(this._filterPatientIds);
    // console.log(this._isFilterPatients);
    GLOBAL.filterPaitentIds = Array.from(this._filterPatientIds);
    // console.log(GLOBAL.filterPaitentIds);
    GLOBAL.isFilterMyCharge = this._isFilterMyCharge;
    GLOBAL.isFilterPatients = this._isFilterPatients;
    GLOBAL.keyWord = this._keyword;


    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onGoBack({ beUpdate: true });
  };
  onTopLeftPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
    // navigation.state.params.onGoBack({ beUpdate: true });
  };
  private setReqParams = () => {
    this._reqParam = { patient: { is_in: 1 }, departments: [] };
    this._departments.forEach(d => {
      if (d.checked) this._reqParam.departments.push(d.id);
    });
  };
  private onItemSelectAll = (kind: number, checked: boolean) => {
    if (kind == 0) {
      this._departments.forEach(d => (d.checked = checked));
      this.updatePatients();
    }
  };
  private onItemSelect = (kind: number, index: number, checked: boolean) => {
    if (kind === 0) {
      this._departments[index].checked = checked;

      this.updatePatients();
    } else if (kind === 1) {
      this._areas[index].checked = checked;
    }
  };

  private onPatientsItemSelect = (index: number, pid: number, checked: boolean) => {
    if (checked) {
      if (this._filterPatientIds.find(id => id === pid) === undefined) {
        this._filterPatientIds.push(pid);
      }
    } else {
      this._filterPatientIds = this._filterPatientIds
        .map(id => {
          if (id != pid) return id;
        })
        .filter(e => e);
    }
  };
  private updatePatients = () => {
    this.setState({ isLoading: true });
    this.setReqParams();
    // const dataHelper = GLOBAL.isOffline ? database.patientsHelper : httpHelper;
    const dataHelper = database.patientsHelper;
    dataHelper
      .downloadPatients(this._reqParam)
      .then(responseJson => {
        const patients = responseJson.result;
        if (patients) {
          this.setState({
            isLoading: false,
            patients: patients.map(p => {
              return {
                id: p.id,
                name: `${p.bed_number}床 ${p.name}`,
                checked: this._filterPatientIds.find(id => id === p.id) === undefined ? false : true
              };
            })
          });
        } else {
          this.setState({ patients: [], isLoading: false });
        }
      })
      .catch(exception => {
        this.setState({ isLoading: false });
      });
  };
  private onFilterOptionChange = (patientsChecked: boolean, chargeChecked: boolean) => {
    this._isFilterMyCharge = chargeChecked;
    this._isFilterPatients = patientsChecked;
  };
  private onUpdatePatients = (pats: ObjectModel[], keyword: string) => {
    const patients = pats.filter((_it) => _it.checked);
    this._keyword = keyword;
    if (patients.length > 0) {
      this._isFilterPatients = true;
      const filterPatientIds = patients.reduce((rs, _it) => {
        rs.push(_it.id);
        return rs;
      }, []);
      // console.log(filterPatientIds);
      this._filterPatientIds = Array.from(filterPatientIds);

    } else {
      this._isFilterPatients = false;
      this._filterPatientIds = [];
      // console.log(this._filterPatientIds);
    }
  }
  render() {
    return (
      <View style={commonStyles.container}>
        <TaskFilter
          showPatients={this.props.navigation.state.params.kind === 1}
          keyword={this._keyword}
          isLoading={this.state.isLoading}
          onItemSelect={this.onItemSelect}
          onItemSelectAll={this.onItemSelectAll}
          departments={this._departments}
          areas={this._areas}
          patients={this.state.patients}
          onPatientsItemSelect={this.onPatientsItemSelect}
          checkedBed={this._isFilterPatients}
          checkedCharge={this._isFilterMyCharge}
          onUpdatePatients={this.onUpdatePatients}
          onFilterOptionChange={this.onFilterOptionChange}
        />
      </View>
    );
  }
}
