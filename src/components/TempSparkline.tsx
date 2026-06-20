interface Props {
  data: number[];
  targetTemp?: number;
  width?: number;
  height?: number;
  status?: 'normal' | 'warning' | 'poweroff';
}

export default function TempSparkline({ data, targetTemp, width = 120, height = 36, status = 'normal' }: Props) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data, targetTemp ?? Infinity);
  const max = Math.max(...data, targetTemp ?? -Infinity);
  const range = max - min || 1;

  const strokeColor =
    status === 'poweroff'
      ? '#FF2D55'
      : status === 'warning'
      ? '#FF9F0A'
      : '#30D158';

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - 2 - ((v - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${status}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${status})`} />
      <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.5" />
      {targetTemp !== undefined && (() => {
        const ty = height - 2 - ((targetTemp - min) / range) * (height - 4);
        return (
          <line
            x1="0"
            y1={ty}
            x2={width}
            y2={ty}
            stroke="#64D2FF"
            strokeWidth="1"
            strokeDasharray="3,2"
            opacity="0.5"
          />
        );
      })()}
    </svg>
  );
}
