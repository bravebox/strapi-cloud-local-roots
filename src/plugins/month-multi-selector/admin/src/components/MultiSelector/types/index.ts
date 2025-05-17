export type MonthStatus = 'inactive' | 'low' | 'high';

export interface MonthlyStatusData {
  [month: string]: MonthStatus;
}

export interface MonthInfo {
  id: string;
  name: string;
  shortName: string;
}