import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { AuthLayout } from '../features/auth/AuthLayout';
import { useLogin } from '../features/auth/hooks';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/', { replace: true }) },
    );
  };

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.error ? 'Something went wrong.' : null;

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your PropertyLens account">
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={login.isPending || !email || !password}
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Typography component={Link} to="/register" variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Create one
            </Typography>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
