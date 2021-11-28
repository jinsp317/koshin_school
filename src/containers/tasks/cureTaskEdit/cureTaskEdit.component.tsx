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
import Modal from "react-native-modal";
import {
    GlucoseMonitorModel,
    RequestGlucoseMonitorModel,
    PatientModel,
    InsulinInjectActionVw,
    HospitalModel
} from "@src/core/model";
import { MyDatePicker, textStyle, ContainerView, SlideMenu } from '@src/components/common';
import { InsulinKind, InsulinMedcine, InsulinInjectAction } from '@src/core/model/table.model';
import * as UTILS from '@src/core/app_utils';
import { themes } from '@src/core/themes';
import GLOBAL from '@src/core/globals';
import commonStyles from '../../styles/common';
import { Input, RadioGroup, Radio, Text, Button, Layout } from '@src/core/react-native-ui-kitten/ui';
import { EditInput } from '@src/components/common';
import DateTimePicker from "react-native-modal-datetime-picker";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUser, faUserClock, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import moment from "moment";
interface ComponentProps {
    cure: InsulinInjectActionVw;
    kinds: InsulinKind[];
    patient: PatientModel;
    medicines: InsulinMedcine[];
    onSave: (action: InsulinInjectAction) => void;
}
type Props = ThemedComponentProps & ComponentProps;
interface State {
    kind_index: number;
    medi_index: number;
    amount: string;
    ctime: Date;
    visibleModal: boolean;
    cureItem: InsulinInjectActionVw;
    showTTime: boolean;
    showFTime: boolean;
}
class MyComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            kind_index: props.cure.kind_id,
            medi_index: props.cure.insulin_id,
            amount: props.cure.insulin_amount.toString(),
            cureItem: props.cure,
            ctime: UTILS.createDate(),
            visibleModal: false,
            showTTime: false,
            showFTime: false
        }
    }
    private onDepartChange = (index: number) => {
        const cure = this.state.cureItem;
        cure.insulin_id = this.props.medicines[index].id;
        this.setState({ cureItem: cure });
    }
    private onTKindChange = (index: number) => {
        const cure = this.state.cureItem;
        cure.point_kind = index + 1;
        this.setState({ cureItem: cure });
    }
    private onNoteChange = (value: string) => {
        const cure = this.state.cureItem;
        cure.comment = value;
        this.setState({ cureItem: cure });
    }
    private onAmountChange = (value: string) => {
        const cure = this.state.cureItem;
        cure.insulin_amount = value != '' ? parseInt(value, 0) : 0;
        this.setState({ cureItem: cure, amount: value });
    }
    private showTime = (time: string) => {
        const stime = moment().format("YYYY-MM-DD ") + time;
        const date = moment(stime, 'YYYY-MM-DD HH:mm:ss').toDate();
        this.setState({ showFTime: true, ctime: date });
    }
    private setFTime = (date: Date) => {
        const time = moment(date).format('HH:mm:ss');
        const cure = this.state.cureItem;
        cure.from_time = time;
        this.setState({ cureItem: cure, showFTime: false });
    }
    private setTTime = (date: Date) => {
        const time = moment(date).format('HH:mm:ss');
        const cure = this.state.cureItem;
        cure.to_time = time;
        this.setState({ cureItem: cure, showTTime: false });
    }
    renderDeleteModal = () => {
        const { themedStyle } = this.props;
        return (
            <Layout level='3' style={themedStyle.modalContainer}>
                <View style={{ alignContent: 'flex-start' }}>
                    <Text category='h6'>{`${Strings.common.str_confirm}`}</Text>
                </View>
                <View style={{ marginVertical: 5 }}>
                    <Text>{`${Strings.message.cure_delete}`}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingHorizontal: 7 }}>
                        <Button size="small" appearance="outline" status='white' onPress={() => {
                            this.setState({ visibleModal: false });
                        }}>{`${Strings.common.str_cancel}`}</Button>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 7 }}>
                        <Button size="small" status="danger" onPress={() => {
                            this.setState({ visibleModal: false })
                            this.onCureDelete();
                        }}>{`${Strings.common.str_ok}`}</Button>
                    </View>
                </View>

            </Layout>)
    }
    private onCureDelete = () => {
        const cureItem = this.state.cureItem;
        cureItem.del_flag = 1;
        this.props.onSave(cureItem);
    }
    private onSave = () => {
        const cureItem = this.state.cureItem;
        if (cureItem.insulin_id == 0) {
            UTILS.showToast('必须选择胰岛素.');
            return;
        }
        if (cureItem.insulin_amount === 0) {
            UTILS.showToast('必须输入剂量.');
            return;
        }
        this.props.onSave(this.state.cureItem);
    }
    private onShowDelete = () => {
        this.setState({ visibleModal: true });
    }

    render() {
        const { themedStyle } = this.props;
        const cure = this.state.cureItem;
        const med_index = this.props.medicines.findIndex(_it => _it.id === cure.insulin_id);
        // if (med_index < 0) med_index = 0;

        const mode = 'time';
        const t_kind = cure.point_kind - 1;

        /// const show = this.state.showTime;
        const fShow: boolean = this.state.cureItem.point_kind > 4;
        const tShow: boolean = this.state.cureItem.point_kind > 5;
        const advice = cure.vm_advice_obj.split('$');
        let cureKind = '手动胰岛素';
        if (advice[1] == '2') cureKind = '胰岛素泵';
        // const advice.split('$')
        return (
            <View
                style={themedStyle.container}
            >
                <View style={themedStyle.body}>
                    <View style={[themedStyle.section]}>
                        <FontAwesomeIcon icon={faUserClock} size={24} style={{
                            marginRight: 4,
                            marginLeft: 8
                        }} />
                        <Text style={[themedStyle.pItemTitle, { width: 60 }]} category="h6">{`${this.props.patient.bed_number}床`}</Text>
                        <Text style={themedStyle.pItemTitle} category="h6">{`${this.props.patient.name}`}</Text>
                        <Text style={{ marginLeft: 18 }} category="h6">{`${cureKind}`}</Text>
                    </View>
                    <View style={themedStyle.section}>
                        <View style={themedStyle.sectionCategoryPickerContent}>
                            <Text style={commonStyles.sectionText}>{`${Strings.patient.str_timeName} :`}</Text>
                            <View style={{ width: 10 }} />
                            <SlideMenu name={'MENU_TIME_KIND'}
                                data={GLOBAL.INSULIN_TNAME}
                                curItemIndex={t_kind}
                                disabled={cure.id == 0}
                                cols={2}
                                onMenuItemSelect={this.onTKindChange}
                                textStyle={commonStyles.slideMenuText_1}
                                triggerStyle={commonStyles.slideMenuTrigger}
                            />
                        </View>
                        {/* <EditInput
                            // editable={this.props.kind === MANAGE_KIND.ADD ? true : false}
                            style={themedStyle.profileSetting}
                            editable={false}
                            hint={Strings.patient.str_timeName}
                            defaultValue={GLOBAL.CURE_TIME[(cure.point_kind - 1)]}
                            placeholder={Strings.message.input_patientMobile}
                        /> */}
                    </View>
                    {fShow && (
                        <View style={themedStyle.section}>
                            <View style={themedStyle.sectionCategoryPickerContent}>
                                <Text style={commonStyles.sectionText}>{`${Strings.patient.str_time} :`}</Text>
                                <TouchableOpacity onPress={() => {
                                    this.showTime(cure.from_time);
                                }}>
                                    <Text style={commonStyles.sectionText}>{`${cure.from_time}`}</Text>
                                </TouchableOpacity>
                                <DateTimePicker isVisible={this.state.showFTime}
                                    is24Hour={true}
                                    mode={"time"}
                                    minuteInterval={20}
                                    timePickerModeAndroid={"spinner"}
                                    date={this.state.ctime}
                                    onConfirm={(date) => { this.setFTime(date) }}
                                    onCancel={() => { this.setState({ showFTime: false }); }}
                                />

                            </View>
                        </View>
                    )}
                    {tShow && (
                        <View style={themedStyle.section}>
                            <View style={themedStyle.sectionCategoryPickerContent}>
                                <Text style={commonStyles.sectionText}>{`${Strings.patient.str_time} :`}</Text>
                                <TouchableOpacity onPress={() => {
                                    this.showTime(cure.to_time);
                                }}>
                                    <Text style={commonStyles.sectionText}>{`${cure.to_time}`}</Text>
                                </TouchableOpacity>
                                <DateTimePicker isVisible={this.state.showTTime}
                                    is24Hour={true}
                                    mode={"time"}
                                    minuteInterval={20}
                                    timePickerModeAndroid={"spinner"}
                                    date={this.state.ctime}
                                    onConfirm={(date) => { this.setTTime(date) }}
                                    onCancel={() => { this.setState({ showTTime: false }) }}
                                />

                            </View>
                        </View>
                    )}
                    <View style={themedStyle.section}>
                        <View style={themedStyle.sectionCategoryPickerContent}>
                            <Text style={commonStyles.sectionText}>{`${Strings.patient.str_medName} :`}</Text>
                            <View style={{ width: 10 }} />
                            <SlideMenu name={'MENU_DEPARTMENT'}
                                data={UTILS.getSingleArrFromMultiArr(this.props.medicines, 'name')}
                                curItemIndex={med_index}
                                onMenuItemSelect={this.onDepartChange}
                                textStyle={commonStyles.slideMenuText_1}
                                triggerStyle={commonStyles.slideMenuTrigger}
                            />
                        </View>
                    </View>
                    <View style={themedStyle.section}>
                        <EditInput style={themedStyle.profileSetting}
                            hint={Strings.patient.str_amount}
                            defaultValue={this.state.amount.toString()}
                            keyboardType={'numeric'}
                            onChangeText={this.onAmountChange}
                        />
                    </View>
                    <View style={themedStyle.section}>
                        <EditInput style={themedStyle.profileSetting}
                            hint={'备注'}
                            defaultValue={cure.comment}
                            onChangeText={this.onNoteChange}
                        />
                    </View>
                </View>
                <View style={themedStyle.body}>
                    <View style={themedStyle.footer}>
                        {cure.id > 0 && (
                            <View style={{ marginHorizontal: 10 }}>
                                <Button
                                    textStyle={[textStyle.button]}
                                    size="large"
                                    status="danger"
                                    onPress={() => { this.onShowDelete() }}
                                >{Strings.common.str_delete}</Button>
                            </View>

                        )}
                        <View style={{ marginHorizontal: 10 }}>
                            <Button
                                textStyle={[textStyle.button]}
                                size="large"
                                onPress={() => { this.onSave() }}
                            >{cure.id == 0 ? Strings.common.str_save : Strings.common.str_commit}</Button>
                        </View>

                    </View>
                </View>
                <Modal isVisible={this.state.visibleModal}
                    onBackdropPress={() => this.setState({ visibleModal: false })}
                    onSwipeComplete={() => this.setState({ visibleModal: false })}
                    onBackButtonPress={() => this.setState({ visibleModal: false })}
                    style={{ alignItems: "center", borderRadius: 5 }}
                    swipeDirection="left">
                    {this.renderDeleteModal()}
                </Modal>
            </View>
        );
    }
}
export const CureEdit = withStyles(MyComponent, (theme: ThemeType) => ({
    container: {
        flex: 1,
        justifyContent: 'space-between',
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
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        alignContent: 'space-between',
        marginBottom: 10,
        padding: 6
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        width: 306,
        padding: 16,
    },
    radioGroup: {
        flexDirection: 'row',
        paddingVertical: 6
    }
}));