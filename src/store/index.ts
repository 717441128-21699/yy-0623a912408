import { create } from 'zustand';
import type { AppState, Alert, DisposalStep, Vehicle } from '../types';
import { mockAlerts, mockVehicles, mockHandoverLogs, recoveredVehicleIds } from '../data/mockData';

interface StoreState extends AppState {
  setSelectedAlert: (id: string | null) => void;
  assignAlert: (alertId: string, operator: string) => void;
  updateDisposalStep: (alertId: string, stepId: string, patch: Partial<DisposalStep>) => void;
  closeAlert: (alertId: string, recoverNote: string) => void;
  handoverAlert: (alertId: string) => void;
  incrementPowerOffMinutes: () => void;
  updateVehicleTemp: () => void;
  createHandoverLog: (toOperator: string, summary: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentOperator: '陈夜班',
  shift: '夜班 22:00 - 06:00',
  vehicles: mockVehicles,
  alerts: mockAlerts,
  handoverLogs: mockHandoverLogs,
  recoveredVehicles: recoveredVehicleIds,
  selectedAlertId: null,

  setSelectedAlert: (id) => set({ selectedAlertId: id }),

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

  closeAlert: (alertId, recoverNote) =>
    set((state) => {
      const alert = state.alerts.find((a) => a.id === alertId);
      if (!alert) return state;
      return {
        alerts: state.alerts.map((a) =>
          a.id === alertId
            ? { ...a, status: 'closed' as const, closeTime: new Date().toISOString(), recoverNote }
            : a
        ),
        recoveredVehicles: [...state.recoveredVehicles, alert.vehicleId],
        vehicles: state.vehicles.map((v) =>
          v.id === alert.vehicleId
            ? { ...v, status: 'normal' as const, powerOffMinutes: 0 }
            : v
        ),
      };
    }),

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

  createHandoverLog: (toOperator, summary) => {
    const state = get();
    const openAlerts = state.alerts.filter((a) => a.status !== 'closed').map((a) => a.id);
    const cargoRisks = state.alerts
      .filter((a) => a.status === 'closed' || a.status === 'handover')
      .map((a) => {
        const vehicle = state.vehicles.find((v: Vehicle) => v.id === a.vehicleId);
        if (!vehicle) return null;
        const level = vehicle.powerOffMinutes > 60 ? 'high' : vehicle.powerOffMinutes > 30 ? 'medium' : 'low';
        return {
          vehicleId: vehicle.id,
          description: `${vehicle.plateNumber} 断电${vehicle.powerOffMinutes}分钟，批次${vehicle.batchNo}，到货需抽检`,
          level,
        };
      })
      .filter(Boolean) as { vehicleId: string; description: string; level: 'high' | 'medium' | 'low' }[];

    const newLog = {
      id: `h${Date.now()}`,
      handoverTime: new Date().toISOString(),
      fromOperator: state.currentOperator,
      toOperator,
      openAlerts,
      recoveredVehicles: state.recoveredVehicles,
      cargoRisks,
      summary,
      confirmed: false,
    };

    set({
      handoverLogs: [newLog, ...state.handoverLogs],
    });
  },
}));
