export interface TestDataModel {
  department_id: number;
  user_id: number;
  device_number?: string;
  all_number?: string;

  paper_number: string;
  liquid_number: string;
  liquid_type: number;
  min?: number;
  max?: number;
  value: number;
  result_type: number; // 0 unknown, 1 pass, 2 no pass
  memo?: string;
  use_number: number;
  time?: string;
}

export interface TestRangeModel {
  low_min?: number;
  low_max?: number;
  middle_min?: number;
  middle_max?: number;
  high_min?: number;
  high_max?: number;
}
