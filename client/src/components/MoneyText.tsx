import Typography from '@mui/material/Typography';
import type { TypographyProps } from '@mui/material/Typography';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface MoneyTextProps extends TypographyProps {
  amount: number | null | undefined;
}

/** Formats currency consistently everywhere. Renders an em dash when absent. */
export function MoneyText({ amount, ...typographyProps }: MoneyTextProps) {
  return (
    <Typography component="span" {...typographyProps}>
      {amount === null || amount === undefined ? '—' : formatter.format(amount)}
    </Typography>
  );
}
