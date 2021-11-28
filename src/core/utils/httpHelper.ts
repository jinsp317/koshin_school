// implementation of httpHelper.ts by @rihyokju 20190718
// original implementation used an external library for network requests, this uses fetch()
import {
	RequestFPMParamsModel,
	RequestPatientModel,
	RequestInhospitalModel,
	RequestChangeDepartModel,
	RequestConsultModel,
	RequestDoctorsOrderModel,
	RequestGlucoseMonitorModel,
	RequestVisitModel,
	PatientModel,
	MANAGE_KIND,
	DepartmentModel,
	ObjectModel,
	RequestTaskDataModel,
	ResponseModel,
	RequestSyncDataModel,
	ResponseSyncModel,
	Http_Error,
} from '@src/core/model';

import GLOBAL from '@src/core/globals';
import { alert } from '../app_utils';

export interface HttpHelper {
	setServerURL(url: string): void;
	// connect
	isServerAlive(): Promise<unknown>;

	//
	signIn(formData: FormData): Promise<unknown>;
	logout(): Promise<unknown>;

	// 添加患者 办理入出院 删除 修改
	managePatient(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;

	//
	setPatientNotice(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;

	// 随测记录
	downloadFreePatientMeasure(requesetParams: RequestFPMParamsModel | undefined): Promise<unknown>;
	manageFreePatientMeasure(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;
	getFPMRecordCount(requesetParams: RequestFPMParamsModel): Promise<unknown>;

	// 患者记录
	downloadPatients(requesetParams: RequestPatientModel | undefined): Promise<unknown>;
	getPatientsRecordCount(requesetParams: RequestPatientModel): Promise<unknown>;

	downloadMonitorPatients(requesetParams: RequestPatientModel): Promise<unknown>;
	downloadPatientsByMobile(mobile: string): Promise<unknown>;

	// 住院记录
	downloadInhosptials(requestParams: RequestInhospitalModel | undefined): Promise<unknown>;
	// 医嘱记录
	downloadDoctorsOrders(requestParams: RequestDoctorsOrderModel | undefined): Promise<unknown>;
	// 会诊记录
	downloadConsults(requestParams: RequestConsultModel | undefined): Promise<unknown>;
	manageConsult(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;
	// 随访记录
	downloadVisits(requestParams: RequestVisitModel | undefined): Promise<unknown>;
	manageVisit(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;
	// 血糖记录
	downloadGlucoseMonitors(requestParams: RequestGlucoseMonitorModel | undefined): Promise<unknown>;
	getGlucoseMonitorsRecordCount(requesetParams: RequestGlucoseMonitorModel): Promise<unknown>;
	manageGlucoseMonitor(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;
	manageDataMonitor(formData: FormData): Promise<unknown>;
	manageDataMonitorNw(formData: FormData): Promise<unknown>;
	downloadDataMonitor(formData: FormData): Promise<unknown>;

	getHasMonitorDays(patient_id: number, has_record_days: number, hospital_id: number): Promise<unknown>;

	// downloadPatientsMonitor(requestParams: RequestGlucoseMonitorModel | undefined): Promise<unknown>

	// 转科记录
	downloadChangeDeparts(requestParams: RequestChangeDepartModel | undefined): Promise<unknown>;

	// user
	downloadUsers(onlySelf: boolean): Promise<unknown>;
	manageUser(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;

	// department
	downloadDepartments(requestParams: ObjectModel): Promise<unknown>;
	downloadDoctors(requestParams: ObjectModel): Promise<unknown>;
	downloadNurses(requestParams: ObjectModel): Promise<unknown>;

	// monitor task
	downloadTasks(requesetParams: RequestTaskDataModel): Promise<unknown>;

	// test quality
	// 血糖记录
	// downloadTestData(requestParams: RequestGlucoseMonitorModel | undefined): Promise<unknown>
	downloadTestRange(): Promise<unknown>;
	manageTestData(formData: FormData, kind: MANAGE_KIND): Promise<unknown>;

	// 版本管理
	downloadVersionInfo(): Promise<unknown>;
	// point
	downloadPointInfo(): Promise<unknown>;
	// 0926 id, name, from_time, to_time, flag

	// help
	downloadHospital(): Promise<unknown>;

	// download sync table data
	downloadSyncData(reqeust: RequestSyncDataModel): Promise<any>;
	getSyncDataCount(reqeust: RequestSyncDataModel): Promise<any>;
}

class HttpHelperImpl implements HttpHelper {
	private SERVER_URL: string;

	constructor() {
		this.setServerURL(GLOBAL.server_ip);
	}
	public setServerURL = (ip: string) => {
		this.SERVER_URL = `http://${ip}/api/`;
	};
	myFetch = (url: RequestInfo, method: string, formData: FormData, token = true) => {
		if (token) {
			if (formData == undefined) formData = new FormData();
			formData.append('token', GLOBAL.token);
		}
		const options = {
			method: method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'multipart/form-data'
			},
			body: formData
		};

		return new Promise((resolve, reject) => {
			fetch(url, options)
				.then((response) => {
					if (response.status == 200) {
						try {
							const json = response.json();
							return json;
						} catch (err) {
							reject(response.status);
						}
					} else {
						/// console.log(response);
						if (__DEV__) { console.log(response) }
						const status = response.status;
						if (status >= 500) {
							reject(Http_Error.Server_Error);
						} else if (status == 401) {
							reject(Http_Error.Authority_Error);
						} else {
							reject(Http_Error.Other_Error);
						}
					}

				})
				.then((json) => resolve(json)) // flatten resultSet for return from stat endpoints
				.catch((error) => reject(error));
		});
	};
	myFetchJson = (url: RequestInfo, jsonData: string, flatten = false) => {
		/**
	   body: JSON.stringify({
		id: data.username,
		pswd: data.password,
	  }),
	 */
		const options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: jsonData
		};

		return new Promise((resolve, reject) => {
			fetch(url, options)
				.then((response) => response.json())
				.then(
					(json) =>

						flatten ? this.flattenResult(json.resultSets || [json.resultSet]) :
							resolve(json)
				) // flatten resultSet for return from stat endpoints
				.then((flattened) => resolve(flattened))
				.catch((error) => reject(error));
		});
	};

	objectToQueryString = (obj) => {
		return Object.keys(obj)
			.map(function (key) {
				const value = encodeURIComponent(obj[key]);
				return key + '=' + value;
			})
			.join('&');
	};

	flattenResult = (resultSets) => {
		return new Promise((resolve, reject) => {
			const flattened = {};
			resultSets.forEach((result, i) => {
				flattened[result.name] = result.rowSet.map((row, j) => {
					const mappedRow = {};

					row.forEach((value, k) => {
						const key = result.headers[k].toLowerCase();
						mappedRow[key] = value;
					});

					return mappedRow;
				});
			});

			return resolve(flattened);
		});
	};

	isServerAlive = () => {
		const url = this.SERVER_URL + 'alive';
		return this.myFetch(url, 'GET', undefined, false);
	};

	signIn = (formData: FormData) => {
		const url = this.SERVER_URL + 'login';
		return this.myFetch(url, 'POST', formData, false);
	};
	logout = () => {
		const params = `?token=${GLOBAL.token}`;
		const url = this.SERVER_URL + 'logout' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	manageFreePatientMeasure = (formData: FormData, kind: MANAGE_KIND) => {
		// let addParams = this.objectToQueryString(formData)
		let url = this.SERVER_URL;
		if (kind == MANAGE_KIND.ADD) url = this.SERVER_URL + 'freemeasure';
		else if (kind == MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'freemeasure/update';
		else if (kind == MANAGE_KIND.DEL) url = this.SERVER_URL + 'freemeasure/delete';
		return this.myFetch(url, 'POST', formData);
	};
	getFPMParams = (reqParams: RequestFPMParamsModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.begin_time) params += `&begin_time=${reqParams.begin_time}`;
			if (reqParams.end_time) params += `&end_time=${reqParams.end_time}`;
			if (reqParams.from) params += `&from=${reqParams.from}`;
			if (reqParams.count) params += `&count=${reqParams.count}`;
			if (reqParams.user_id) params += `&user_id=${reqParams.user_id}`;
			if (reqParams.point) params += `&point=${reqParams.point}`;
			if (reqParams.free_patient) {
				if (reqParams.free_patient.name) params += `&name=${reqParams.free_patient.name}`;
				if (reqParams.free_patient.cert_num) params += `&cert_num=${reqParams.free_patient.cert_num}`;
				if (reqParams.free_patient.cert_kind) params += `&cert_kind=${reqParams.free_patient.cert_kind}`;
			}
		}
		return params;
	};
	downloadFreePatientMeasure = (reqParams: RequestFPMParamsModel | undefined) => {
		const url = this.SERVER_URL + 'freemeasure' + this.getFPMParams(reqParams);
		return this.myFetch(url, 'GET', undefined, false);
	};

	getFPMRecordCount = (reqParams: RequestFPMParamsModel) => {
		const url = this.SERVER_URL + 'freemeasure/count' + this.getFPMParams(reqParams);
		return this.myFetch(url, 'GET', undefined, false);
	};

	getPatientsParams = (reqParams: RequestPatientModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.begin_time) params += `&begin_time=${reqParams.begin_time}`;
			if (reqParams.end_time) params += `&end_time=${reqParams.end_time}`;
			if (reqParams.from) params += `&from=${reqParams.from}`;
			if (reqParams.count) params += `&count=${reqParams.count}`;
			if (reqParams.patient) {
				if (reqParams.patient.is_in != undefined) params += `&is_in=${reqParams.patient.is_in}`;
				if (reqParams.patient.name) params += `&name=${reqParams.patient.name}`;
				if (reqParams.patient.doctor_name) params += `&doctor_name=${reqParams.patient.doctor_name}`;
				if (reqParams.patient.doctor_id) params += `&doctor_id=${reqParams.patient.doctor_id}`;
				if (reqParams.patient.nurse_id) params += `&nurse_id=${reqParams.patient.nurse_id}`;
			}
			if (reqParams.has_advice != undefined) {
				params += `&has_advice=${reqParams.has_advice ? 1 :
						0}`;
			}
			if (reqParams.departments && reqParams.departments.length > 0) {
				params += `&departments=${JSON.stringify(reqParams.departments)}`;
			}
			if (reqParams.patients && reqParams.patients.length > 0) {
				params += `&patients=${JSON.stringify(reqParams.patients)}`;
			}
			if (reqParams.no_record_begin_time) params += `&no_record_begin_time=${reqParams.no_record_begin_time}`;
			if (reqParams.no_record_end_time) params += `&no_record_end_time=${reqParams.no_record_end_time}`;

			if (reqParams.hospital_id >= 0) params += `&hospital_id=${reqParams.hospital_id}`;
		}
		return params;
	};
	downloadPatients = (reqParams: RequestPatientModel | undefined) => {
		const url = this.SERVER_URL + 'patient' + this.getPatientsParams(reqParams);
		return this.myFetch(url, 'GET', undefined, false);
	};
	getPatientsRecordCount = (reqParams: RequestPatientModel) => {
		const url = this.SERVER_URL + 'patient/count' + this.getPatientsParams(reqParams);
		return this.myFetch(url, 'GET', undefined, false);
	};
	// 住院记录
	downloadInhosptials = (reqParams: RequestInhospitalModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.patient_id) params += `&patient_id=${reqParams.patient_id}`;
			if (reqParams.hospital_id >= 0) params += `&hospital_id=${reqParams.hospital_id}`;
		}
		const url = this.SERVER_URL + 'io/hospital' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	// 医嘱记录
	downloadDoctorsOrders = (reqParams: RequestDoctorsOrderModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.patient_id) params += `&patient_id=${reqParams.patient_id}`;
			if (reqParams.hospital_id >= 0) params += `&hospital_id=${reqParams.hospital_id}`;
		}
		const url = this.SERVER_URL + 'advice' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	// 会诊记录
	downloadConsults = (reqParams: RequestConsultModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.patient_id) params += `&patient_id=${reqParams.patient_id}`;
			if (reqParams.hospital_id >= 0) params += `&hospital_id=${reqParams.hospital_id}`;
		}
		const url = this.SERVER_URL + 'consult' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	manageConsult = (formData: FormData, kind: MANAGE_KIND) => {
		let url = this.SERVER_URL;
		if (kind == MANAGE_KIND.ADD) url = this.SERVER_URL + 'consult';
		else if (kind == MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'consult/update';
		else if (kind == MANAGE_KIND.DEL) url = this.SERVER_URL + 'consult/delete';

		return this.myFetch(url, 'POST', formData);
	};

	// 随访记录
	downloadVisits = (reqParams: RequestVisitModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.patient_id) params += `&patient_id=${reqParams.patient_id}`;
			if (reqParams.hospital_id >= 0) params += `&hospital_id=${reqParams.hospital_id}`;
		}
		const url = this.SERVER_URL + 'visit' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	manageVisit = (formData: FormData, kind: MANAGE_KIND) => {
		let url = this.SERVER_URL;
		if (kind == MANAGE_KIND.ADD) url = this.SERVER_URL + 'visit';
		else if (kind == MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'visit/update';
		else if (kind == MANAGE_KIND.DEL) url = this.SERVER_URL + 'visit/delete';
		return this.myFetch(url, 'POST', formData);
	};

	// 转科记录
	downloadChangeDeparts = (reqParams: RequestChangeDepartModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.inhospital_id) params += `&inhospital_id=${reqParams.inhospital_id}`;
			if (reqParams.hospital_id >= 0) params += `&hospital_id=${reqParams.hospital_id}`;
		}
		const url = this.SERVER_URL + 'changeDepart' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	// 血糖记录
	getGlucoseParams = (reqParams: RequestGlucoseMonitorModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.patient_id) params += `&patient_id=${reqParams.patient_id}`;
			if (reqParams.begin_time) params += `&begin_time=${reqParams.begin_time}`;
			if (reqParams.end_time) params += `&end_time=${reqParams.end_time}`;
			if (reqParams.from) params += `&from=${reqParams.from}`;
			if (reqParams.count) params += `&count=${reqParams.count}`;

			if (reqParams.user_id) params += `&user_id=${reqParams.user_id}`;
			if (reqParams.points) params += `&points=${JSON.stringify(reqParams.points)}`;
			if (reqParams.is_group) params += `&is_group=${reqParams.is_group}`;
			if (reqParams.department_id >= 0) params += `&department_id=${reqParams.department_id}`;
			if (reqParams.doctor_id > 0) params += `&doctor_id=${reqParams.doctor_id}`;
			if (reqParams.nurse_id > 0) params += `&nurse_id=${reqParams.nurse_id}`;
			if (reqParams.departments && reqParams.departments.length > 0) {
				params += `&departments=${JSON.stringify(reqParams.departments)}`;
			}
			if (reqParams.patients && reqParams.patients.length > 0) {
				params += `&patients=${JSON.stringify(reqParams.patients)}`;
			}
			if (reqParams.hospital_id >= 0) params += `&hospital_id=${reqParams.hospital_id}`;
		}
		return params;
	};
	downloadGlucoseMonitors = (reqParams: RequestGlucoseMonitorModel | undefined) => {
		const url = this.SERVER_URL + 'record' + this.getGlucoseParams(reqParams);
		return this.myFetch(url, 'GET', undefined, false);
	};
	getGlucoseMonitorsRecordCount = (reqParams: RequestGlucoseMonitorModel) => {
		const url = this.SERVER_URL + 'record/count' + this.getGlucoseParams(reqParams);
		return this.myFetch(url, 'GET', undefined, false);
	};

	getHasMonitorDays = (patient_id: number, has_reocrd_days: number, hospital_id: number) => {
		let url =
			this.SERVER_URL +
			`record?token=${GLOBAL.token}&patient_id=${patient_id}&has_record_days=${has_reocrd_days}`;
		if (hospital_id) {
			url += `&hospital_id=${hospital_id}`;
		}
		return this.myFetch(url, 'GET', undefined, false);
	};
	manageGlucoseMonitor = (formData: FormData, kind: MANAGE_KIND) => {
		let url = this.SERVER_URL;
		if (kind == MANAGE_KIND.ADD) url = this.SERVER_URL + 'record';
		else if (kind == MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'record/update';
		else if (kind == MANAGE_KIND.DEL) url = this.SERVER_URL + 'record/delete';
		// alert(url);
		// console.log();
		return this.myFetch(url, 'POST', formData);
	};
	manageDataMonitor = (formData: FormData) => {
		const url = this.SERVER_URL + 'records/syn';
		if (__DEV__) console.info(formData);
		return this.myFetch(url, 'POST', formData);
	};
	manageDataMonitorNw = (formData: FormData) => {
		const url = this.SERVER_URL + 'records/synchronizeNw';
		// const url = this.SERVER_URL + 'records/synNw';
		// console.log(formData);
		return this.myFetch(url, 'POST', formData);
	};
	downloadDataMonitor = (formData: FormData) => {
		const url = this.SERVER_URL + 'records/synchronize';
		if (__DEV__) console.info(formData);
		return this.myFetch(url, 'POST', formData);
	};
	// 添加患者 办理入出院 删除 修改
	getPatientParams = (reqParams: RequestPatientModel | undefined) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.patient.id) params += `&patient_id=${reqParams.patient.id}`;
			if (reqParams.patient.mobile) params += `&mobile=${reqParams.patient.mobile}`;
		}
		return params;
	};

	managePatient = (formData: FormData, kind: MANAGE_KIND) => {
		let url = this.SERVER_URL;
		if (kind == MANAGE_KIND.ADD) url = this.SERVER_URL + 'patient';
		else if (kind == MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'patient/update';
		else if (kind == MANAGE_KIND.DEL) url = this.SERVER_URL + 'patient/delete';
		else if (kind == MANAGE_KIND.IN) url = this.SERVER_URL + 'patient/in';
		else if (kind == MANAGE_KIND.OUT) url = this.SERVER_URL + 'patient/out';

		return this.myFetch(url, 'POST', formData);
	};

	setPatientNotice = (formData: FormData, kind: MANAGE_KIND) => {
		let url = this.SERVER_URL + 'notice';
		if (kind === MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'notice/update';
		if (kind === MANAGE_KIND.DEL) url = this.SERVER_URL + 'notice/delete';

		return this.myFetch(url, 'POST', formData);
	};
	// user
	// friends: 자기과내의 모든 유저, child: 자기소속의 유저
	downloadUsers = (onlySelf: boolean) => {
		const subUrl = onlySelf ? this.SERVER_URL + 'user' : this.SERVER_URL + 'user/friends'; // child";
		const url = subUrl + `?token=${GLOBAL.token}`;
		return this.myFetch(url, 'GET', undefined, false);
	};

	manageUser = (formData: FormData, kind: MANAGE_KIND) => {
		let url = this.SERVER_URL;
		if (kind == MANAGE_KIND.ADD) url = this.SERVER_URL + 'user/xxx';
		else if (kind == MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'user/profile';
		else if (kind == MANAGE_KIND.DEL) url = this.SERVER_URL + 'user/xxx';

		return this.myFetch(url, 'POST', formData);
	};

	// department
	downloadDepartments = (reqParams: ObjectModel) => {
		let params = `?token=${GLOBAL.token}&member=1`;
		if (reqParams) {
			if (reqParams.id) params += `&id=${reqParams.id}`;
		}
		const url = this.SERVER_URL + 'department' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	downloadDoctors = (reqParams: ObjectModel) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.id) params += `&id=${reqParams.id}`;
		}
		const url = this.SERVER_URL + 'department/doctor' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	downloadNurses = (reqParams: ObjectModel) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.id) params += `&id=${reqParams.id}`;
		}
		const url = this.SERVER_URL + 'department/nurse' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};

	// task
	downloadTasks = (reqParams: RequestTaskDataModel) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			if (reqParams.day) params += `&day=${reqParams.day}`;
			if (reqParams.is_completed >= 0) params += `&is_completed=${reqParams.is_completed}`;
			if (reqParams.point >= 0) params += `&point=${reqParams.point}`;
			if (reqParams.departments && reqParams.departments.length > 0) {
				params += `&departments=${JSON.stringify(reqParams.departments)}`;
			}
			if (reqParams.patients && reqParams.patients.length > 0) {
				params += `&patients=${JSON.stringify(reqParams.patients)}`;
			}
			if (reqParams.is_charge) params += `&is_charge=${reqParams.is_charge}`;
			if (reqParams.patient_id) params += `&patient_id=${reqParams.patient_id}`;
		}
		const url = this.SERVER_URL + 'task' + params;
		if (__DEV__) console.log(params);
		return this.myFetch(url, 'GET', undefined, false);
	};

	downloadPatientsByMobile = (mobile: string) => {
		let params = `?token=${GLOBAL.token}`;
		if (mobile) params += `&mobile=${mobile}`;
		const url = this.SERVER_URL + 'patient' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	// monitor patients
	downloadMonitorPatients = (reqParams: RequestPatientModel) => {
		let params = `?token=${GLOBAL.token}`;
		// console.log('downloadMonitorPatients');
		if (reqParams) {
			params += `&is_in=1&is_detail=1`;
			// if (reqParams.has_advice >= 0) params += `&has_advice=${reqParams.has_advice}`;
			if (reqParams.departments && reqParams.departments.length > 0) {
				params += `&departments=${JSON.stringify(reqParams.departments)}`;
			}
			if (reqParams.patients && reqParams.patients.length > 0) {
				params += `&patients=${JSON.stringify(reqParams.patients)}`;
			}
			if (reqParams.no_record_begin_time) params += `&no_record_begin_time=${reqParams.no_record_begin_time}`;
			if (reqParams.no_record_end_time) params += `&no_record_end_time=${reqParams.no_record_end_time}`;
			if (reqParams.doctor_id) params += `&doctor_id=${reqParams.doctor_id}`;
			if (reqParams.nurse_id) params += `&nurse_id=${reqParams.nurse_id}`;
		}
		const url = this.SERVER_URL + 'patient' + params;
		if (__DEV__) console.info(params);
		return this.myFetch(url, 'GET', undefined, false);
	};

	downloadTestRange = () => {
		const params = `?token=${GLOBAL.token}`;
		const url = this.SERVER_URL + 'control/range' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
	manageTestData = (formData: FormData, kind: MANAGE_KIND) => {
		let url = this.SERVER_URL;
		if (kind == MANAGE_KIND.ADD) url = this.SERVER_URL + 'control';
		else if (kind == MANAGE_KIND.DEL) url = this.SERVER_URL + 'control/delete';
		else if (kind == MANAGE_KIND.MODIFY) url = this.SERVER_URL + 'control/update';

		return this.myFetch(url, 'POST', formData);
	};
	// version
	// monitor patients
	downloadVersionInfo = () => {
		const url = this.SERVER_URL + 'version';
		return this.myFetch(url, 'GET', undefined, false);
	};

	// point
	downloadPointInfo = () => {
		const url = this.SERVER_URL + `point?token=${GLOBAL.token}`;
		return this.myFetch(url, 'GET', undefined, false);
	};
	// point
	downloadHospital = () => {
		const url = this.SERVER_URL + `hospital?token=${GLOBAL.token}`;
		return this.myFetch(url, 'GET', undefined, false);
	};

	// synchronize
	getSyncDataCount = (reqParams: RequestSyncDataModel) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			params += `&table=${reqParams.table}`;
			if (reqParams.time) params += `&time=${reqParams.time}`;
		}
		const url = this.SERVER_URL + 'synchronize/count' + params;
		if (__DEV__) console.info('getSyncDataCount Url:', url);
		return this.myFetch(url, 'GET', undefined, false);
	};

	downloadSyncData = (reqParams: RequestSyncDataModel) => {
		let params = `?token=${GLOBAL.token}`;
		if (reqParams) {
			params += `&table=${reqParams.table}`;
			if (reqParams.time) params += `&time=${reqParams.time}`;
			if (reqParams.from) params += `&from=${reqParams.from}`;
			if (reqParams.count) params += `&count=${reqParams.count}`;
		}
		const url = this.SERVER_URL + 'synchronize' + params;
		return this.myFetch(url, 'GET', undefined, false);
	};
}

// Export a single instance of HttpHelper
export const httpHelper: HttpHelper = new HttpHelperImpl();
