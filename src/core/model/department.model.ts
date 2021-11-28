import { ObjectModel } from "./object.model";

export interface Department extends ObjectModel {
  // id?: number
  hospital_id?: number;
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
  // name?: string
  telephone?: string;
  doctors?: ObjectModel[];
  nurses?: ObjectModel[];
  // checked?: boolean;
}
