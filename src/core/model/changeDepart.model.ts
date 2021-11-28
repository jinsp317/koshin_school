export interface ChangeDepart {
  id?: number;
  inhospital_id: number;
  doctor_id: number;
  from_depart_id: number;
  to_depart_Id: number;
  from_time: string;
  to_time: string;
  from_user_id: number;
  to_user_id: number;

  from_depart_name?: string;
  to_depart_name?: string;

  from_user_name?: string;
  to_user_name?: string;
}

export interface RequestChangeDepart {
  inhospital_id?: number;
  hospital_id?: number;
  begin_time?: string;
  end_time?: string;
}
