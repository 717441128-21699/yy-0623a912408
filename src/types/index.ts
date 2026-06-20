export type VehicleStatus = 'normal' | 'warning' | 'poweroff';
export type TempZone = 'frozen' | 'chilled' | 'constant';
export type AlertLevel = 'critical' | 'warning';
export type AlertType = 'poweroff' | 'temp_high' | 'device_error';
export type AlertStatus = 'open' | 'processing' | 'closed' | 'handover';

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  route: string;
  cargoOwner: string;
  tempZone: TempZone;
  batchNo: string;
  currentTemp: number;
  targetTemp: number;
  currentLocation: string;
  status: VehicleStatus;
  powerOffMinutes: number;
  lastUpdate: string;
  tempHistory: number[];
}

export interface DisposalStep {
  id: string;
  stepOrder: 1 | 2 | 3;
  stepName: string;
  actionLabel: string;
  actionTime: string | null;
  result: string;
  remark: string;
  operator: string;
  completed: boolean;
}

export interface Alert {
  id: string;
  vehicleId: string;
  level: AlertLevel;
  type: AlertType;
  startTime: string;
  status: AlertStatus;
  assignee: string;
  steps: DisposalStep[];
  closeTime?: string;
  recoverNote?: string;
}

export interface CargoRisk {
  vehicleId: string;
  description: string;
  level: 'high' | 'medium' | 'low';
}

export interface HandoverLog {
  id: string;
  handoverTime: string;
  fromOperator: string;
  toOperator: string;
  openAlerts: string[];
  recoveredVehicles: string[];
  cargoRisks: CargoRisk[];
  summary: string;
  confirmed: boolean;
}

export interface AppState {
  currentOperator: string;
  shift: string;
  vehicles: Vehicle[];
  alerts: Alert[];
  handoverLogs: HandoverLog[];
  recoveredVehicles: string[];
  selectedAlertId: string | null;
}
