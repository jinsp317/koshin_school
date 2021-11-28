import { number } from "prop-types";

export interface DeviceModel {
  id: string;
  name: string;
  sn?: string;
  nick?: string;
  last_seqnum?: number;
  record_count?: number;
  type?: number; // 0 bluetooth, 1 otg
  otg_sn?: string;
  useLast?: boolean;
}
