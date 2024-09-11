import React, { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { useBreakpoints } from 'providers/useBreakpoints';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ResetPasswordForm = () => {
  const [newPassword, setnewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const { up } = useBreakpoints();
  const upSM = up('sm');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token is missing.');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setError('Token is missing.');
      return;
    }

    fetch(`${backendUrl}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || 'Failed to reset password. Please try again.');
          });
        }
        return response.json();
      })
      .then(() => {
        setSuccess('Your password has been reset successfully.');
        setError('');
        setTimeout(() => {
          setSuccess('');
        }, 2000);
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error:', errorMessage);
        setError(errorMessage);
        setTimeout(() => {
          setError('');
        }, 2000);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          size={upSM ? 'medium' : 'small'}
          type="password"
          name="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setnewPassword(e.target.value)}
        />
        <TextField
          fullWidth
          size={upSM ? 'medium' : 'small'}
          type="password"
          name="confirmPassword"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Stack>

      <Button
        fullWidth
        size={upSM ? 'large' : 'medium'}
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        disabled={!newPassword || newPassword !== confirmPassword}
      >
        Reset Password
      </Button>

      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError('')}>
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSuccess('')}>
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>
      )}

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          OR
        </Typography>
      </Divider>

      <Typography textAlign="center" fontWeight={400} color="text.primary" variant="subtitle1">
        Remembered your Password?
      </Typography>

      <Button
        component={Link}
        href="/authentication/login"
        fullWidth
        size={upSM ? 'large' : 'medium'}
        type="button" // Changed to "button" to prevent form submission
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
      >
        Back to Sign-in
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
