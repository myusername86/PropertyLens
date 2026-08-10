import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { AuthLayout } from '../features/auth/AuthLayout';
import { useRegister } from '../features/auth/hooks';

interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Contains a number', test: (v) => /\d/.test(v) },
];

export function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const failedRules = useMemo(
    () => passwordRules.filter((rule) => !rule.test(password)),
    [password],
  );
  const passwordValid = failedRules.length === 0;

  const canSubmit =
    companyName.trim() !== '' &&
    displayName.trim() !== '' &&
    email.trim() !== '' &&
    passwordValid;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) {
      return;
    }
    registerMutation.mutate(
      { companyName, displayName, email, password },
      { onSuccess: () => navigate('/', { replace: true }) },
    );
  };

  const errorMessage =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : registerMutation.error
        ? 'Something went wrong.'
        : null;

  return (
    <AuthLayout title="Create your workspace" subtitle="Set up your company's PropertyLens account">
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="Company name"
            fullWidth
            required
            autoFocus
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <TextField
            label="Your name"
            fullWidth
            required
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={touched && !passwordValid && password !== ''}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack spacing={0.5}>
            {passwordRules.map((rule) => {
              const met = rule.test(password);
              return (
                <Stack key={rule.label} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {met ? (
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#34D399' }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  )}
                  <Typography variant="caption" color={met ? 'text.primary' : 'text.secondary'}>
                    {rule.label}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={registerMutation.isPending || !canSubmit}
          >
            {registerMutation.isPending ? 'Creating workspace…' : 'Create workspace'}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Typography component={Link} to="/login" variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Sign in
            </Typography>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
