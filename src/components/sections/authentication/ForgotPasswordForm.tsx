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
import { useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { up } = useBreakpoints();
  const upSM = up('sm');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then(async (response) => {
        const data = await response.json(); // Read the response as JSON

        if (!response.ok) {
          // Handle error response
          throw new Error(
            data.message || 'Failed to send reset password link. Please check your email.',
          );
        }

        // If the response is OK, handle success
        setSuccess(data.message);
        setError('');
        setTimeout(() => {
          setSuccess('');
        }, 2000);
      })
      .catch((error: Error) => {
        console.error('Error:', error);
        setError(error.message);
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
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Stack>

      <Button
        fullWidth
        size={upSM ? 'large' : 'medium'}
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
      >
        Send Reset Password Link
      </Button>

      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      )}

      <Divider sx={{ my: 2 }}>
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
        type="button"
        variant="contained"
        color="primary"
        sx={{ mt: 3, '&:hover': { color: 'common.white' } }}
      >
        Back to Sign-in
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
