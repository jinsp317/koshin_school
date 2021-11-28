import { ObjectModel } from "./object.model";
import { HospitalModel } from "./hospital.model";

export interface User extends ObjectModel {
  // id: number;
  nick: string; // primary key
  // name: string;
  email?: string;
  gender?: number;
  telephone?: string;
  mobile?: string;
  hospital_id?: number;
  department_id?: number;
  job_position_id?: number;
  is_admin?: number;
  is_valid?: number;
  is_super?: number;

  relatedHospitals?: HospitalModel[];

  department_name?: string;
  job_position_name?: string;
  job_position_level?: number;
  job_position_type?: number; // 1 doctor, 2: nurse
  hospital_name?: string;
  password?: string;

  relatedDepartments?: number[];
}

export interface SaveUserModel {
  id: number;
  nick: string;
  password: string;
  hospital_num: number;
}
