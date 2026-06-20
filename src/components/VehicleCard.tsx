import { Thermometer, MapPin, Phone, Package, Snowflake, AlertTriangle, ZapOff, Clock } from 'lucide-react';
import type { Vehicle } from '../types';
import TempSparkline from './TempSparkline';
import { formatDurationMinutes, tempZoneShort } from '../utils/format';

interface Props {
  vehicle: Vehicle;
  onClick?: () => void;
  selected?: boolean;
}

export default function VehicleCard({ vehicle, onClick, selected }: Props) {
  const isPoweroff = vehicle.status === 'poweroff';
  const isWarning = vehicle.status === 'warning';

  const cardClass = isPoweroff
    ? 'glass-card-red animate-pulse-border'
    : isWarning
    ? 'glass-card-warn'
    : 'glass-card hover:border-cyber-cyan/30';

  return (
    <div
      onClick={onClick}
      className={`${cardClass} ${selected ? 'ring-2 ring-cyber-cyan' : ''} p-3 rounded-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] relative overflow-hidden animate-float-up`}
    >
      {isPoweroff && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-cyber-red/90 text-white text-[10px] font-mono font-bold rounded-sm animate-blink">
          <ZapOff size={10} />
          <span>断电</span>
        </div>
      )}
      {isWarning && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-cyber-orange/90 text-white text-[10px] font-mono font-bold rounded-sm">
          <AlertTriangle size={10} />
          <span>预警</span>
        </div>
      )}
      {!isPoweroff && !isWarning && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-cyber-green/20 text-cyber-green text-[10px] font-mono font-bold rounded-sm border border-cyber-green/40">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
          <span>正常</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-2 pr-16">
        <div>
          <div className="font-mono text-lg font-bold tracking-wider text-white">
            {vehicle.plateNumber}
          </div>
          <div className="text-[11px] text-cyber-blue/80 font-mono">{vehicle.route}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1 text-cyber-cyan">
          <Snowflake size={11} />
          <span className="font-mono">{tempZoneShort(vehicle.tempZone)}</span>
        </div>
        <span className="text-deep-sea-600">|</span>
        <div className="flex items-center gap-1 text-cyber-orange/80">
          <Package size={11} />
          <span className="truncate max-w-[100px]">{vehicle.batchNo.slice(-8)}</span>
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <Thermometer size={12} className={isPoweroff ? 'text-cyber-red' : isWarning ? 'text-cyber-orange' : 'text-cyber-green'} />
            <span className={`font-mono text-2xl font-bold ${isPoweroff ? 'text-cyber-red animate-glow-red' : isWarning ? 'text-cyber-orange' : 'text-cyber-green'}`}>
              {vehicle.currentTemp > 0 ? '+' : ''}{vehicle.currentTemp.toFixed(1)}°
            </span>
            <span className="font-mono text-xs text-deep-sea-600">/ {vehicle.targetTemp}°</span>
          </div>
          <TempSparkline
            data={vehicle.tempHistory}
            targetTemp={vehicle.targetTemp}
            status={vehicle.status}
            width={110}
            height={28}
          />
        </div>
        {isPoweroff && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-cyber-red">
              <Clock size={12} />
              <span className="text-[10px] text-cyber-red/70">已断电</span>
            </div>
            <div className="font-mono text-xl font-bold text-cyber-red animate-glow-red">
              {formatDurationMinutes(vehicle.powerOffMinutes)}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-cyber-cyan/10 pt-2 mt-2 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <Phone size={11} className="text-cyber-cyan" />
          <span>{vehicle.driverName}</span>
          <span className="font-mono text-cyber-cyan/80">{vehicle.driverPhone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <MapPin size={11} className="text-cyber-orange" />
          <span className="truncate">{vehicle.currentLocation}</span>
        </div>
      </div>

      {isPoweroff && (
        <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-cyber-red/20 blur-2xl pointer-events-none" />
      )}
    </div>
  );
}
