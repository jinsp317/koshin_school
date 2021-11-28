import { InsulinInjectAction } from './table.model';
export interface InsulinInjectActionVw extends InsulinInjectAction {
    vw_medicine_name?: string;
    vm_kind_name?: string;
    vm_advice_obj?: string;
}
