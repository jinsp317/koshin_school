export interface ObjectModel {
    id: number;
    pid?: number; // parent id
    name: string;
    checked?: boolean; // for select, find
}
export interface TableModel {
    id?: number;
    created_at?: string;
    updated_at?: string;
}
