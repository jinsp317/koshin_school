import React from "react";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import QRCode from "react-native-qrcode";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import Strings from "@src/assets/strings";

import BarcodeScannerView from "react-native-scan-barcode";
import { PatientModel, RequestPatientModel, MonitorPatientModel } from "@src/core/model";
import ProgressBar from "@src/components/common/progressBar.component";
import commonStyles from "../styles/common";
import { database } from "@src/core/utils/database";
import { HospitalModel } from '@src/core/model/hospital.model';
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

interface State {
  isLoading: boolean;
}
export class ScanBarcodeScreen extends React.Component<NavigationScreenProps, State> {
  private _requestParams: RequestPatientModel;
  private _hospitalInfo: HospitalModel;
  public state: State = {
    isLoading: false
  };
  componentDidMount() {
    database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
      this._hospitalInfo = _hItem;
    });
  }
  private downloadPatientInfo = () => {
    // this._requestParams = {
    //   patients: [pid]
    // };

    this.setState({ isLoading: true });
    // const dataHelper = GLOBAL.isOffline ? database.patientsHelper : httpHelper;
    const dataHelper = database.patientsHelper;
    dataHelper
      .downloadMonitorPatients(this._requestParams)
      .then(responseJson => {
        const result: MonitorPatientModel[] = responseJson.result;
        if (result && result.length > 0) {
          const patient = result[0];
          const taskPatient = {
            ...patient,
            record: {
              id: undefined,
              patient_id: patient.id,
              point: undefined,
              value: undefined,
              time: undefined
            }
          };
          this.props.navigation.replace("Monitor GlucoseA", {
            taskPatient: taskPatient,
            onGoBack: this.props.navigation.state.params.onGoBack
          });

          this.setState({
            isLoading: false
          });
        } else {
          UTILS.showToast(Strings.common.str_opFailed);
          this.setState({ isLoading: false });
        }
      })
      .catch(exception => {
        if (__DEV__) console.error(exception);
        UTILS.showToast(Strings.common.str_opFailed);
        this.setState({ isLoading: false });
      });
  };
  private barcodeReceived = e => {
    if (__DEV__) {
      console.info("Barcode: ", e.data);
      console.info("Type: ", e.type);
    }
    let cdata: string = e.data;
    cdata = cdata.replace(this._hospitalInfo.barcode_prefix, "");
    cdata = cdata.replace(this._hospitalInfo.barcode_suffix, "");
    let department_id, bed_number, mobile, patient_number;
    if (this._hospitalInfo.barcode_index == 1) {

      department_id = cdata.split('-')[0];
      bed_number = cdata.split('-')[0];
      this._requestParams = {
        departments: [department_id],
        bed_number: bed_number
      }

    } else if (this._hospitalInfo.barcode_index == 2) {
      this._requestParams = {
        mobile: cdata
      }
      // this._requestParams.mobile = cdata;
    } else if (this._hospitalInfo.barcode_index == 3) {
      this._requestParams = {
        patient_number: cdata
      }
      // this._requestParams.patient_number = cdata;
    }
    // const data: string = e.data;
    // const pid = Number(data.split("-")[0]);

    if (cdata != '') {
      this.downloadPatientInfo();
    } else {
      UTILS.showToast(Strings.common.str_opFailed);
      this.props.navigation.goBack();
    }
  };

  public render(): React.ReactNode {
    if (this.state.isLoading) {
      return (
        <View style={commonStyles.progressBar}>
          <ProgressBar />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <BarcodeScannerView
          onBarCodeRead={this.barcodeReceived}
          style={{ width: "100%", height: "100%" }}
          torchMode={"off"}
          cameraType={"back"}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  }
});
