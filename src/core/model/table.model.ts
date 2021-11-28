import { TableModel } from './object.model';
export interface InsulinKind extends TableModel {
    name: string;
}
export interface InsulinMedcine extends TableModel {
    name: string;
    chemical_name: string;
    isl_kind_id?: number;
    del_flag?: number;
}
export interface InsulinAdvice extends TableModel {
    patient_id: number;
    hospital_id: number;
    user_id?: number;
    from_time?: string;
    to_time?: string;
    his_code?: string;
    inject_kind?: number;
    del_flag?: number;
}
export interface InsulinInjectAction extends TableModel {
    advice_id?: number;
    kind_id?: number;
    insulin_id?: number;
    hospital_id?: number;
    insulin_amount?: number;
    org_flag?: number;
    point_kind?: number;
    from_time?: string;
    to_time?: string;
    del_flag?: number;
    exec_flag?: number;
    s_flag?: number;
    ex_date?: string;
    syn_flag?: number;
    exec_id?: number;
    comment?: string;
    exec_time?: string;
}
export interface AdviceRecord extends TableModel {
    patient_id: number;
    user_id?: number;
    from_time?: string;
    to_time?: string;
    is_long?: number;
    is_point?: number;
    state?: number;
    hospital_id?: number;
    his_code?: string;
    kind_enum?: string;
}
export interface ConsultRecord extends TableModel {
    patient_id: number;
    department_id?: number;
    requester_id?: number;
    type?: number;
    summary?: string;
    consult_time?: string;
    state?: number;
    image?: string;
    file?: string;
    result?: string;
    del_flag?: number;
}
export interface Day extends TableModel {
    advice_id: number;
    day?: number;
}
export interface DepartmentGroup extends TableModel {
    hospital_id: number;
    department_id?: number;
    group_id?: number;
    del_flag?: number;
}
export interface Department extends TableModel {
    hospital_id: number;
    name?: string;
    telephone?: string;
    default_user_id?: number;
    is_endocrinology?: number;
    his_code?: number;
    target_before_min?: number;
    target_after_min?: number;
    target_after_max?: number;
    alarm_min?: number;
    alarm_max?: number;
    pulse_before_min?: number;
    pulse_before_max?: number;
    pulse_after_min?: number;
    pulse_after_max?: number;
    pulse_anytime_min?: number;
    pulse_anytime_max?: number;
    is_point?: number;
    points?: string;
    def_kind?: number;
    times?: string;
}
export interface DiabetesType extends TableModel {
    name: string;
}
export interface FreeMeasure extends TableModel {
    hospital_id?: number;
    user_id?: number;
    delete_user_id?: number;
    point?: number;
    value?: number;
    time?: string;
    delete_time?: string;
    name?: string;
    cert_num?: string;
    cert_kind?: number;
    gender?: number;
    birthday?: string;
    address?: string;
    memo?: string;
    delete_memo?: string;
    temperature?: number;
    pressure_low?: number;
    pressure_high?: number;
    flag?: number;
}
export interface Group extends TableModel {
    name: string;
    hospital_id?: number;
    del_flag?: number;
}
export interface Hospital extends TableModel {
    name: string;
    patient_unique: number;
    patient_birthday: number;
    patient_diagnostic: number;
    patient_required_diabetes: number;
    patient_required_doctor: number;
    patient_required_nurse: number;
    patient_required_bed_number: number;
    patient_required_patient_number: number;
    patient_required_mobile: number;
    detail_user_default: number;
    detail_cure_default: number;
    detail_sort_default: number;
    detail_anytime_show: number;
    detail_analysis_show: number;
    detail_analysis_print: number;
    detail_print_name: number;
    detail_print_mobile: number;
    detail_print_gender: number;
    detail_print_age: number;
    detail_print_department: number;
    detail_print_bed_number: number;
    detail_print_patient_number: number;
    detail_print_user_name: number;
    default_target_before: string;
    default_target_after: string;
    default_alarm: string;
    default_pulse_before: string;
    default_pulse_after: string;
    default_pulse_anytime: string;
    sum_anytime: number;
    sum_notarget: number;
    sum_anytime_min: number;
    sum_anytime_max: number;
    sum_notarget_min: number;
    sum_notarget_max: number;
    barcode_type: number;
    barcode_prefix: string;
    barcode_suffix: string;
    barcode_index?: number;
    barcode_size?: number;
    barcode_print_add_hospital_name?: number;
    barcode_print_add_name?: number;
    barcode_print_add_mobile?: number;
    barcode_print_add_gender?: number;
    barcode_print_add_age?: number;
    barcode_print_add_department?: number;
    barcode_print_add_department_telephone?: number;
    barcode_print_add_bed_number?: number;
    barcode_print_add_patient_number?: number;
    barcode_print_add_diabetes?: number;
    other_bed_number_show?: number;
    other_bed_number_show_param?: number;
    other_bed_number_sort?: number;
    other_alarm_apply?: number;
    other_safe_notice?: number;
    other_control_notice?: number;
    other_room?: number;
    other_address?: string;
    name_after?: number;
    name_before?: number;
    app_department?: number;
    app_index?: number;
    anytime_range?: number;
    anytime_range_interval?: number;
    anytime_range_rule?: number;
    anytime_range_show?: number;
    roomcondition_department_others?: number;
    roomcondition_department_main?: number;
    roomcondition_alarm_min?: number;
    roomcondition_alarm_max?: number;
    help_title?: string;
    help?: string;
    report_title?: string;
    report_record_title?: string;
    normal_color?: string;
    pass_color?: string;
    low_color?: string;
    high_color?: string;
}
export interface InOutDepartmentRecord extends TableModel {
    io_hospital_id?: number;
    from_hospital_id?: number;
    to_hospital_id?: number;
    from_department_id?: number;
    to_department_id?: number;
    from_time?: string;
    to_time?: string;
    from_user_id?: number;
    to_user_id?: number;
    state?: number;
}
export interface InOutHospitalRecord extends TableModel {
    patient_id?: number;
    department_id?: number;
    doctor_id?: number;
    nurse_id?: number;
    in_date?: string;
    out_date?: string;
    state?: number;
}
export interface JobPosition extends TableModel {
    name?: string;
    type?: number;
    level?: number;
}
export interface MeasurePoint extends TableModel {
    advice_id?: number;
    point?: number;
}
export interface MeasureTime extends TableModel {
    advice_id?: number;
    time?: string;
}
export interface Member extends TableModel {
    consult_id?: number;
    department_id?: number;
    user_id?: number;
    memo?: string;
    state?: number;
    del_flag?: number;
}
export interface Notice extends TableModel {
    patient_id?: number;
    type?: number;
    notice?: string;
    date?: string;
    task_type?: number;
    task_value?: number;
    record_id?: number;
    flag?: number;
    syn_flag?: number;
}
export interface Patient extends TableModel {
    name?: string;
    is_in?: number;
    gender?: number;
    birthday?: string;
    address?: string;
    mobile?: string;
    family_contact?: string;
    is_married?: number;
    has_child?: number;
    smoking?: number;
    drinking?: number;
    has_medical_insurance?: number;
    medical_insurance_number?: string;
    hospital_id?: number;
    department_id?: number;
    doctor_id?: number;
    nurse_id?: number;
    group_id?: number;
    patient_number?: string;
    bed_number?: string;
    id_card_number?: string;
    in_date?: string;
    out_date?: string;
    diabetes_id?: number;
    diagnostic_time?: string;
    virtual_room?: number;
    his_code?: string;
    target_before_min?: number;
    target_before_max?: number;
    target_after_min?: number;
    target_after_max?: number;
    alarm_min?: number;
    alarm_max?: number;
    pulse_before_min?: number;
    pulse_before_max?: number;
    pulse_after_min?: number;
    pulse_after_max?: number;
    pulse_anytime_min?: number;
    pulse_anytime_max?: number;
    note?: string;
    flag?: number;
}
export interface Point extends TableModel {
    advice_id?: number;
    time?: string;
}
export interface RecordState extends TableModel {
    state?: number;
    name?: number;
}
export interface Record extends TableModel {
    patient_id?: number;
    hospital_id?: number;
    time?: string;
    delete_time?: string;
    point?: number;
    value?: number;
    user_id?: number;
    delete_user_id?: number;
    state?: number;
    memo?: string;
    delete_memo?: string;
    min?: number;
    max?: number;
    task_type?: number;
    task_value?: number;
    flag?: number;
    upload_flag?: number;
}
export interface State extends TableModel {
    value?: number;
    io_hospital?: string;
    io_department?: string;
    consult?: string;
    referral?: string;
    advice?: string;
    visit?: string;
}
export interface UserRelatedDepartment extends TableModel {
    user_id?: number;
    department_id?: number;
}
export interface UserRelatedHospital extends TableModel {
    user_id?: number;
    hospital_id?: number;
}
export interface User extends TableModel {
    nick?: string;
    name?: string;
    email?: string;
    email_verified_at?: string;
    password?: string;
    gender?: number;
    telephone?: string;
    mobile?: string;
    hospital_id?: number;
    department_id?: number;
    job_position_id?: number;
    is_valid?: number;
    is_admin?: number;
    is_safe_notice_showed?: number;
    his_code?: string;
    is_super?: number;
    remember_token?: string;
}
export interface VisitRecord extends TableModel {
    patient_id?: number;
    department_id?: number;
    doctor_id?: number;
    user_id?: number;
    from_time?: string;
    to_time?: string;
    image?: string;
    memo?: string;
    state?: number;
}