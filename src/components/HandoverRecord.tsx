import { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ArrowRightLeft,
  FileCheck,
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../store';
import { formatDateTime, formatTime } from '../utils/format';

export default function HandoverRecord() {
  const currentOperator = useStore((s) => s.currentOperator);
  const alerts = useStore((s) => s.alerts);
  const vehicles = useStore((s) => s.vehicles);
  const recoveredVehicles = useStore((s) => s.recoveredVehicles);
  const handoverLogs = useStore((s) => s.handoverLogs);
  const createHandoverLog = useStore((s) => s.createHandoverLog);

  const [toOperator, setToOperator] = useState('赵早班');
  const [summary, setSummary] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const openAlerts = alerts.filter((a) => a.status !== 'closed');
  const closedThisShift = alerts.filter((a) => a.status === 'closed');

  const cargoRisks = openAlerts
    .map((a) => {
      const v = vehicles.find((veh) => veh.id === a.vehicleId);
      if (!v) return null;
      const level =
        v.powerOffMinutes > 60 ? 'high' : v.powerOffMinutes > 30 ? 'medium' : 'low';
      return {
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        description: `${v.plateNumber} 断电${v.powerOffMinutes}分钟，批次${v.batchNo}，到货需抽检中心温度`,
        level: level as 'high' | 'medium' | 'low',
      };
    })
    .filter(Boolean) as { vehicleId: string; plateNumber: string; description: string; level: 'high' | 'medium' | 'low' }[];

  const levelColor = {
    high: 'text-cyber-red bg-cyber-red/10 border-cyber-red/30',
    medium: 'text-cyber-orange bg-cyber-orange/10 border-cyber-orange/30',
    low: 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/30',
  };
  const levelLabel = { high: '高', medium: '中', low: '低' };

  const generateAutoSummary = () => {
    const parts = [];
    parts.push(`本班次共处理告警${alerts.length}条`);
    parts.push(`已恢复${closedThisShift.length}辆`);
    if (openAlerts.length > 0) parts.push(`未关闭${openAlerts.length}条需跟进`);
    if (cargoRisks.length > 0) parts.push(`${cargoRisks.length}辆车存在货损风险需到货抽检`);
    setSummary(parts.join('，') + '。');
  };

  const handleCreateLog = () => {
    createHandoverLog(toOperator, summary || '正常交接');
    setSummary('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-cyber-cyan" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-cyber-cyan">交接班记录</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500">交班人：{currentOperator}</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-3">
        <div className="glass-card rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} className="text-cyber-red" />
            <span className="text-xs font-medium text-slate-200">未关闭告警</span>
            <span className="ml-auto font-mono text-[11px] text-cyber-red">{openAlerts.length}</span>
          </div>
          {openAlerts.length === 0 ? (
            <div className="text-[11px] text-slate-500 text-center py-2">所有告警已闭环</div>
          ) : (
            <div className="space-y-1.5">
              {openAlerts.map((a) => {
                const v = vehicles.find((veh) => veh.id === a.vehicleId);
                if (!v) return null;
                return (
                  <div key={a.id} className="flex items-center gap-2 p-1.5 bg-deep-sea-900/50 rounded-sm text-[11px]">
                    <AlertCircle size={11} className={a.level === 'critical' ? 'text-cyber-red' : 'text-cyber-orange'} />
                    <span className="font-mono text-white">{v.plateNumber}</span>
                    <span className="text-slate-400">{v.route}</span>
                    <span className="ml-auto font-mono text-cyber-red">{formatTime(a.startTime)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={13} className="text-cyber-green" />
            <span className="text-xs font-medium text-slate-200">已恢复车辆</span>
            <span className="ml-auto font-mono text-[11px] text-cyber-green">
              {recoveredVehicles.length + closedThisShift.length}
            </span>
          </div>
          {(recoveredVehicles.length + closedThisShift.length) === 0 ? (
            <div className="text-[11px] text-slate-500 text-center py-2">本班次暂无恢复车辆</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {closedThisShift.map((a) => {
                const v = vehicles.find((veh) => veh.id === a.vehicleId);
                if (!v) return null;
                return (
                  <span key={a.id} className="px-2 py-0.5 text-[10px] font-mono bg-cyber-green/10 text-cyber-green rounded-sm border border-cyber-green/20">
                    {v.plateNumber}
                  </span>
                );
              })}
              {['辽B·T8821', '冀A·M5533'].map((p) => (
                <span key={p} className="px-2 py-0.5 text-[10px] font-mono bg-cyber-green/10 text-cyber-green/70 rounded-sm border border-cyber-green/20">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon size={13} className="text-cyber-orange" />
            <span className="text-xs font-medium text-slate-200">货损风险跟进</span>
            <span className="ml-auto font-mono text-[11px] text-cyber-orange">{cargoRisks.length}</span>
          </div>
          {cargoRisks.length === 0 ? (
            <div className="text-[11px] text-slate-500 text-center py-2">暂无货损风险</div>
          ) : (
            <div className="space-y-1.5">
              {cargoRisks.map((r, idx) => (
                <div key={idx} className="p-1.5 bg-deep-sea-900/50 rounded-sm border-l-2 border-cyber-orange/40">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-white">{r.plateNumber}</span>
                    <span className={`text-[9px] font-mono uppercase px-1 py-0.5 rounded-sm border ${levelColor[r.level]}`}>
                      {levelLabel[r.level]}风险
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{r.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft size={13} className="text-cyber-cyan" />
            <span className="text-xs font-medium text-slate-200">生成交班记录</span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">接班人</label>
              <input
                value={toOperator}
                onChange={(e) => setToOperator(e.target.value)}
                className="w-full mt-0.5 bg-deep-sea-900/80 border border-deep-sea-600 focus:border-cyber-cyan/40 rounded-sm px-2 py-1 text-xs text-slate-200 outline-none h-7 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">交班摘要</label>
              <div className="flex gap-1 mt-0.5 mb-1">
                <button
                  onClick={generateAutoSummary}
                  className="text-[10px] px-2 py-0.5 border border-cyber-cyan/30 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10"
                >
                  一键生成
                </button>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="本班次情况总结..."
                className="w-full bg-deep-sea-900/80 border border-deep-sea-600 focus:border-cyber-cyan/40 rounded-sm p-2 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none h-16"
              />
            </div>
            <button
              onClick={handleCreateLog}
              className="w-full btn-cyber border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 text-[11px]"
            >
              <FileCheck size={12} className="inline mr-1" />
              确认交班
            </button>
          </div>
        </div>

        <div className="glass-card rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={13} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-300">历史交班记录</span>
          </div>
          <div className="space-y-1.5">
            {handoverLogs.map((log) => {
              const isExpanded = expandedLog === log.id;
              return (
                <div key={log.id} className="bg-deep-sea-900/50 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-deep-sea-800/50 transition-colors text-left"
                  >
                    {isExpanded ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                    <Clock size={11} className="text-cyber-cyan" />
                    <span className="text-[11px] font-mono text-cyber-cyan">{formatDateTime(log.handoverTime)}</span>
                    <User size={11} className="text-slate-500 ml-1" />
                    <span className="text-[11px] text-slate-300">{log.fromOperator} → {log.toOperator}</span>
                    {log.confirmed ? (
                      <span className="ml-auto text-[9px] font-mono px-1 py-0.5 bg-cyber-green/10 text-cyber-green rounded-sm">已确认</span>
                    ) : (
                      <span className="ml-auto text-[9px] font-mono px-1 py-0.5 bg-cyber-orange/10 text-cyber-orange rounded-sm">待确认</span>
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-2 pt-0.5 border-t border-deep-sea-700 animate-float-up">
                      <div className="text-[11px] text-slate-400 py-1">{log.summary}</div>
                      {log.openAlerts.length > 0 && (
                        <div className="text-[10px] text-slate-500">未关闭告警 {log.openAlerts.length} 条</div>
                      )}
                      {log.cargoRisks.length > 0 && (
                        <div className="text-[10px] text-slate-500">货损风险 {log.cargoRisks.length} 项</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
