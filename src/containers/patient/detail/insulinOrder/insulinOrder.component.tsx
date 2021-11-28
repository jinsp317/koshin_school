import React from 'react'
import { InsulinInjectActionVw } from '@src/core/model'
import {
    View,
    TouchableOpacity, ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { MyDatePicker } from "@src/components/common";
import commonStyles from "@src/containers/styles/common";
import {
    withStyles,
    ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { themes } from "@src/core/themes";
import moment from 'moment';
import { Text, Button, Layout } from "@src/core/react-native-ui-kitten/ui";
import Strings from "@src/assets/strings";
import { ListItem } from '../glucoseLogA/listItem.component';

interface State {
    insulinCureList: InsulinInjectActionVw[];
    curCure: InsulinInjectActionVw;
    endDate: Date;
    visibleModal: boolean;
}
interface ComponentProps {
    cureData: InsulinInjectActionVw[];
    cdate: Date;
    onChangeDate: (date: Date) => void;
    onCureFinish: (item: InsulinInjectActionVw) => void;
    onItemSelect: (inject_kind: string, date: string) => void;
}
type Props = ThemedComponentProps & ComponentProps;
class InsulinComponent extends React.PureComponent<Props, State> {
    private _maxTime: Date;
    constructor(props: Props) {
        super(props);
        this._maxTime = UTILS.getLastDateofMonth(undefined);
        this.state = {
            insulinCureList: this.props.cureData,
            curCure: null,
            endDate: this.props.cdate,
            visibleModal: false
        };
    }
    onRefresh = () => {

    }
    onItemFinish = () => {

    }
    private groupBy(obArray: any[], property: string): any {
        if (obArray.length === 0) return null;
        return obArray.reduce((acc, obj) => {
            const key = obj[property];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
        }, {});
    }
    private onSelectAdvice(inject_kind: string, date: string) {
        this.props.onItemSelect(inject_kind, date);
    }
    ListViewItemSeparator = () => {
        return <View style={{ height: 2, width: "100%", backgroundColor: "transparent" }} />;
    };
    renderGroupItem = (item, index) => {
        return (
            <View>
                <Text>{`${index} - all`}</Text>
            </View>
        )
    }
    showCompleteModal = (item: InsulinInjectActionVw) => {
        this.setState({ visibleModal: true, curCure: item });
    }
    cureCompleteAction = () => {
        this.props.onCureFinish(this.state.curCure);
        this.setState({ visibleModal: false });
    }
    private renderCureItem = (item: InsulinInjectActionVw, _kid) => {
        const { themedStyle } = this.props;
        let time = '';
        if (item.point_kind == 5) {
            const stime = moment().format("YYYY-MM-DD ") + item.from_time;
            const ftime = moment(stime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
            time = ftime;
        }
        if (item.point_kind == 6) {
            let stime = moment().format("YYYY-MM-DD ") + item.from_time;
            const ftime = moment(stime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
            stime = moment().format("YYYY-MM-DD ") + item.to_time;
            const ttime = moment(stime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
            time = `${ftime}~${ttime}`;
        }
        return (
            <View key={_kid} style={[themedStyle.row]}>
                <View style={[themedStyle.col, { width: 90 }]}>
                    <Text style={themedStyle.linkItem} category="s1">{`${GLOBAL.INSULIN_TIME[item.point_kind]}`}</Text>
                    <Text style={themedStyle.linkItem}>{`${time}`}</Text>
                </View>
                <View style={[themedStyle.col, { width: 100 }]}>
                    <Text category="p1" appearance="hint">{`${item.vw_medicine_name}`}</Text>
                </View>
                <View style={[themedStyle.col, { width: 80 }]}>
                    <Text category="s1" >{`${item.insulin_amount}U`}</Text>
                </View>
                <View style={[themedStyle.col, { width: 90 }]}>
                    <Button size='small' disabled={item.exec_flag === 1} onPress={(_evt) => {
                        this.showCompleteModal(item);
                    }}>{`${item.exec_flag === 0 ? Strings.common.str_uncompleted : Strings.common.str_completed}`}</Button>
                </View>
            </View>
        )
    }

    renderCompleteModal = () => {
        const { themedStyle } = this.props;
        return (
            <Layout level='3' style={themedStyle.modalContainer}>
                <View style={{ alignContent: 'flex-start' }}>
                    <Text category='h6'>{`${Strings.common.str_confirm}`}</Text>
                </View>
                <View style={{ marginVertical: 5 }}>
                    <Text>{`${Strings.message.cure_complete}`}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingHorizontal: 7 }}>
                        <Button size="small" appearance="outline" status='white' onPress={() => {
                            this.setState({ visibleModal: false });
                        }}>{`${Strings.common.str_cancel}`}</Button>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 7 }}>
                        <Button size="small" onPress={() => {
                            this.cureCompleteAction();
                            // this.setState({ visibleModal: false })
                        }}>{`${Strings.common.str_ok}`}</Button>
                    </View>
                </View>

            </Layout>)
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
    private renderToolbar = () => {
        return (
            <View style={commonStyles.toolbarContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => this.onNavDatePress(true)}>
                        <Text style={{
                            color: themes["App Theme"]["color-primary-500"],
                            paddingLeft: 6
                        }}                     >
                            ◀
                        </Text>
                    </TouchableOpacity>
                    <MyDatePicker
                        onDateChange={this.onDateChange}
                        date={this.state.endDate}
                        maxDate={this._maxTime}
                        textColor={themes["App Theme"]["color-primary-500"]}
                        format="YYYY-MM-DD"
                    />
                    <TouchableOpacity onPress={() => this.onNavDatePress(false)}>
                        <Text style={{
                            color: themes["App Theme"]["color-primary-500"],
                            paddingRight: 10
                        }}                      >
                            ▶
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    private renderAdviceItems = (items: InsulinInjectActionVw[], advices: number[], date: string) => {
        const themedStyle = this.props.themedStyle;
        const day = UTILS.getFormattedDate(date, 7);
        if (items.length > 0) {
            const fItem = items[0];
            const advice = fItem.vm_advice_obj.split('$');
            const inject_kind = advice[1];
            let cure_kind = Strings.common.str_insulin_cure1;
            if (inject_kind === '2') {
                cure_kind = Strings.common.str_insulin_cure2;
            }

            const cItems = items.sort(function (prItem, nxItem) {
                if (prItem.created_at < nxItem.created_at) {
                    return 1;
                } else if (prItem.created_at > nxItem.created_at) {
                    return -1;
                } else {
                    return 0;
                }
            });
            const update_at = UTILS.getFormattedDate(cItems[0].created_at, 2);
            const keyId = items[0].id;
            items.sort(function (prItem, nxItem) {
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
            const comments = items.reduce((rs, adItem) => {
                if (adItem.comment && adItem.comment.length > 0) {
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
                <View key={keyId} style={{
                    marginBottom: 5
                }}>
                    <TouchableOpacity onPress={() => {
                        this.onSelectAdvice(inject_kind, date);
                    }}>
                        <View style={themedStyle.pItemAdvice} >
                            <Text style={{ marginLeft: 10 }} category="s1">{`${cure_kind}(${day})`}</Text>
                            <Text style={{ marginLeft: 10 }} category="s2" appearance="hint">{`${update_at} : 方案变更`}</Text>
                        </View>
                    </TouchableOpacity>

                    {
                        items.map((_item, _id) => {
                            return this.renderCureItem(_item, _id);
                        })
                    }
                    {comments.length > 0 && (
                        <Text style={{ marginLeft: 10 }} category="s2" appearance="hint">{`备注: \n${comments.join('\n')}`}</Text>
                    )}

                </View>
            );
        }
    }

    render() {
        const cureData = this.props.cureData;
        const visibleModale = this.state.visibleModal;
        const tday = moment(this.state.endDate).format('YYYY-MM-DD');
        const nday = moment(this.state.endDate).add(1, 'days').format('YYYY-MM-DD');
        const to_cures = cureData.filter(_it => _it.ex_date.indexOf(tday) === 0);
        const nx_cures = cureData.filter(_it => _it.ex_date.indexOf(nday) === 0);
        const cure1 = to_cures.filter(_it => {
            const advice = _it.vm_advice_obj.split('$');
            return advice.length > 0 && advice[1] === '1';
        });
        const cure1_advice_ids = cure1.reduce((rs, _it) => {
            if (rs.findIndex(it => it === _it.advice_id) < 0) {
                rs.push(_it.advice_id);
            }
            return rs;
        }, []);
        const ncure1 = nx_cures.filter(_it => {
            const advice = _it.vm_advice_obj.split('$');
            return advice.length > 0 && advice[1] === '1';
        });
        const ncure1_advice_ids = ncure1.reduce((rs, _it) => {
            if (rs.findIndex(it => it === _it.advice_id) < 0) {
                rs.push(_it.advice_id);
            }
            return rs;
        }, []);
        const cure2 = to_cures.filter(_it => {
            const advice = _it.vm_advice_obj.split('$');
            return advice.length > 0 && advice[1] === '2';
        });
        const cure2_advice_ids = cure2.reduce((rs, _it) => {
            if (rs.findIndex(it => it === _it.advice_id) < 0) {
                rs.push(_it.advice_id);
            }
            return rs;
        }, []);
        const ncure2 = nx_cures.filter(_it => {
            const advice = _it.vm_advice_obj.split('$');
            return advice.length > 0 && advice[1] === '2';
        });
        const ncure2_advice_ids = ncure2.reduce((rs, _it) => {
            if (rs.findIndex(it => it === _it.advice_id) < 0) {
                rs.push(_it.advice_id);
            }
            return rs;
        }, []);
        if (__DEV__) console.dir(cure1);
        const { themedStyle } = this.props;
        return (
            <View style={{
                flex: 1
            }}>
                {this.renderToolbar()}
                <ScrollView>
                    {cure1.length > 0 && this.renderAdviceItems(cure1, cure1_advice_ids, tday)}
                    {cure2.length > 0 && this.renderAdviceItems(cure2, cure2_advice_ids, tday)}
                    {ncure1.length > 0 && this.renderAdviceItems(ncure1, ncure1_advice_ids, nday)}
                    {ncure2.length > 0 && this.renderAdviceItems(ncure2, ncure2_advice_ids, nday)}
                </ScrollView>
                <Modal isVisible={visibleModale}
                    style={{ alignItems: "center", borderRadius: 5 }}
                    swipeDirection="left">
                    {this.renderCompleteModal()}
                </Modal>
            </View>


        )
    }
}
export const InsulinOrderComponent = withStyles(InsulinComponent, () => ({
    container: {
        flexDirection: "column",
        minWidth: "100%",
    },
    groupItem: {
        flexDirection: "row",
    },
    linkItem: {
        ...commonStyles.detailText
    },
    row: {
        flexDirection: "row",
        backgroundColor: "white",
        paddingVertical: 5,
        paddingHorizontal: 6,
        justifyContent: "space-between",
        alignItems: "center"
        // width: "100%"
    },
    col: {
        paddingVertical: 3,
        justifyContent: "space-between",
        alignItems: "center"
    },

    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        width: 306,
        padding: 16,
    },
    pItemAdvice: {
        flexDirection: "column",
        paddingVertical: 4,
        borderColor: themes["App Theme"]["mycolor-lightgray"],
        borderBottomWidth: 1,
        borderTopWidth: 1
    },
    layoutContainer: {
        padding: 10
    }
}));
