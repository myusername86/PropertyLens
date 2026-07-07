import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Deal } from '../../api/types';

interface ProfitCompositionChartProps {
  deals: Deal[];
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Cumulative projected profit across analyzed deals, oldest first. */
export function ProfitCompositionChart({ deals }: ProfitCompositionChartProps) {
  let running = 0;
  const data = [...deals]
    .filter((deal) => deal.estimatedProfit !== null)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((deal, index) => {
      running += deal.estimatedProfit ?? 0;
      return { name: `#${index + 1}`, cumulative: running };
    });

  if (data.length < 2) {
    return null;
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Cumulative projected profit
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Across analyzed deals, oldest first
        </Typography>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14F0C8" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#14F0C8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => currency.format(value)}
              width={86}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F1A2E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: '#F1F5F9',
              }} formatter={(value) => [currency.format(Number(value)), 'Cumulative profit']} />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#14F0C8"
              strokeWidth={2}
              fill="url(#profitFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
