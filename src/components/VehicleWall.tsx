import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Filter, Truck } from 'lucide-react';
import { useStore } from '../store';
import VehicleCard from './VehicleCard';

type GroupKey = 'route' | 'cargoOwner' | 'tempZone';

const GROUP_LABELS: Record<GroupKey, string> = {
  route: '线路',
  cargoOwner: '货主',
  tempZone: '温区',
};

const TEMP_ZONE_LABELS: Record<string, string> = {
  frozen: '冷冻 -20℃',
  chilled: '冷藏 2-8℃',
  constant: '恒温 15℃',
};

export default function VehicleWall() {
  const vehicles = useStore((s) => s.vehicles);
  const selectedAlertId = useStore((s) => s.selectedAlertId);
  const setSelectedAlert = useStore((s) => s.setSelectedAlert);
  const alerts = useStore((s) => s.alerts);

  const [groupBy, setGroupBy] = useState<GroupKey>('route');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const selectedVehicleId = useMemo(() => {
    if (!selectedAlertId) return null;
    return alerts.find((a) => a.id === selectedAlertId)?.vehicleId ?? null;
  }, [selectedAlertId, alerts]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof vehicles>();
    vehicles.forEach((v) => {
      const key = v[groupBy];
      const label = groupBy === 'tempZone' ? TEMP_ZONE_LABELS[key] || key : key;
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(v);
    });
    return Array.from(map.entries());
  }, [vehicles, groupBy]);

  const sortedGroups = useMemo(() => {
    return grouped.sort((a, b) => {
      const aPoweroffCount = a[1].filter((v) => v.status === 'poweroff').length;
      const bPoweroffCount = b[1].filter((v) => v.status === 'poweroff').length;
      if (aPoweroffCount !== bPoweroffCount) return bPoweroffCount - aPoweroffCount;
      const aWarnCount = a[1].filter((v) => v.status === 'warning').length;
      const bWarnCount = b[1].filter((v) => v.status === 'warning').length;
      return bWarnCount - aWarnCount;
    });
  }, [grouped]);

  const handleCardClick = (vehicleId: string) => {
    const alert = alerts.find((a) => a.vehicleId === vehicleId);
    if (alert) {
      setSelectedAlert(alert.id);
    }
  };

  const poweroffCount = vehicles.filter((v) => v.status === 'poweroff').length;
  const warningCount = vehicles.filter((v) => v.status === 'warning').length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-cyber-cyan" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-cyber-cyan">车辆状态墙</h2>
          <span className="flex items-center gap-1.5 ml-2">
            <span className="text-cyber-red font-mono text-sm font-bold">{poweroffCount}</span>
            <span className="text-[10px] text-slate-400">断电</span>
            <span className="text-cyber-orange font-mono text-sm font-bold ml-1">{warningCount}</span>
            <span className="text-[10px] text-slate-400">预警</span>
          </span>
        </div>
        <div className="flex items-center gap-1 bg-deep-sea-800 rounded-sm overflow-hidden border border-cyber-cyan/20">
          {(['route', 'cargoOwner', 'tempZone'] as GroupKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setGroupBy(k)}
              className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-all ${
                groupBy === k
                  ? 'bg-cyber-cyan/20 text-cyber-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {GROUP_LABELS[k]}
            </button>
          ))}
          <Filter size={12} className="mx-1 text-deep-sea-600" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-3">
        {sortedGroups.map(([label, list]) => {
          const isCollapsed = collapsed[label] ?? false;
          const hasPoweroff = list.some((v) => v.status === 'poweroff');
          const hasWarning = list.some((v) => v.status === 'warning');
          return (
            <div key={label}>
              <button
                onClick={() => setCollapsed((prev) => ({ ...prev, [label]: !isCollapsed }))}
                className="w-full flex items-center gap-2 py-1.5 px-2 bg-deep-sea-800/60 border-b border-cyber-cyan/10 hover:bg-deep-sea-700/60 transition-colors rounded-t-sm"
              >
                {isCollapsed ? (
                  <ChevronRight size={14} className="text-cyber-cyan" />
                ) : (
                  <ChevronDown size={14} className="text-cyber-cyan" />
                )}
                <span className="text-xs font-medium text-slate-200">{label}</span>
                <span className="font-mono text-[11px] text-slate-500">{list.length}台</span>
                {hasPoweroff && (
                  <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-cyber-red/20 text-cyber-red text-[10px] font-mono font-bold rounded-sm">
                    断电{list.filter((v) => v.status === 'poweroff').length}
                  </span>
                )}
                {!hasPoweroff && hasWarning && (
                  <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-cyber-orange/20 text-cyber-orange text-[10px] font-mono font-bold rounded-sm">
                    预警{list.filter((v) => v.status === 'warning').length}
                  </span>
                )}
              </button>
              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {list
                    .sort((a, b) => {
                      const order = { poweroff: 0, warning: 1, normal: 2 };
                      return order[a.status] - order[b.status];
                    })
                    .map((v) => (
                      <VehicleCard
                        key={v.id}
                        vehicle={v}
                        onClick={() => handleCardClick(v.id)}
                        selected={selectedVehicleId === v.id}
                      />
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
