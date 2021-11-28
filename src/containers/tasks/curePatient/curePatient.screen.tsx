import React from 'react'
import { View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import * as UTILS from "@src/core/app_utils";
import { database } from "@src/core/utils/database";
import { EventRegister } from "react-native-event-listeners";
import { SearchIconOutline } from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import {
    PatientModel,
    RequestPatientModel,
    InsulinInjectActionVw
} from "@src/core/model";
import { CurePatient } from './curePatient.component'
interface State {
    isLoading: boolean;
    patient: PatientModel;
    orgInsulinCureList: InsulinInjectActionVw[];
}
export class CurePatientScreen extends React.Component<NavigationScreenProps, State> {
    private _requestParams: RequestPatientModel;
    private focusListener: any;
    private syncListener: any;
    private _cdate: string;
    private _patient: PatientModel;
    private _inject_kind: string;
    constructor(props: NavigationScreenProps) {
        super(props);
        // this._cdate = moment().toDate();
        this.state = {
            isLoading: true,
            patient: undefined,
            orgInsulinCureList: []
        }
        this._requestParams = {
            is_cure: true,
            o_doctor_id: 0,
            o_nurse_id: 0,
            patient: { o_doctor_id: 0, o_nurse_id: 0, id: 0, name: '' },
            departments: [],
            patients: []
        }
    }
    private onGoBack = (params: any) => {
        if (params.beUpdate) {
            // this._requestParams.departments = [];
            // GLOBAL.totalDepartments.forEach(e => {
            //     if (e.checked) this._requestParams.departments.push(e.id);
            // });
            // setTimeout(() => {
            //     this.updateData();
            // }, 5000);
        }
    };
    private updateData = async () => {
        this.setState({ isLoading: true });
        // const today = UTILS.getFormattedDate(this._cdate, 0);
        const params = this._requestParams;
        params.begin_time = this._cdate;
        params.inject_kind = this._inject_kind;
        params.patients = [this._patient.id];
        if (__DEV__) console.info(params);
        // params. = this._cdate;

        // console.log(hour);
        // const patients = await database.patientsHelper.getCurePatients(params);
        const inject_kind = parseInt(this._inject_kind, 0);
        // tslint:disable-next-line: max-line-length
        const cureLists = await database.insulinHelper.getInjectActionList({ hospital_id: GLOBAL.curUser.hospital_id, point_kind: inject_kind, ex_date: this._cdate, org_flag: 1, advice_id: this._patient.id, del_flag: 0 });
        this.setState({
            patient: this._patient,
            orgInsulinCureList: cureLists,
            isLoading: false
        });
        // console.log(cureLists);
    }
    componentWillUnmount() {
        this.focusListener && this.focusListener.remove();
        // this.blurListener && this.blurListener.remove();
        // careSensHelper.disconnect();
        // GLOBAL.startBackgroundJobs();
        this.syncListener && EventRegister.removeEventListener(this.syncListener);
    }
    private onChangeDate = (date: Date) => {
        /// this._cdate = date;
        this.updateData();
    }
    componentDidMount() {
        this._inject_kind = this.props.navigation.getParam("inject_kind", undefined);
        this._patient = this.props.navigation.getParam('patient', undefined);
        this._cdate = this.props.navigation.getParam('cdate', undefined);
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            this.updateData();
        });
        this.setNavigationParams();

    }
    private onRefresh = () => {
        this.setState({ isLoading: true });
        this.updateData();
    }
    private onCureFinish = (item: InsulinInjectActionVw) => {
        item.exec_flag = 1;
        item.s_flag = 1;
        item.exec_id = GLOBAL.curUser.id;
        const dbHelper = database.insulinHelper;
        dbHelper.updateInjectAction(item).then(() => {
            this.updateData();
        });
    }
    private onSelectPatient = (pItem: PatientModel) => {
        // console.log(pItem);
        GLOBAL.curPatient = pItem;
        GLOBAL.detailPatientTab = 2;
        const xpath = "Detail Main";
        this.props.navigation.navigate(xpath);
    }
    private onItemEdit = (item: InsulinInjectActionVw) => {
        const advice = item.vm_advice_obj;
        this.props.navigation.navigate("Cure EditB", {
            cure: item,
            patient: this._patient,
            onGoBack: this.onGoBack
        });
    }
    private setNavigationParams() {
        const onRightPress = this.onTopRightPress;
        this.props.navigation.setParams({
            // leftIcon: LogIconOutline,
            // onLeftPress,
            onRightPress,
            rightIcon: SearchIconOutline
        });
    }
    onTopRightPress = () => {
        this.props.navigation.navigate("Task FilterA", {
            onGoBack: this.onGoBack,
            kind: 1
        });
        // this.setState({ isModalVisible: true });
        // this.showFindModal();
    };
    onTopLeftPress = () => {

        const xpath = "Task MonitorLog";
        if (GLOBAL.curUser) {
            database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
        }
        this.props.navigation.navigate(xpath);
        // this.setState({ isModalVisible: true });
        // this.showFindModal();
    };
    render() {

        return (
            <View style={commonStyles.container}>
                <CurePatient
                    onItemSelect={this.onItemEdit}
                    isLoading={this.state.isLoading}
                    onRefreshData={this.onRefresh}
                    onChangeDate={this.onChangeDate}
                    cdate={this._cdate}
                    patient={this._patient}
                    onSelectPatient={this.onSelectPatient}
                    cureList={this.state.orgInsulinCureList}>
                </CurePatient>
            </View>
        )
    }
}
