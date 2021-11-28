export interface HelpSectionModel {
  id?: number;
  hospital_id?: number;
  number: string;
  title: string;
  content: string;
}
export interface HelpModel {
  title: string;
  sections: HelpSectionModel[];
}
