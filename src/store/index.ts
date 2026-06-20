import { create } from 'zustand';
import type { AppState, Alert, DisposalStep, CargoRisk, VehicleClosureSummary, RiskStatus } from '../types';
import { mockAlerts, mockVehicles, mockHandoverLogs, mockCargoRisks } from '../data/mockData';

interface StoreState extends AppState {
  setSelectedAlert: (id: string | null) => void;
  setSelectedVehicle: (id: string | null) => void;
  assignAlert: (alertId: string, operator: string) => void;
  updateDisposalStep: (alertId: string, stepId: string, patch: Partial<DisposalStep>) => void;
  closeAlert: (alertId: string, recoverNote: string) => void;
  handoverAlert: (alertId: string) => void;
  incrementPowerOffMinutes: () => void;
  updateVehicleTemp: () => void;
  updateRiskStatus: (riskId: string, status: RiskStatus) => void;
  createHandoverLog: (toOperator: string, summary: string) => void;
  getRecoveredVehicleIds: () => string[];
  getVehicleSummaries: () => VehicleClosureSummary[];
}

export const useStore = create<StoreState>((set, get) => ({
  currentOperator: '陈夜班',
  shift: '夜班 22:00 - 06:00',
  vehicles: mockVehicles,
  alerts: mockAlerts,
  cargoRisks: mockCargoRisks,
  handoverLogs: mockHandoverLogs,
  selectedAlertId: null,
  selectedVehicleId: null,

  setSelectedAlert: (id) => {
    const alert = id ? get().alerts.find((a) => a.id === id) : null;
    set({ selectedAlertId: id, selectedVehicleId: alert?.vehicleId ?? null });
  },

  setSelectedVehicle: (id) => {
    const alert = id
      ? get().alerts.find((a) => a.vehicleId === id && a.status !== 'closed')
      : null;
    set({ selectedVehicleId: id, selectedAlertId: alert?.id ?? null });
  },

  assignAlert: (alertId, operator) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, assignee: operator, status: 'processing' as const } : a
      ),
    })),

  updateDisposalStep: (alertId, stepId, patch) =>
    set((state) => ({
      alerts: state.alerts.map((a) => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          steps: a.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
        };
      }),
    })),

  closeAlert: (alertId, recoverNote) => {
    const state = get();
    const alert = state.alerts.find((a) => a.id === alertId);
    if (!alert) return;
    const vehicle = state.vehicles.find((v) => v.id === alert.vehicleId);
    if (!vehicle) return;

    const closeTime = new Date().toISOString();
    const totalPowerOffMinutes = Math.max(
      vehicle.powerOffMinutes,
      alert.totalPowerOffMinutes ?? 0,
      Math.floor((Date.now() - new Date(alert.startTime).getTime()) / 60000)
    );

    const riskLevel =
      totalPowerOffMinutes > 60 ? 'high' : totalPowerOffMinutes > 30 ? 'medium' : totalPowerOffMinutes > 10 ? 'low' : 'none';
    const needsInspection = riskLevel !== 'none';

    let newRisk: CargoRisk | null = null;
    if (needsInspection) {
      const existingRisk = state.cargoRisks.find((r) => r.vehicleId === vehicle.id);
      if (!existingRisk) {
        newRisk = {
          id: `r${Date.now()}`,
          vehicleId: vehicle.id,
          plateNumber: vehicle.plateNumber,
          description: `${vehicle.plateNumber} 断电${totalPowerOffMinutes}分钟，批次${vehicle.batchNo}，到货需抽检中心温度`,
          level: riskLevel as 'high' | 'medium' | 'low',
          status: 'pending_inspection',
          batchNo: vehicle.batchNo,
          powerOffMinutes: totalPowerOffMinutes,
          createdAt: closeTime,
          updatedAt: closeTime,
          operator: state.currentOperator,
        };
      }
    }

    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId
          ? { ...a, status: 'closed' as const, closeTime, recoverNote, totalPowerOffMinutes }
          : a
      ),
      vehicles: s.vehicles.map((v) =>
        v.id === alert.vehicleId
          ? { ...v, status: 'normal' as const, powerOffMinutes: 0 }
          : v
      ),
      cargoRisks: newRisk ? [...s.cargoRisks, newRisk] : s.cargoRisks,
    }));
  },

  handoverAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'handover' as const } : a
      ),
    })),

  incrementPowerOffMinutes: () =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.status === 'poweroff' ? { ...v, powerOffMinutes: v.powerOffMinutes + 1 } : v
      ),
      alerts: state.alerts.map((a) => {
        if (a.status === 'closed') return a;
        const v = state.vehicles.find((veh) => veh.id === a.vehicleId);
        if (!v || v.status !== 'poweroff') return a;
        return { ...a, totalPowerOffMinutes: (a.totalPowerOffMinutes ?? 0) + 1 };
      }),
    })),

  updateVehicleTemp: () =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => {
        if (v.status === 'poweroff') {
          const newTemp = Math.min(25, v.currentTemp + Math.random() * 0.8);
          return {
            ...v,
            currentTemp: Number(newTemp.toFixed(1)),
            tempHistory: [...v.tempHistory.slice(1), Number(newTemp.toFixed(1))],
            lastUpdate: new Date().toISOString(),
          };
        }
        if (v.status === 'warning') {
          const delta = (Math.random() - 0.3) * 0.3;
          const newTemp = v.currentTemp + delta;
          return {
            ...v,
            currentTemp: Number(newTemp.toFixed(1)),
            tempHistory: [...v.tempHistory.slice(1), Number(newTemp.toFixed(1))],
            lastUpdate: new Date().toISOString(),
          };
        }
        const delta = (Math.random() - 0.5) * 0.2;
        const newTemp = v.targetTemp + delta;
        return {
          ...v,
          currentTemp: Number(newTemp.toFixed(1)),
          tempHistory: [...v.tempHistory.slice(1), Number(newTemp.toFixed(1))],
          lastUpdate: new Date().toISOString(),
        };
      }),
    })),

  updateRiskStatus: (riskId, status) =>
    set((state) => ({
      cargoRisks: state.cargoRisks.map((r) =>
        r.id === riskId
          ? { ...r, status, updatedAt: new Date().toISOString(), operator: state.currentOperator }
          : r
      ),
    })),

  getRecoveredVehicleIds: () => {
    const state = get();
    const closedAlerts = state.alerts.filter((a) => a.status === 'closed');
    const idsFromAlerts = closedAlerts.map((a) => a.vehicleId);
    const idsFromLogs = state.handoverLogs.flatMap((l) => l.recoveredVehicles);
    return Array.from(new Set([...idsFromAlerts, ...idsFromLogs]));
  },

  getVehicleSummaries: (): VehicleClosureSummary[] => {
    const state = get();
    const summaries: VehicleClosureSummary[] = [];

    state.alerts.filter((a) => a.status === 'closed').forEach((alert) => {
      const vehicle = state.vehicles.find((v) => v.id === alert.vehicleId);
      if (!vehicle || !alert.closeTime) return;
      const stepsCompleted = alert.steps.filter((s) => s.completed).length;
      const totalPowerOff = alert.totalPowerOffMinutes ?? vehicle.powerOffMinutes;
      const riskLevel =
        totalPowerOff > 60 ? 'high' : totalPowerOff > 30 ? 'medium' : totalPowerOff > 10 ? 'low' : 'none';
      summaries.push({
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
        route: vehicle.route,
        cargoOwner: vehicle.cargoOwner,
        batchNo: vehicle.batchNo,
        alertStartTime: alert.startTime,
        alertCloseTime: alert.closeTime,
        totalPowerOffMinutes: totalPowerOff,
        stepsCompleted,
        stepsTotal: alert.steps.length,
        recoverNote: alert.recoverNote ?? '',
        needsInspection: riskLevel !== 'none',
        riskLevel: riskLevel as VehicleClosureSummary['riskLevel'],
      });
    });

    state.handoverLogs.forEach((log) => {
      log.vehicleSummaries.forEach((sum) => {
        if (!summaries.find((s) => s.vehicleId === sum.vehicleId)) {
          summaries.push(sum);
        }
      });
    });

    return summaries.sort(
      (a, b) => new Date(b.alertCloseTime).getTime() - new Date(a.alertCloseTime).getTime()
    );
  },

  createHandoverLog: (toOperator, summary) => {
    const state = get();
    const openAlerts = state.alerts
      .filter((a) => a.status !== 'closed')
      .map((a) => a.id);
    const vehicleSummaries = state.getVehicleSummaries();
    const recoveredVehicles = state.getRecoveredVehicleIds();
    const activeRisks = state.cargoRisks.filter(
      (r) => r.status !== 'inspection_passed'
    );

    const newLog = {
      id: `h${Date.now()}`,
      handoverTime: new Date().toISOString(),
      fromOperator: state.currentOperator,
      toOperator,
      openAlerts,
      recoveredVehicles,
      vehicleSummaries,
      cargoRisks: activeRisks,
      summary,
      confirmed: false,
    };

    set({
      handoverLogs: [newLog, ...state.handoverLogs],
    });
  },
}));
