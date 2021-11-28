export interface DoctorsOrder {
  id?: number;
  patient_id: number;
  user_id: number;

  from_time: string;
  to_time: string;

  state: number;

  points?: DoctorsOrderPointModel[];
  times?: number[];
  days?: DayModel[];
  is_point?: number;
  is_long?: number;

  user_name?: string;
  state_name?: string;
}

export interface DayModel {
  id: number;
  advice_id: number;
  day: number;
}
export interface DoctorsOrderPointModel {
  id: number;
  advice_id: number;
  point: number;
}

export interface RequestDoctorsOrder {
  patient_id?: number;
  hospital_id?: number;
  begin_time?: string;
  end_time?: string;
}
