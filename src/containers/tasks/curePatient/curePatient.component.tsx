import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import {
    ThemedComponentProps,
    ThemeType,
    withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Text, Button } from "@src/core/react-native-ui-kitten/ui";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import { themes } from "@src/core/themes";
import Modal from "react-native-modal";
import {
    PatientModel,
    InsulinInjectActionVw
} from "@src/core/model";
import Strings from "@src/assets/strings";
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUserClock, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { MyDatePicker, textStyle } from "@src/components/common";

interface ComponentProps {
    isLoading: boolean;
    patient: PatientModel;
    cureList: InsulinInjectActionVw[];
    cdate: Date;
    onChangeDate: (date: Date) => void;
    onRefreshData: () => void;
    onItemSelect: (item: InsulinInjectActionVw) => void;
    onSelectPatient: (pItem: PatientModel) => void;
}
type Props = ThemedComponentProps & ComponentProps;
interface State {
    refreshing: boolean;
    visibleModal: boolean;
    endDate: Date;
    curCure: InsulinInjectActionVw;
}
class MyComponent extends React.Component<Props, State> {
    private _maxTime: Date;
    constructor(props) {
        super(props);
        this._maxTime = UTILS.getLastDateofMonth(undefined);
        this.state = { refreshing: false, visibleModal: false, curCure: undefined, endDate: this.props.cdate };
    }
    private onNavDatePress = (isPrev: boolean) => {
        const date = UTILS.modifyDate(this.state.endDate, 1, !isPrev, 0);
        if (UTILS.isFutureTime(this._maxTime, date)) return;
        this.props.onChangeDate(date);
        this.setState({ endDate: date });
    }
    private onDateChange = (date: Date) => {
        this.setState({ endDate: date });
        this.props.onChangeDate(date);
    }

    // private showCompleteModal(item: InsulinInjectActionVw) {
    //     this.setState({ visibleModal: true, curCure: item });
    // }

    private onItemSelect = (item: InsulinInjectActionVw) => {
        this.props.onItemSelect(item);
    }
    private renderCureItem = (item: InsulinInjectActionVw, index) => {
        const themedStyle = this.props.themedStyle;
        let stime = moment().format("YYYY-MM-DD ") + item.from_time;
        const ftime = moment(stime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
        stime = moment().format("YYYY-MM-DD ") + item.to_time;
        const ttime = moment(stime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
        let stimes = '';
        const fWidth = 90;
        const sWidth = 120;
        const oWidth = 70;
        if (item.point_kind === 5) {
            stimes = `${ftime}`;
        }
        if (item.point_kind === 6) {
            stimes = `${ftime}-${ttime}`;
        }
        return (
            <View style={themedStyle.pItemRow} key={index}>
                <View style={[themedStyle.col, { width: fWidth }]}>
                    <Text style={themedStyle.linkItem} category="s1">{`${GLOBAL.INSULIN_TIME[item.point_kind]}`}</Text>
                    <Text style={themedStyle.linkItem}>{`${stimes}`}</Text>
                </View>
                <View style={[themedStyle.col, { width: sWidth }]}>
                    <Text style={[themedStyle.detailItem, { paddingLeft: 4 }]} category="p1">{`${item.vw_medicine_name}`}</Text>
                </View>
                <View style={[themedStyle.col, { width: oWidth }]}>
                    <Text style={themedStyle.detailItem} category="p1">{`${item.insulin_amount}U`}</Text>

                </View>
                {item.exec_flag == 1 ? (
                    <View style={[themedStyle.col, { width: oWidth, marginRight: 4 }]}>
                        <FontAwesomeIcon icon={faCheckCircle} size={20} style={{ color: 'forestgreen' }} />
                    </View>
                ) : (
                        <TouchableOpacity onPress={() => {
                            this.onItemSelect(item);
                        }}>
                            <View style={[themedStyle.col, { width: oWidth, marginRight: 4 }]}>
                                <FontAwesomeIcon icon={faArrowRight} size={20} />
                            </View>
                        </TouchableOpacity>
                    )}

            </View>
        )
        // })
    }

    updateState = (props: Props) => {
        this.setState({ refreshing: props.isLoading });
    }
    componentWillReceiveProps(nextProps: Props) {
        this.updateState(nextProps);
    }
    public onRefresh = () => {
        if (!this.state.refreshing) {
            this.setState({ refreshing: true }, () => this.props.onRefreshData());
        }
    };

    private onAddItem = () => {
        const time =  moment().format('HH:mm:ss');
        const cureO = this.props.cureList[0];
        const cure: InsulinInjectActionVw = {};
        cure.id = 0;
        cure.comment = '';
        cure.from_time = time;
        cure.to_time = time;
        // cure.hospital_id = cureO.hospital_id;
        cure.advice_id = cureO.advice_id;
        cure.ex_date = cureO.ex_date;
        cure.point_kind = 5;
        cure.exec_flag = 0;
        cure.insulin_amount = 0;
        cure.insulin_id = 0;
        // cure.point_kind = 1;
        cure.del_flag = 0;
        cure.vm_advice_obj = cureO.vm_advice_obj;
        this.props.onItemSelect(cure);
    }
    render() {
        const themedStyle = this.props.themedStyle;
        const patient = this.props.patient;
        const cures = this.props.cureList;

        let inject_kind = '';
        let update_time = '';
        if (cures.length > 0) {
            // console.log(cures[0].vm_advice_obj)
            const dCures = cures.sort(function (prItem, nxItem) {
                if (prItem.created_at < nxItem.created_at) {
                    return 1;
                } else if (prItem.created_at > nxItem.created_at) {
                    return -1;
                } else {
                    return 0;
                }
            });
            const advice = dCures[0].vm_advice_obj.split('$');
            update_time = UTILS.getFormattedDate(dCures[0].created_at, 4);
            inject_kind = advice[1];
        }
        cures.sort(function (prItem, nxItem) {
            if (prItem.point_kind != 6 && nxItem.point_kind != 6) {
                if (prItem.point_kind < nxItem.point_kind) {
                    return -1;
                } else if (prItem.point_kind > nxItem.point_kind) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (prItem.point_kind == 6 && nxItem.point_kind != 6) {
                return 1;
            } else if (prItem.point_kind != 6 && nxItem.point_kind == 6) {
                return -1;
            } else if (prItem.point_kind == 6 && nxItem.point_kind == 6) {
                if (prItem.from_time < nxItem.from_time) {
                    return -1;
                } else if (prItem.from_time > nxItem.from_time) {
                    return 1;
                } else {
                    return 0;
                }
            }
            return 0;
        });
        // console.log(inject_kind);
        const comments = cures.reduce((rs, adItem) => {
            if (adItem.comment && adItem.comment.length > 1) {
                if (adItem.point_kind < 5) {
                    const comment = `${GLOBAL.INSULIN_TIME[adItem.point_kind]} : ${adItem.comment}`;
                    rs.push(comment);
                } else if (adItem.point_kind == 5) {
                    const stime = moment().format("YYYY-MM-DD ") + adItem.from_time;
                    const ftime = moment(stime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    const comment = `${GLOBAL.INSULIN_TIME[adItem.point_kind]} ${ftime}: ${adItem.comment}`;
                    rs.push(comment);
                } else {
                    const stime = moment().format("YYYY-MM-DD ") + adItem.from_time;
                    const ftime = moment(stime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    const etime = moment().format("YYYY-MM-DD ") + adItem.to_time;
                    const ttime = moment(etime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    const comment = `${GLOBAL.INSULIN_TIME[adItem.point_kind]} ${ftime} - ${ttime}: ${adItem.comment}`;
                    rs.push(comment);
                }
            }
            return rs;
        }, []);
        return (
            <View style={{ flex: 1 }}>
                {/* {this.renderToolbar()} */}
                {this.props.isLoading && GLOBAL.SHOW_LOADING ? (
                    <View style={commonStyles.progressBar}>
                        <ProgressBar />
                    </View>
                ) : (
                        <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: 'white' }}>
                            <View>
                                {patient && (
                                    <View style={themedStyle.pItemRow}>
                                        <View style={{ flexDirection: "row" }}>
                                            <FontAwesomeIcon icon={faUserClock} size={24} style={{
                                                marginRight: 4,
                                                marginLeft: 8
                                            }} />
                                            <Text style={[themedStyle.pItemTitle, { width: 60 }]} category="h6">{`${patient.bed_number}床`}</Text>
                                        </View>
                                        <View style={{ flexDirection: "row" }}>
                                            <Text style={themedStyle.pItemTitle} category="h6">{`${patient.name}`}</Text>
                                        </View>
                                    </View>
                                )}
                                {inject_kind == '1' && (
                                    <View style={themedStyle.pItemRow}>
                                        <Text style={[themedStyle.pItemTitle]} category="h6">{`${Strings.common.str_insulin_cure1}`}</Text>
                                        <Text category="s2" appearance="hint">{`${update_time} : 方案变更`}</Text>
                                    </View>
                                )}
                                {inject_kind == '2' && (
                                    <View style={themedStyle.pItemRow}>
                                        <Text style={[themedStyle.pItemTitle, { width: 60 }]} category="h6">{`${Strings.common.str_insulin_cure2}`}</Text>
                                        <Text category="s2" appearance="hint">{`${update_time} : 方案变更`}</Text>
                                    </View>
                                )}
                                <FlatList
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) => this.renderCureItem(item, index)}
                                    numColumns={1}
                                    contentContainerStyle={themedStyle.contentContainer}
                                    initialNumToRender={10}
                                    data={cures}
                                />
                                {comments.length > 0 && (
                                    <Text style={{ marginLeft: 10 }} category="s2" appearance="hint">{`备注: \n${comments.join('\n')}`}</Text>
                                )}
                            </View>
                            <View style={{ alignItems: 'center', marginBottom: 4 }}>
                                <Button onPress={() => {
                                    this.onAddItem();
                                }}>{`新增临时方案`}</Button>
                            </View>
                        </View>
                    )}

            </View>
        )
    }
}
export const CurePatient = withStyles(MyComponent, (theme: ThemeType) => ({
    contentContainer: {
        paddingHorizontal: 3,
        paddingVertical: 3
    },
    toolbarButtn: {
        paddingHorizontal: 6
    },
    categoryStyle: {
        flex: 1,
        left: 8
    },
    item: {
        flex: 0.5,
        minHeight: 160,
        // maxWidth: itemWidth,
        marginHorizontal: 2,
        marginVertical: 2
    },
    lastItem: {
        flex: 0.48,
        minHeight: 160,
        marginHorizontal: 2,
        marginVertical: 2
    },
    pItemRow: {
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "row",
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme["color-basic-600"],
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    pItemAdvice: {
        flexDirection: "column",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: theme["color-basic-600"],
    },
    pItemTitle: {
        marginRight: 6,
        color: theme["color-basic-800"],
        ...textStyle.subtitle
    },
    col: {
        justifyContent: "space-between",
        alignItems: "center"
    },
    detailItem: {
        ...commonStyles.detailText,
        paddingTop: 2
    },
    linkItem: {
        ...commonStyles.detailText
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        width: 306,
        padding: 16,
    },
}));
