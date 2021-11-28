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
    InsulinInjectActionVw,
    SYN_KIND
} from "@src/core/model";
import { CureTasks } from './cureTasks.component'
import moment from 'moment';
interface State {
    isLoading: boolean;
    isRefresh: boolean;
    patients: PatientModel[];
    orgInsulinCureList: InsulinInjectActionVw[];
}
export class CureTasksScreen extends React.Component<NavigationScreenProps, State> {
    private _requestParams: RequestPatientModel;
    private focusListener: any;
    private blurListener: any;
    private syncListener: any;
    private _cdate: Date;
    constructor(props: NavigationScreenProps) {
        super(props);
        this._cdate = moment().toDate();
        this.state = {
            isLoading: true,
            isRefresh: false,
            patients: [],
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
        // this.setState({ isLoading: true });
        const today = UTILS.getFormattedDate(this._cdate, 0);
        const params = this._requestParams;
        params.begin_time = today;

        // console.log(hour);
        const patients = await database.patientsHelper.getCurePatients(params);
        const cureLists = await database.insulinHelper.getInjectActionList({ hospital_id: GLOBAL.curUser.hospital_id, from_time: today, del_flag: 0, org_flag : 1 });
        // console.log(cureLists);
        // if(__DEV__) console.info(cureLists)
        this.setState({
            patients: patients,
            orgInsulinCureList: cureLists,
            isLoading: false,
            isRefresh: false
        });
        // console.log(curLists);
    }
    componentWillUnmount() {
        this.focusListener && this.focusListener.remove();
        this.blurListener && this.blurListener.remove();
        // careSensHelper.disconnect();
        // GLOBAL.startBackgroundJobs();
        EventRegister.removeAllListeners();
    }
    private onChangeDate = (date: Date) => {
        this._cdate = date;
        this.updateData();
    }
    componentDidMount() {
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            this.updateData();
            EventRegister.addEventListener(GLOBAL.sync_success, () => {
                this.updateData();
            });
        });
        this.setNavigationParams();
        this.blurListener = this.props.navigation.addListener("didBlur", () => {
            EventRegister.removeAllListeners();
        })

    }
    private onRefresh = () => {
        this.setState({ isRefresh: true });
        this.updateData();
    }
    private onCureFinish = (item: InsulinInjectActionVw) => {
        item.exec_flag = 1;
        item.s_flag = 1;
        item.exec_id = GLOBAL.curUser.id;
        item.syn_flag = SYN_KIND.UNSYNCHRONIZE;
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
        let patient = { id: 0 };
        if (advice) {
            const ads = advice.split('$');
            if (ads.length > 3) {
                // const pid = ads[3];
                patient = this.state.patients.find(_it => _it.id.toString() == ads[3]);
            }
        }
        this.props.navigation.navigate("Cure Edit", {
            cure: item,
            patient: patient,
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
                <CureTasks
                    onItemSelect={this.onItemEdit}
                    onCureFinish={this.onCureFinish}
                    isLoading={this.state.isLoading}
                    onRefreshData={this.onRefresh}
                    onChangeDate={this.onChangeDate}
                    cdate={this._cdate}
                    patients={this.state.patients}
                    onSelectPatient={this.onSelectPatient}
                    cureList={this.state.orgInsulinCureList}>
                </CureTasks>
            </View>
        )
    }
}
