import { useEffect, useState } from 'react';

export function ScoreGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const min = 300;
  const max = 850;
  const pct = Math.max(0, Math.min(1, (animated - min) / (max - min)));

  const cx = 120;
  const cy = 120;
  const r = 90;
  const startAngle = -220;
  const sweepDeg = 260;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcX = (deg: number) => cx + r * Math.cos(toRad(deg));
  const arcY = (deg: number) => cy + r * Math.sin(toRad(deg));

  const endAngle = startAngle + sweepDeg * pct;

  const trackPath = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 1 1 ${arcX(startAngle + sweepDeg)} ${arcY(startAngle + sweepDeg)}`;
  const fillPath =
    pct === 0
      ? ''
      : `M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 ${sweepDeg * pct > 180 ? 1 : 0} 1 ${arcX(endAngle)} ${arcY(endAngle)}`;

  const color =
    score >= 750 ? '#00D4AA' : score >= 650 ? '#60A5FA' : score >= 550 ? '#F59E0B' : '#EF4444';

  return (
    <svg viewBox="0 0 240 200" className="w-full max-w-60">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path d={trackPath} fill="none" stroke="#1E2D45" strokeWidth="12" strokeLinecap="round" />
      {fillPath && (
        <path
          d={fillPath}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          style={{ transition: 'all 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      )}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill={color}
        fontSize="38"
        fontWeight="700"
        fontFamily="'DM Serif Display', Georgia, serif"
      >
        {animated}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#8B9BB4" fontSize="11" fontFamily="Inter, sans-serif">
        CREDIT SCORE
      </text>
      <text x={cx} y={cy + 36} textAnchor="middle" fill="#8B9BB4" fontSize="9" fontFamily="Inter, sans-serif">
        300 – 850
      </text>
    </svg>
  );
}