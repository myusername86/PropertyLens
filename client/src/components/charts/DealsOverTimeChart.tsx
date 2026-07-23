import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Deal } from '../../api/types';
import { accent } from '../../theme';

interface DealsOverTimeChartProps {
  deals: Deal[];
}

/** Weekly count of deals analyzed, showing pipeline activity over time. */
export function DealsOverTimeChart({ deals }: DealsOverTimeChartProps) {
  if (deals.length < 2) {
    return null;
  }

  const weekBuckets = new Map<string, number>();

  for (const deal of deals) {
    const date = new Date(deal.createdAt);
    const dayOfWeek = (date.getDay() + 6) % 7;
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);
    const key = weekStart.toISOString().slice(0, 10);
    weekBuckets.set(key, (weekBuckets.get(key) ?? 0) + 1);
  }

  const data = [...weekBuckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Deals analyzed over time
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Weekly activity
        </Typography>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F1A2E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: '#F1F5F9',
              }}
            />
            <Line type="monotone" dataKey="count" stroke={accent} strokeWidth={2} dot={{ fill: accent, r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}