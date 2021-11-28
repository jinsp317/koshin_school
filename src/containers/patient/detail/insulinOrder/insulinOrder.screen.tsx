import React, { PureComponent } from 'react'
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { ThemeType, withStyles, ThemedComponentProps } from "@src/core/react-native-ui-kitten";
import { View, Text, ImageProps, TouchableOpacity } from "react-native";
import { InsulinInjectActionVw } from '@src/core/model'
import { InsulinInjectAction } from '@src/core/model/table.model';
import { PatientModel } from '@src/core/model'
import GLOBAL from '../../../../core/globals';
import { Database, database } from '../../../../core/utils/database';
import * as UTILS from "@src/core/app_utils";
import { EventRegister } from "react-native-event-listeners";
import { InsulinOrderComponent } from './insulinOrder.component';
import moment from "moment";
interface State {
    isLoading: boolean;
    orgInsulinCureList: InsulinInjectActionVw[];
    cdate: Date;
}
interface ComponentProps {
    navigation: NavigationParams;
}
type Props = ThemedComponentProps & ComponentProps;
class InsulinOrder extends React.PureComponent<Props, State> {
    private _params: InsulinInjectAction;
    private _patient: PatientModel;
    private syncListener: any;
    private focusListener: any;
    private blurListener: any;
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            cdate: moment().toDate(),
            orgInsulinCureList: []
        }
    }
    componentDidMount() {
        this._patient = GLOBAL.curPatient;
        const today = UTILS.getFormattedDate(this.state.cdate, 0);
        this._params = {
            advice_id: this._patient.id,
            from_time: today,
            // org_flag: 1,
            del_flag: 0
        }
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            this.updateData();
            EventRegister.addEventListener(GLOBAL.sync_success, data => {
                this.updateData();
            });
        });
        this.blurListener = this.props.navigation.addListener("didBlur", () => {
            EventRegister.removeAllListeners();
        })
        // this.updateData();
    }
    
    componentWillUnmount() {
        this.syncListener && this.syncListener.remove();
        this.blurListener && this.blurListener.remove();
        EventRegister.removeAllListeners();
    }
    private updateData() {
        const dbHelper = database.insulinHelper;
        // if (__DEV__) console.log(this._params);
        dbHelper.getInjectActionList(this._params).then(res => {
            // console.log(res);
            this.setState({ orgInsulinCureList: res });
        }).catch(_ => {
            this.setState({ orgInsulinCureList: [] });
        });
    }
    private onItemEdit = (inject_kind: string, date: string) => {
        // if (__DEV__) console.info(date);
        // const advice = item.vm_advice_obj;
        const patient = this._patient;
        // const cdate = UTILS.getFormattedDate(this.state.cdate, 0);
        this.props.navigation.navigate("Cure Advice", {
            inject_kind: inject_kind,
            patient: patient,
            cdate: date,
            onGoBack: this.onGoBack
        });
    }
    private onGoBack = (params: any) => {
        // if (params.beUpdate) {
        this.updateData();
        // }
    };
    private onChangeDate = (date: Date) => {
        /// this.setState({ cdate: date });
        const today = UTILS.getFormattedDate(date, 0);
        this._params = {
            advice_id: this._patient.id,
            from_time: today,
            del_flag: 0
        }
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

    render() {
        const { themedStyle } = this.props;
        return (
            <View style={themedStyle.container}>
                <InsulinOrderComponent
                    cureData={this.state.orgInsulinCureList}
                    onChangeDate={this.onChangeDate}
                    cdate={this.state.cdate}
                    onItemSelect={this.onItemEdit}
                    onCureFinish={this.onCureFinish} />
            </View>
        )
    }
}
export const InsulinOrderContainer = withStyles(InsulinOrder, (theme: ThemeType) => ({
    container: {
        flex: 1,
        backgroundColor: theme["background-basic-color-1"]
    }
}));
