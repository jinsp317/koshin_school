import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import {
    ThemedComponentProps,
    ThemeType,
    withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Text, Button, Layout, Input } from "@src/core/react-native-ui-kitten/ui";
import Modal from "react-native-modal";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import { themes } from "@src/core/themes";
import SvgUri from 'react-native-svg-uri';
import { UserSearchSvg } from '@src/assets/icons';

import {
    PatientModel,
    InsulinInjectActionVw
} from "@src/core/model";
import Strings from "@src/assets/strings";
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUserClock, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons'
import { MyDatePicker, textStyle } from "@src/components/common";
interface ComponentProps {
    isLoading: boolean;
    patients: PatientModel[];
    cureList: InsulinInjectActionVw[];
    cdate: Date;
    onChangeDate: (date: Date) => void;
    onRefreshData: () => void;
    onCureFinish: (item: InsulinInjectActionVw) => void;
    onItemSelect: (item: InsulinInjectActionVw) => void;
    onSelectPatient: (pItem: PatientModel) => void;
}
type Props = ThemedComponentProps & ComponentProps;
interface State {
    refreshing: boolean;
    visibleModal: boolean;
    endDate: Date;
    bedSearch: boolean,
    bedString: string;
    curCure: InsulinInjectActionVw;
}
class MyComponent extends React.Component<Props, State> {
    private _maxTime: Date;
    constructor(props) {
        super(props);
        this._maxTime = UTILS.getLastDateofMonth(undefined);
        this.state = { refreshing: false, visibleModal: false, curCure: undefined, endDate: this.props.cdate, bedSearch: false, bedString: '' };
    }
    private changeSearch = (val: string) => {
        this.setState({ bedString: val });
    }
    private renderCompleteModal = () => {
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
        const { themedStyle } = this.props;
        return (
            <View style={{
                flexDirection: 'column'
            }}>
                <View style={commonStyles.toolbarContainer}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => this.onNavDatePress(true)}>
                            <Text style={{
                                color: themes["App Theme"]["color-primary-500"],
                                paddingLeft: 6
                            }}>
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
                            }}>
                                ▶
                        </Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => {
                        const bedStatus = !this.state.bedSearch;
                        this.setState({ bedSearch: bedStatus, bedString: '' });
                        // this.props.onSearchPatient('');
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 9 }}>
                            {this.state.bedSearch ? (
                                <FontAwesomeIcon icon={faTimes} size={20} color={themes["App Theme"]["color-primary-500"]} />
                            ) : (
                                    <SvgUri
                                        width="32" height="32"
                                        svgXmlData={UserSearchSvg}
                                    />
                                )}
                        </View>
                    </TouchableOpacity>
                </View>

                {this.state.bedSearch && (
                    <View>
                        <Input placeholder={Strings.message.input_bedSearch} value={this.state.bedString}
                            onChangeText={val => this.changeSearch(val)}
                            textStyle={{ paddingVertical: 1 }}
                        />
                    </View>
                )}
            </View>

        );
    };
    private cureCompleteAction() {
        this.setState({ visibleModal: false });
        this.props.onCureFinish(this.state.curCure);
    }
    private showCompleteModal(item: InsulinInjectActionVw) {
        this.setState({ visibleModal: true, curCure: item });
    }
    private renderAdviceItems = (items: InsulinInjectActionVw[], advices: number[], date: string) => {
        const themedStyle = this.props.themedStyle;
        const day = UTILS.getFormattedDate(date, 7);
        if (items.length > 0) {
            const fItem = items[0];
            const advice = fItem.vm_advice_obj.split('$');
            let cure_kind = Strings.common.str_insulin_cure1;
            if (advice[1] === '2') {
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
                <View key={keyId} style={{
                    marginBottom: 3
                }}>
                    <View style={[themedStyle.pItemAdvice
                    ]} >
                        <Text style={{ marginLeft: 10 }} category="s1">{`${cure_kind}(${day})`}</Text>
                        <Text style={{ marginLeft: 10 }} category="s2" appearance="hint">{`${update_at} : 方案变更`}</Text>
                    </View>
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
        /*  return advices.map(advice_id => {
             const ad_injects = items.filter(_it => _it.advice_id === advice_id);
             // console.log(ad_injects);
             if (ad_injects.length > 0) {
                 // console.log(ad_injects[0].updated_at);
                 const update_at = UTILS.getFormattedDate(ad_injects[0].updated_at, 2);
                 const advice = ad_injects[0].vm_advice_obj.split('$');
                 let cure_kind = Strings.common.str_insulin_cure1;
                 if (advice[1] === '2') {
                     cure_kind = Strings.common.str_insulin_cure2;
                 }
                 // return advice.length > 0 && advice[1] === '1';
                 const comments = ad_injects.reduce((rs, adItem) => {
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
                     return rs;
                 }, []);
                 return (
                     <View key={advice_id} style={{
                         marginBottom: 5, borderBottomWidth: 1,
                         borderBottomColor: themes["color-basic-600"],
                     }}>
                         <View style={themedStyle.pItemAdvice} >
                             <Text style={{ marginLeft: 10 }} category="s1">{`${cure_kind}(${day})`}</Text>
                             <Text style={{ marginLeft: 10 }} category="s2" appearance="hint">{`${update_at} : 方案变更`}</Text>
                         </View>
                         {
                             ad_injects.map((_item, _id) => {
                                 return this.renderCureItem(_item, _id);
                             })
                         }
                         <Text style={{ marginLeft: 10 }} category="s2" appearance="hint">{`备注: \n${comments.join('\n')}`}</Text>
                     </View>
                 );
             }
         }); */
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
                    {/* <TouchableOpacity onPress={() => {
                        this.onItemSelect(item);
                    }}> */}
                    <Text style={themedStyle.linkItem} category="s1">{`${GLOBAL.INSULIN_TIME[item.point_kind]}`}</Text>
                    <Text style={themedStyle.linkItem}>{`${stimes}`}</Text>
                    {/* </TouchableOpacity> */}
                </View>
                <View style={[themedStyle.col, { width: sWidth }]}>
                    <Text style={[themedStyle.detailItem, { paddingLeft: 4 }]} category="p1">{`${item.vw_medicine_name}`}</Text>
                </View>
                <View style={[themedStyle.col, { width: oWidth }]}>
                    <Text style={themedStyle.detailItem} category="p1">{`${item.insulin_amount}U`}</Text>

                </View>
                <View style={[themedStyle.col, { width: oWidth, marginRight: 4 }]}>
                    <Button size='small' disabled={item.exec_flag === 1} onPress={(_evt) => {
                        this.showCompleteModal(item);
                    }}>{`${item.exec_flag === 0 ? Strings.common.str_uncompleted : Strings.common.str_completed}`}</Button>
                </View>
            </View>
        )
        // })
    }
    private onSelectPatient = (pItem: PatientModel) => {
        this.props.onSelectPatient(pItem);
    }
    private renderItem = (pItem, index) => {
        const patient = pItem as PatientModel;
        const tday = moment(this.state.endDate).format('YYYY-MM-DD');
        const nday = moment(this.state.endDate).add(1, 'days').format('YYYY-MM-DD');
        const myCureList = this.props.cureList.filter(_it => {
            const advice = _it.vm_advice_obj.split('$');
            return advice.length > 0 && advice[3] === patient.id.toString();
        });
        const to_cures = myCureList.filter(_it => _it.ex_date.indexOf(tday) === 0);
        const nx_cures = myCureList.filter(_it => _it.ex_date.indexOf(nday) === 0);

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

        const themedStyle = this.props.themedStyle;
        if (cure1.length == 0 && cure2.length == 0 && ncure1.length == 0 && ncure2.length == 0) return;
        return (
            <View style={[themedStyle.container, { backgroundColor: "white" }]} key={index}>
                <View style={themedStyle.pItemRow}>
                    <View style={{ flexDirection: "row" }}>
                        <FontAwesomeIcon icon={faUserClock} size={24} style={{
                            marginRight: 4,
                            marginLeft: 8
                        }} />
                        <Text style={[themedStyle.pItemTitle, { width: 60 }]} category="h5">{`${patient.bed_number}床`}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        this.onSelectPatient(pItem);
                    }}>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={themedStyle.pItemTitle} category="h5">{`${patient.name}`}</Text>
                            <FontAwesomeIcon icon={faArrowRight} size={20} style={{ marginTop: 5 }} />
                        </View>
                    </TouchableOpacity>
                </View>
                {cure1.length > 0 && this.renderAdviceItems(cure1, cure1_advice_ids, tday)}
                {cure2.length > 0 && this.renderAdviceItems(cure2, cure2_advice_ids, tday)}
                {ncure1.length > 0 && this.renderAdviceItems(ncure1, ncure1_advice_ids, nday)}
                {ncure2.length > 0 && this.renderAdviceItems(ncure2, ncure2_advice_ids, nday)}
            </View>
        )

    }
    updateState = (props: Props) => {
        this.setState({ refreshing: props.isLoading });
    }
    ListViewItemSeparator = () => {
        return <View style={{ height: 45, width: "100%", backgroundColor: "transparent" }} />;
    }

    componentWillReceiveProps(nextProps: Props) {
        this.updateState(nextProps);
    }
    public onRefresh = () => {
        // if (!this.state.refreshing) {
        //     this.setState({ refreshing: true }, () => this.props.onRefreshData());
        // }
        this.props.onRefreshData();
    };
    render() {
        const themedStyle = this.props.themedStyle;
        const search = this.state.bedString;
        let patients = this.props.patients;
        if (search) {
            patients = this.props.patients.filter(_it => {
                return _it.name.indexOf(search) > -1 || _it.bed_number.indexOf(search) > -1;
            });
        }
        return (
            <View style={{ flex: 1 }}>
                {this.renderToolbar()}
                {this.props.isLoading && GLOBAL.SHOW_LOADING ? (
                    <View style={commonStyles.progressBar}>
                        <ProgressBar />
                    </View>
                ) : (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                ItemSeparatorComponent={this.ListViewItemSeparator}
                                renderItem={({ item, index }) => this.renderItem(item, index)}
                                numColumns={1}
                                contentContainerStyle={themedStyle.contentContainer}
                                initialNumToRender={10}
                                data={patients}
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh}
                            />
                        </View>
                    )}
                <Modal isVisible={this.state.visibleModal}
                    onBackdropPress={() => this.setState({ visibleModal: false })}
                    onSwipeComplete={() => this.setState({ visibleModal: false })}
                    onBackButtonPress={() => this.setState({ visibleModal: false })}
                    style={{ alignItems: "center", borderRadius: 5 }}
                    swipeDirection="left">
                    {this.renderCompleteModal()}
                </Modal>
            </View>
        )
    }
}
export const CureTasks = withStyles(MyComponent, (theme: ThemeType) => ({
    contentContainer: {
        paddingHorizontal: 3,
        // paddingVertical: 3
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
        flex: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    pItemAdvice: {
        flexDirection: "column",
        paddingVertical: 4,
        borderColor: themes["App Theme"]["mycolor-lightgray"],
        borderBottomWidth: 1,
        borderTopWidth: 1
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
