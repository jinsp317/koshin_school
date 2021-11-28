import Strings from "@src/assets/strings";
import React, { Component } from "react";
import commonStyles from "@src/containers/styles/common";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import GLOBAL from "@src/core/globals";
import { database } from "@src/core/utils/database";
import { NavigationScreenProps } from "react-navigation";
import {
    GlucoseMonitorModel,
    RequestGlucoseMonitorModel,
    PatientModel,
    InsulinInjectActionVw,
    HospitalModel, 
    SYN_KIND,
} from "@src/core/model";
import { InsulinKind, InsulinMedcine, InsulinInjectAction } from '@src/core/model/table.model';
import BackgroundJob from "react-native-background-job";
import { CureEdit } from "./cureTaskEdit.component";
import * as UTILS from '@src/core/app_utils';
interface State {
    isLoading: boolean;
    kinds: InsulinKind[];
    medicines: InsulinMedcine[];
    InsulinInjectAction: InsulinInjectActionVw;
}
type Props = NavigationScreenProps;
export class CureTaskEditScreen extends React.Component<Props, State> {
    private _cureAction: InsulinInjectActionVw;
    private _patient: PatientModel;
    constructor(props: Props) {
        super(props);
        this._patient = undefined;
        this.state = {
            isLoading: false,
            kinds: [],
            medicines: [],
            InsulinInjectAction: undefined
        };
    }
    componentWillMount() {
        BackgroundJob.cancelAll();
        this._cureAction = this.props.navigation.getParam("cure", undefined);
        this._patient = this.props.navigation.getParam('patient', undefined);
    }
    async componentDidMount() {
        const kind = await database.getInsulinKinds();
        const meds = await database.getInsulinMedicines();
        this.setState({ kinds: kind, medicines: meds, InsulinInjectAction: this._cureAction });
    }
    componentWillUnmount() {
        GLOBAL.startBackgroundJobs();
    }
    onSave = async (action: InsulinInjectAction) => {
        const curTime = UTILS.getFormattedDate(undefined, 1);
        action.created_at = curTime;
        action.updated_at = curTime;
        action.exec_time = curTime;
        action.syn_flag = SYN_KIND.UNSYNCHRONIZE;
        const flag = await database.saveInsulinAction(action);
        if (flag) {
            UTILS.showToast(Strings.message.op_success);
        } else {
            UTILS.showToast(Strings.message.op_fail);
        }
        this.props.navigation.goBack();
    }
    render() {
        return (
            <View style={commonStyles.container}>
                <CureEdit
                    cure={this._cureAction}
                    kinds={this.state.kinds}
                    patient={this._patient}
                    medicines={this.state.medicines}
                    onSave={this.onSave}
                >
                </CureEdit>
            </View>
        );
    }
}