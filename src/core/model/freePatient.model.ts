import { Sex, CertKind } from './common.model'

export interface FreePatient {
  id?: number;
  name: string;
  cert_num: string; // 证件证号码
  cert_kind: CertKind;
  gender?: Sex // 0 male, 1 female
  birthday?: string;  // yyyy-mm-dd
  address?: string
}
