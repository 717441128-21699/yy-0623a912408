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
  ClipboardCheck,
  Warehouse,
  ThumbsUp,
  AlertCircle as AlertIcon,
  Package,
  Thermometer,
  ListChecks,
} from 'lucide-react';
import { useStore } from '../store';
import type { CargoRisk, RiskStatus, VehicleClosureSummary } from '../types';
import { formatDateTime, formatDurationMinutes, formatTime } from '../utils/format';

const RISK_STATUS_CONFIG: Record<RiskStatus, { label: string; color: string; icon: any }> = {
  pending_inspection: { label: '待抽检', color: 'text-cyber-red bg-cyber-red/10 border-cyber-red/30', icon: AlertCircle },
  warehouse_notified: { label: '已通知仓库', color: 'text-cyber-orange bg-cyber-orange/10 border-cyber-orange/30', icon: Warehouse },
  inspection_passed: { label: '抽检通过', color: 'text-cyber-green bg-cyber-green/10 border-cyber-green/30', icon: ThumbsUp },
  escalated: { label: '异常升级', color: 'text-cyber-red bg-cyber-red/20 border-cyber-red/50', icon: AlertIcon },
};

const RISK_LEVEL_COLOR: Record<string, string> = {
  high: 'text-cyber-red bg-cyber-red/10 border-cyber-red/30',
  medium: 'text-cyber-orange bg-cyber-orange/10 border-cyber-orange/30',
  low: 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/30',
  none: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const RISK_LEVEL_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
  none: '无',
};

function RiskStatusBadge({ status }: { status: RiskStatus }) {
  const cfg = RISK_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono uppercase rounded-sm border ${cfg.color}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

function VehicleSummaryCard({ summary }: { summary: VehicleClosureSummary }) {
  const [expanded, setExpanded] = useState(false);
  const riskColor = RISK_LEVEL_COLOR[summary.riskLevel];

  return (
    <div className="bg-deep-sea-900/50 rounded-sm border border-cyber-cyan/10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-2 hover:bg-deep-sea-800/50 transition-colors text-left"
      >
        {expanded ? <ChevronDown size={12} className="text-cyber-cyan shrink-0" /> : <ChevronRight size={12} className="text-cyber-cyan shrink-0" />}
        <span className="font-mono text-xs font-bold text-white shrink-0">{summary.plateNumber}</span>
        <span className="text-[10px] text-slate-400 truncate">{summary.route}</span>
        <span className={`ml-auto text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border ${riskColor} shrink-0`}>
          {RISK_LEVEL_LABEL[summary.riskLevel]}风险
        </span>
        {summary.needsInspection && (
          <ClipboardCheck size={11} className="text-cyber-orange shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-2 pb-2 pt-0.5 border-t border-deep-sea-700 animate-float-up space-y-1.5">
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
            <div className="text-slate-500">货主</div>
            <div className="text-slate-300 text-right">{summary.cargoOwner}</div>
            <div className="text-slate-500">批次</div>
            <div className="font-mono text-slate-300 text-right">{summary.batchNo.slice(-10)}</div>
            <div className="text-slate-500 flex items-center gap-1"><Clock size={9} />告警起</div>
            <div className="font-mono text-cyber-red text-right">{formatTime(summary.alertStartTime)}</div>
            <div className="text-slate-500 flex items-center gap-1"><CheckCircle2 size={9} />恢复于</div>
            <div className="font-mono text-cyber-green text-right">{formatTime(summary.alertCloseTime)}</div>
            <div className="text-slate-500 flex items-center gap-1"><Thermometer size={9} />断电时长</div>
            <div className="font-mono text-cyber-orange text-right">{formatDurationMinutes(summary.totalPowerOffMinutes)}</div>
            <div className="text-slate-500 flex items-center gap-1"><ListChecks size={9} />处置步骤</div>
            <div className="font-mono text-cyber-cyan text-right">{summary.stepsCompleted}/{summary.stepsTotal}</div>
          </div>
          {summary.recoverNote && (
            <div className="mt-1 p-1.5 bg-cyber-green/5 border border-cyber-green/20 rounded-sm">
              <div className="text-[9px] text-cyber-green uppercase tracking-wider mb-0.5">恢复说明</div>
              <div className="text-[11px] text-slate-300">{summary.recoverNote}</div>
            </div>
          )}
          {summary.needsInspection && (
            <div className="flex items-center gap-1 text-[10px] text-cyber-orange">
              <ClipboardCheck size={11} />
              <span>到货后需抽检中心温度</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CargoRiskItem({ risk }: { risk: CargoRisk }) {
  const updateRiskStatus = useStore((s) => s.updateRiskStatus);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-2 bg-deep-sea-900/50 rounded-sm border-l-2 border-cyber-orange/40">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="font-mono text-xs text-white">{risk.plateNumber}</span>
        <span className={`text-[9px] font-mono uppercase px-1 py-0.5 rounded-sm border ${RISK_LEVEL_COLOR[risk.level]}`}>
          {RISK_LEVEL_LABEL[risk.level]}
        </span>
        <span className="text-[10px] font-mono text-slate-500">断电{risk.powerOffMinutes}分</span>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="ml-auto"
        >
          <RiskStatusBadge status={risk.status} />
        </button>
      </div>
      <div className="text-[11px] text-slate-300 mb-1">{risk.description}</div>
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <Package size={10} />
        <span className="font-mono">{risk.batchNo.slice(-8)}</span>
        <User size={10} className="ml-1" />
        <span>{risk.operator}</span>
        <Clock size={10} className="ml-1" />
        <span className="font-mono">{formatTime(risk.updatedAt)}</span>
      </div>
      {showMenu && (
        <div className="mt-2 pt-2 border-t border-deep-sea-700 flex flex-wrap gap-1 animate-float-up">
          {(Object.keys(RISK_STATUS_CONFIG) as RiskStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => {
                updateRiskStatus(risk.id, st);
                setShowMenu(false);
              }}
              disabled={risk.status === st}
              className={`px-1.5 py-0.5 text-[10px] rounded-sm border transition-all ${
                risk.status === st
                  ? 'opacity-50 cursor-not-allowed border-deep-sea-600 text-slate-500'
                  : RISK_STATUS_CONFIG[st].color + ' hover:brightness-125'
              }`}
            >
              {RISK_STATUS_CONFIG[st].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HandoverRecord() {
  const currentOperator = useStore((s) => s.currentOperator);
  const alerts = useStore((s) => s.alerts);
  const vehicles = useStore((s) => s.vehicles);
  const cargoRisks = useStore((s) => s.cargoRisks);
  const handoverLogs = useStore((s) => s.handoverLogs);
  const createHandoverLog = useStore((s) => s.createHandoverLog);
  const getRecoveredVehicleIds = useStore((s) => s.getRecoveredVehicleIds);
  const getVehicleSummaries = useStore((s) => s.getVehicleSummaries);

  const [toOperator, setToOperator] = useState('赵早班');
  const [summary, setSummary] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [summariesTab, setSummariesTab] = useState<'recovered' | 'open'>('recovered');

  const openAlerts = alerts.filter((a) => a.status !== 'closed');
  const recoveredIds = getRecoveredVehicleIds();
  const vehicleSummaries = getVehicleSummaries();
  const activeRisks = cargoRisks.filter((r) => r.status !== 'inspection_passed');
  const recoveredThisShift = vehicleSummaries.filter((s) =>
    new Date(s.alertCloseTime).getTime() > Date.now() - 8 * 60 * 60 * 1000
  );
  const recoveredPlates = recoveredIds
    .map((id) => vehicles.find((v) => v.id === id)?.plateNumber)
    .filter(Boolean) as string[];

  const openAlertVehicles = openAlerts.map((a) => {
    const v = vehicles.find((veh) => veh.id === a.vehicleId);
    return { alert: a, vehicle: v };
  }).filter((x) => x.vehicle);

  const generateAutoSummary = () => {
    const parts = [];
    parts.push(`本班次共产生告警${alerts.filter(a => new Date(a.startTime).getTime() > Date.now() - 8 * 60 * 60 * 1000).length}条`);
    parts.push(`恢复${recoveredThisShift.length}辆`);
    if (openAlerts.length > 0) parts.push(`未关闭${openAlerts.length}条需跟进`);
    if (activeRisks.length > 0) parts.push(`${activeRisks.length}项货损风险待处理`);
    const pendingCount = cargoRisks.filter(r => r.status === 'pending_inspection').length;
    if (pendingCount > 0) parts.push(`${pendingCount}辆车待到货抽检`);
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
        <div className="flex gap-1 bg-deep-sea-800 rounded-sm overflow-hidden border border-cyber-cyan/10 p-0.5">
          <button
            onClick={() => setSummariesTab('recovered')}
            className={`flex-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
              summariesTab === 'recovered' ? 'bg-cyber-cyan/20 text-cyber-cyan rounded-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 size={11} />已恢复 {recoveredThisShift.length}
          </button>
          <button
            onClick={() => setSummariesTab('open')}
            className={`flex-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
              summariesTab === 'open' ? 'bg-cyber-cyan/20 text-cyber-cyan rounded-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle size={11} />未关闭 {openAlerts.length}
          </button>
        </div>

        {summariesTab === 'recovered' && (
          <div className="glass-card rounded-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={13} className="text-cyber-green" />
              <span className="text-xs font-medium text-slate-200">闭环车辆摘要</span>
              <span className="ml-auto font-mono text-[11px] text-cyber-green">{recoveredThisShift.length}辆</span>
            </div>
            {recoveredThisShift.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-3">本班次暂无恢复车辆</div>
            ) : (
              <div className="space-y-1.5">
                {recoveredThisShift.map((s) => (
                  <VehicleSummaryCard key={s.vehicleId} summary={s} />
                ))}
              </div>
            )}
            {recoveredPlates.length > 0 && (
              <div className="mt-2 pt-2 border-t border-deep-sea-700">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">累计恢复车牌</div>
                <div className="flex flex-wrap gap-1">
                  {recoveredPlates.map((p) => (
                    <span key={p} className="px-1.5 py-0.5 text-[10px] font-mono bg-cyber-green/10 text-cyber-green rounded-sm border border-cyber-green/20">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {summariesTab === 'open' && (
          <div className="glass-card rounded-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={13} className="text-cyber-red" />
              <span className="text-xs font-medium text-slate-200">未关闭告警</span>
              <span className="ml-auto font-mono text-[11px] text-cyber-red">{openAlerts.length}</span>
            </div>
            {openAlertVehicles.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-3">所有告警已闭环</div>
            ) : (
              <div className="space-y-1.5">
                {openAlertVehicles.map(({ alert, vehicle }) => (
                  <div key={alert.id} className="p-2 bg-deep-sea-900/50 rounded-sm border border-deep-sea-700">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={11} className={alert.level === 'critical' ? 'text-cyber-red' : 'text-cyber-orange'} />
                      <span className="font-mono text-xs font-bold text-white">{vehicle!.plateNumber}</span>
                      <span className="text-[10px] text-slate-400">{vehicle!.route}</span>
                      <span className={`ml-auto text-[9px] font-mono px-1 py-0.5 rounded-sm ${
                        alert.status === 'processing' ? 'bg-cyber-cyan/10 text-cyber-cyan' : 'bg-cyber-red/10 text-cyber-red'
                      }`}>
                        {alert.status === 'processing' ? '处置中' : alert.status === 'handover' ? '转下一班' : '待接单'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 text-[10px]">
                      <div className="text-slate-500">始于 <span className="font-mono text-slate-300">{formatTime(alert.startTime)}</span></div>
                      <div className="text-slate-500 text-right">
                        步骤 <span className="font-mono text-cyber-cyan">
                          {alert.steps.filter(s => s.completed).length}/{alert.steps.length}
                        </span>
                      </div>
                      <div className="text-slate-500">司机 <span className="text-slate-300">{vehicle!.driverName}</span></div>
                      <div className="text-slate-500 text-right font-mono">{vehicle!.driverPhone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="glass-card rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon size={13} className="text-cyber-orange" />
            <span className="text-xs font-medium text-slate-200">货损风险跟进</span>
            <span className="ml-auto font-mono text-[11px] text-cyber-orange">{activeRisks.length}项待跟进</span>
          </div>
          {cargoRisks.length === 0 ? (
            <div className="text-[11px] text-slate-500 text-center py-3">暂无货损风险</div>
          ) : (
            <div className="space-y-1.5">
              {cargoRisks.map((r) => (
                <CargoRiskItem key={r.id} risk={r} />
              ))}
            </div>
          )}
          {cargoRisks.length > 0 && (
            <div className="mt-2 pt-2 border-t border-deep-sea-700 flex flex-wrap gap-2 text-[10px]">
              {(Object.keys(RISK_STATUS_CONFIG) as RiskStatus[]).map((st) => {
                const count = cargoRisks.filter((r) => r.status === st).length;
                const cfg = RISK_STATUS_CONFIG[st];
                return (
                  <span key={st} className={`px-1.5 py-0.5 rounded-sm border ${cfg.color}`}>
                    {cfg.label} {count}
                  </span>
                );
              })}
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
              确认交班并存档
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
                <div key={log.id} className="bg-deep-sea-900/50 rounded-sm overflow-hidden border border-deep-sea-700">
                  <button
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-deep-sea-800/50 transition-colors text-left"
                  >
                    {isExpanded ? <ChevronDown size={12} className="text-slate-500 shrink-0" /> : <ChevronRight size={12} className="text-slate-500 shrink-0" />}
                    <Clock size={11} className="text-cyber-cyan shrink-0" />
                    <span className="text-[11px] font-mono text-cyber-cyan">{formatDateTime(log.handoverTime)}</span>
                    <User size={11} className="text-slate-500 ml-1 shrink-0" />
                    <span className="text-[11px] text-slate-300">{log.fromOperator} → {log.toOperator}</span>
                    {log.confirmed ? (
                      <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 bg-cyber-green/10 text-cyber-green rounded-sm">已确认</span>
                    ) : (
                      <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 bg-cyber-orange/10 text-cyber-orange rounded-sm animate-blink">待确认</span>
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-2 pb-2 pt-0.5 border-t border-deep-sea-700 animate-float-up space-y-2">
                      <div className="text-[11px] text-slate-300 p-1.5 bg-deep-sea-800/50 rounded-sm">{log.summary}</div>
                      {log.vehicleSummaries.length > 0 && (
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                            闭环车辆 {log.vehicleSummaries.length}辆
                          </div>
                          <div className="space-y-1">
                            {log.vehicleSummaries.map((s) => (
                              <VehicleSummaryCard key={s.vehicleId} summary={s} />
                            ))}
                          </div>
                        </div>
                      )}
                      {log.openAlerts.length > 0 && (
                        <div className="text-[10px] text-cyber-red">
                          未关闭告警：{log.openAlerts.length}条转下一班
                        </div>
                      )}
                      {log.cargoRisks.length > 0 && (
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                            跟进风险 {log.cargoRisks.length}项
                          </div>
                          <div className="space-y-1">
                            {log.cargoRisks.map((r) => (
                              <div key={r.id} className="p-1.5 bg-deep-sea-800/30 rounded-sm text-[10px]">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="font-mono text-slate-300">{r.plateNumber}</span>
                                  <RiskStatusBadge status={r.status} />
                                </div>
                                <div className="text-slate-400">{r.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
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
