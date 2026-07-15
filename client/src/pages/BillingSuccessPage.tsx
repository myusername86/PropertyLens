import CelebrationIcon from '@mui/icons-material/Celebration';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { accent } from '../theme';

export function BillingSuccessPage() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <Card className="rise-in" sx={{ maxWidth: 460, textAlign: 'center' }}>
        <CardContent sx={{ p: 5 }}>
          <CelebrationIcon sx={{ fontSize: 56, color: accent, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Payment successful
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your subscription is active. Your new plan limits apply within moments —
            time to put them to work.
          </Typography>
          <Button component={Link} to="/deals/new" variant="contained" sx={{ mr: 1 }}>
            Analyze a property
          </Button>
          <Button component={Link} to="/" variant="outlined">
            Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}