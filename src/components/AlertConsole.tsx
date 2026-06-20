import { useState } from 'react';
import {
  AlertTriangle,
  ZapOff,
  ThermometerSun,
  ChevronDown,
  ChevronRight,
  Phone,
  Wrench,
  UserCheck,
  CheckCircle2,
  Clock,
  User,
  Check,
  ListTodo,
  XCircle,
  ArrowRightLeft,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../store';
import type { Alert, Vehicle, DisposalStep } from '../types';
import { alertTypeLabel, formatDateTime, formatDurationMinutes, formatTime } from '../utils/format';

interface StepProps {
  step: DisposalStep;
  alertId: string;
  vehicle: Vehicle;
}

function DisposalStepItem({ step, alertId }: StepProps) {
  const currentOperator = useStore((s) => s.currentOperator);
  const updateDisposalStep = useStore((s) => s.updateDisposalStep);
  const [result, setResult] = useState(step.result);
  const [remark, setRemark] = useState(step.remark);

  const stepIcons = { 1: Phone, 2: Wrench, 3: UserCheck };
  const Icon = stepIcons[step.stepOrder];

  const handleComplete = () => {
    updateDisposalStep(alertId, step.id, {
      completed: true,
      actionTime: new Date().toISOString(),
      result: result || '已联系，待跟进',
      remark,
      operator: currentOperator,
    });
  };

  return (
    <div className={`relative pl-7 pb-4 ${step.completed ? '' : 'border-l-2 border-deep-sea-600 ml-2.5'}`}>
      {!step.completed && (
        <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-deep-sea-800 border border-deep-sea-600 flex items-center justify-center text-slate-400">
          <Icon size={12} />
        </div>
      )}
      {step.completed && (
        <div className="absolute left-[-3px] top-0 w-2 h-2 rounded-full bg-cyber-green ring-2 ring-cyber-green/30" />
      )}
      <div className="mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-200">步骤{step.stepOrder}</span>
          <span className="text-cyber-cyan text-xs">{step.stepName}</span>
          {step.completed && <CheckCircle2 size={12} className="text-cyber-green" />}
        </div>
        <div className="text-[11px] font-mono text-slate-400">{step.actionLabel}</div>
      </div>

      {step.completed ? (
        <div className="bg-deep-sea-900/50 p-2 rounded-sm border border-deep-sea-700">
          <div className="flex items-center gap-3 text-[11px] mb-1 text-slate-400">
            <span className="flex items-center gap-1"><Clock size={11} className="text-cyber-cyan" />{formatDateTime(step.actionTime)}</span>
            <span className="flex items-center gap-1"><User size={11} className="text-cyber-cyan" />{step.operator}</span>
          </div>
          <div className="text-xs text-slate-300">{step.result}</div>
          {step.remark && <div className="text-[11px] text-slate-500 mt-1">备注：{step.remark}</div>}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="记录联系结果..."
            className="w-full bg-deep-sea-900/80 border border-deep-sea-600 focus:border-cyber-cyan/40 rounded-sm p-2 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none h-12"
          />
          <input
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="备注（可选）"
            className="w-full bg-deep-sea-900/80 border border-deep-sea-600 focus:border-cyber-cyan/40 rounded-sm px-2 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none h-7"
          />
          <button onClick={handleComplete} className="btn-cyber border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 text-[11px]">
            <Check size={12} className="inline mr-1" />确认完成
          </button>
        </div>
      )}
    </div>
  );
}

interface AlertItemProps {
  alert: Alert;
  vehicle: Vehicle;
  isOpen: boolean;
  onToggle: () => void;
}

function AlertItem({ alert, vehicle, isOpen, onToggle }: AlertItemProps) {
  const currentOperator = useStore((s) => s.currentOperator);
  const assignAlert = useStore((s) => s.assignAlert);
  const closeAlert = useStore((s) => s.closeAlert);
  const handoverAlert = useStore((s) => s.handoverAlert);
  const [recoverNote, setRecoverNote] = useState('');
  const [showCloseForm, setShowCloseForm] = useState(false);

  const isCritical = alert.level === 'critical';
  const elapsed = Math.floor((Date.now() - new Date(alert.startTime).getTime()) / 60000);

  const allStepsDone = alert.steps.every((s) => s.completed);
  const isMine = alert.assignee === currentOperator;
  const isUnassigned = !alert.assignee;

  const handleAssign = () => assignAlert(alert.id, currentOperator);
  const handleClose = () => {
    closeAlert(alert.id, recoverNote || '已恢复正常制冷');
    setShowCloseForm(false);
  };
  const handleHandover = () => handoverAlert(alert.id);

  const AlertIcon = alert.type === 'poweroff' ? ZapOff : alert.type === 'temp_high' ? ThermometerSun : AlertTriangle;

  const borderClass =
    alert.status === 'closed'
      ? 'border-deep-sea-700'
      : isCritical
      ? 'border-cyber-red/40'
      : 'border-cyber-orange/30';

  return (
    <div className={`glass-card rounded-sm overflow-hidden transition-all ${alert.status === 'closed' ? 'opacity-60' : ''} ${borderClass}`}>
      <button onClick={onToggle} className={`w-full flex items-center gap-3 p-3 ${isCritical && alert.status !== 'closed' ? 'bg-cyber-red/5' : ''} hover:bg-deep-sea-700/40 transition-colors`}>
        <div className={`w-9 h-9 rounded-sm flex items-center justify-center ${isCritical ? 'bg-cyber-red/20 text-cyber-red' : 'bg-cyber-orange/20 text-cyber-orange'}`}>
          <AlertIcon size={18} className={alert.status === 'open' || alert.status === 'processing' ? 'animate-blink' : ''} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-white">{vehicle.plateNumber}</span>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm ${isCritical ? 'bg-cyber-red/20 text-cyber-red' : 'bg-cyber-orange/20 text-cyber-orange'}`}>
              {alertTypeLabel(alert.type)}
            </span>
            {alert.status === 'closed' && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-cyber-green/20 text-cyber-green">已闭环</span>}
            {alert.status === 'handover' && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-cyber-blue/20 text-cyber-blue">转下一班</span>}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
            <span>{vehicle.route}</span>
            <span>·</span>
            <span>{formatTime(alert.startTime)} 触发</span>
            <span>·</span>
            <span className="font-mono text-cyber-orange">{formatDurationMinutes(elapsed)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isMine && alert.status === 'processing' && (
            <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-1.5 py-0.5 rounded-sm">处置中</span>
          )}
          {isUnassigned && alert.status === 'open' && (
            <span className="text-[10px] font-mono text-cyber-orange animate-blink">待接单</span>
          )}
          {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-cyber-cyan/10 animate-float-up">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 p-2.5 bg-deep-sea-900/40 rounded-sm mb-3">
            <div className="text-[11px] text-slate-400">司机：<span className="text-slate-200">{vehicle.driverName}</span> <span className="font-mono text-cyber-cyan">{vehicle.driverPhone}</span></div>
            <div className="text-[11px] text-slate-400">位置：<span className="text-slate-200">{vehicle.currentLocation}</span></div>
            <div className="text-[11px] text-slate-400">货主：<span className="text-slate-200">{vehicle.cargoOwner}</span></div>
            <div className="text-[11px] text-slate-400">批次：<span className="font-mono">{vehicle.batchNo.slice(-10)}</span></div>
            <div className="text-[11px] text-slate-400">当前温度：<span className={`font-mono font-bold ${isCritical ? 'text-cyber-red' : 'text-cyber-orange'}`}>{vehicle.currentTemp}°C</span></div>
            <div className="text-[11px] text-slate-400">持续时长：<span className="font-mono text-cyber-red">{formatDurationMinutes(vehicle.powerOffMinutes || elapsed)}</span></div>
          </div>

          {isUnassigned && alert.status === 'open' && (
            <button onClick={handleAssign} className="w-full mb-3 btn-cyber border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10">
              接单并开始处置
            </button>
          )}

          {(isMine || alert.status === 'processing') && alert.status !== 'closed' && alert.status !== 'handover' && (
            <>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ListTodo size={12} />
                处置流程
              </div>
              <div className="space-y-1">
                {alert.steps.map((s) => (
                  <DisposalStepItem key={s.id} step={s} alertId={alert.id} vehicle={vehicle} />
                ))}
              </div>

              {allStepsDone && !showCloseForm && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-deep-sea-700">
                  <button onClick={() => setShowCloseForm(true)} className="flex-1 btn-cyber border-cyber-green text-cyber-green hover:bg-cyber-green/10 text-[11px]">
                    <RotateCcw size={12} className="inline mr-1" />标记已恢复
                  </button>
                  <button onClick={handleHandover} className="flex-1 btn-cyber border-cyber-orange text-cyber-orange hover:bg-cyber-orange/10 text-[11px]">
                    <ArrowRightLeft size={12} className="inline mr-1" />转下一班
                  </button>
                </div>
              )}

              {showCloseForm && (
                <div className="mt-2 pt-2 border-t border-deep-sea-700 space-y-2">
                  <textarea
                    value={recoverNote}
                    onChange={(e) => setRecoverNote(e.target.value)}
                    placeholder="恢复情况说明..."
                    className="w-full bg-deep-sea-900/80 border border-deep-sea-600 focus:border-cyber-cyan/40 rounded-sm p-2 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none h-14"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleClose} className="flex-1 btn-cyber border-cyber-green text-cyber-green hover:bg-cyber-green/10 text-[11px]">
                      <CheckCircle2 size={12} className="inline mr-1" />确认关闭
                    </button>
                    <button onClick={() => setShowCloseForm(false)} className="flex-1 btn-cyber border-deep-sea-600 text-slate-400 hover:text-slate-200 text-[11px]">
                      <XCircle size={12} className="inline mr-1" />取消
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {alert.status === 'closed' && alert.recoverNote && (
            <div className="text-[11px] text-slate-400">
              <span className="text-cyber-green">恢复说明：</span>{alert.recoverNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AlertConsole() {
  const alerts = useStore((s) => s.alerts);
  const vehicles = useStore((s) => s.vehicles);
  const selectedAlertId = useStore((s) => s.selectedAlertId);
  const setSelectedAlert = useStore((s) => s.setSelectedAlert);

  const sortedAlerts = [...alerts].sort((a, b) => {
    const levelOrder = { critical: 0, warning: 1 };
    if (levelOrder[a.level] !== levelOrder[b.level]) return levelOrder[a.level] - levelOrder[b.level];
    const statusOrder = { open: 0, processing: 1, handover: 2, closed: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  const openCount = alerts.filter((a) => a.status === 'open').length;
  const processingCount = alerts.filter((a) => a.status === 'processing').length;
  const closedCount = alerts.filter((a) => a.status === 'closed').length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-cyber-orange" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-cyber-cyan">告警处置台</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-1.5 py-0.5 rounded-sm bg-cyber-red/20 text-cyber-red">{openCount}待接</span>
          <span className="px-1.5 py-0.5 rounded-sm bg-cyber-orange/20 text-cyber-orange">{processingCount}处置中</span>
          <span className="px-1.5 py-0.5 rounded-sm bg-cyber-green/20 text-cyber-green">{closedCount}已闭环</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-2">
        {sortedAlerts.length === 0 && (
          <div className="text-center text-slate-500 py-8 text-sm">暂无告警</div>
        )}
        {sortedAlerts.map((alert) => {
          const vehicle = vehicles.find((v) => v.id === alert.vehicleId);
          if (!vehicle) return null;
          const isOpen = selectedAlertId === alert.id;
          return (
            <AlertItem
              key={alert.id}
              alert={alert}
              vehicle={vehicle}
              isOpen={isOpen}
              onToggle={() => setSelectedAlert(isOpen ? null : alert.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
