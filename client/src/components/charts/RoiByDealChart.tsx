import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Deal } from '../../api/types';
import { RiskLevel } from '../../api/types';
import { riskColors } from '../../theme';

interface RoiByDealChartProps {
  deals: Deal[];
}

/** ROI per analyzed deal, colored by risk — return and risk in one glance. */
export function RoiByDealChart({ deals }: RoiByDealChartProps) {
  const data = deals
    .filter((deal) => deal.roiPercent !== null)
    .slice(0, 10)
    .map((deal) => ({
      name: deal.address.length > 16 ? `${deal.address.slice(0, 16)}…` : deal.address,
      roi: deal.roiPercent,
      risk: deal.riskLevel,
    }));

  if (data.length === 0) {
    return null;
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ROI by deal
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Colored by risk level
        </Typography>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F1A2E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: '#F1F5F9',
              }}
              cursor={{ fill: 'rgba(20, 240, 200, 0.06)' }}
              formatter={(value) => [`${value}%`, 'ROI']}
            />
            <Bar dataKey="roi" radius={[6, 6, 0, 0]} maxBarSize={44}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={riskToColor(entry.risk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function riskToColor(risk: RiskLevel): string {
  switch (risk) {
    case RiskLevel.Low:
      return riskColors.low;
    case RiskLevel.Medium:
      return riskColors.medium;
    case RiskLevel.High:
      return riskColors.high;
    default:
      return riskColors.unknown;
  }
}
