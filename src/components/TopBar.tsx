import { useEffect, useState } from 'react';
import { Snowflake, User, ShieldCheck, ZapOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';

export default function TopBar() {
  const shift = useStore((s) => s.shift);
  const currentOperator = useStore((s) => s.currentOperator);
  const alerts = useStore((s) => s.alerts);
  const vehicles = useStore((s) => s.vehicles);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const poweroffCount = vehicles.filter((v) => v.status === 'poweroff').length;
  const warningCount = vehicles.filter((v) => v.status === 'warning').length;
  const normalCount = vehicles.filter((v) => v.status === 'normal').length;

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];

  return (
    <header className="h-16 shrink-0 border-b border-cyber-cyan/15 bg-deep-sea-900/80 backdrop-blur-sm flex items-center px-6 relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-cyber-cyan/20 to-cyber-cyan/5 border border-cyber-cyan/40 flex items-center justify-center">
          <Snowflake size={22} className="text-cyber-cyan" />
        </div>
        <div>
          <div className="text-base font-bold tracking-wider text-white flex items-center gap-2">
            冷链调度 · 夜班看板
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyber-red/15 text-cyber-red border border-cyber-red/30 rounded-sm animate-blink">
              NIGHT SHIFT
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{shift}</div>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="font-mono text-3xl font-bold text-cyber-cyan glow-text-cyan tracking-wider">
          <span className="inline-block animate-digit-roll">{hh}</span>
          <span className="mx-1 animate-blink">:</span>
          <span className="inline-block animate-digit-roll">{mm}</span>
          <span className="mx-1 animate-blink">:</span>
          <span className="inline-block animate-digit-roll">{ss}</span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
          {dateStr} {weekday}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-cyber-red/10 border border-cyber-red/30">
            <ZapOff size={14} className="text-cyber-red animate-blink" />
            <span className="font-mono text-sm font-bold text-cyber-red">{poweroffCount}</span>
            <span className="text-[10px] text-slate-400">断电</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-cyber-orange/10 border border-cyber-orange/30">
            <AlertTriangle size={14} className="text-cyber-orange" />
            <span className="font-mono text-sm font-bold text-cyber-orange">{warningCount}</span>
            <span className="text-[10px] text-slate-400">预警</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-cyber-green/10 border border-cyber-green/30">
            <CheckCircle2 size={14} className="text-cyber-green" />
            <span className="font-mono text-sm font-bold text-cyber-green">{normalCount}</span>
            <span className="text-[10px] text-slate-400">正常</span>
          </div>
        </div>

        <div className="h-8 w-px bg-cyber-cyan/15" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-cyan/30 to-cyber-blue/20 border border-cyber-cyan/40 flex items-center justify-center">
            <User size={14} className="text-cyber-cyan" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-200">{currentOperator}</div>
            <div className="text-[10px] text-cyber-green flex items-center gap-1">
              <ShieldCheck size={10} />
              值班中
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
