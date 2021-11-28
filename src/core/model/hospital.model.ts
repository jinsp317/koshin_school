export interface HospitalModel {
  id: number;
  name: string;
  help_title?: string;
  patient_unique?: number;
  patient_birthday?: number;
  patient_required_doctor?: number;
  patient_required_nurse?: number;
  patient_required_bed_number?: number;
  patient_required_patient_number?: number;
  patient_required_mobile?: number;
  barcode_index?: number;
  barcode_prefix?: string;
  barcode_suffix?: string;
  high_color: string;
  low_color: string;
  pass_color: string;
  normal_color: string;
  prepare_color: string;
  above_color?: string;
  below_color?: string;
  help?: string;
}
