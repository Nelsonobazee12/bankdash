import { Button, Grid, IconButton, InputAdornment, Link, TextField } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useBreakpoints } from 'providers/useBreakpoints';
import { useState } from 'react';
import Cookies from 'js-cookie';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { up } = useBreakpoints();
  const upSM = up('sm');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    fetch(`${backendUrl}/api/v1/registration/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Login Faild, Check Your Email');
        }
        return response.json();
      })
      .then((data) => {
        const { access_token } = data;
        if (access_token) {
          setCookies(access_token);
          setSuccessMessage('Login successful!');
          window.location.href = '/';
          setTimeout(() => {
            setSuccessMessage(null);
          }, 2000);
        } else {
          throw new Error('Authentication token or refresh token is missing or invalid.');
        }
      })
      .catch((error: Error) => {
        console.error('Error:', error);
        setError('Login failed.');
        setTimeout(() => {
          setError(null);
        }, 2000);
      });
  };

  const setCookies = (authToken: string) => {
    console.log('Setting cookie with token:', authToken); // Add this line
    Cookies.set('accessToken', authToken, { expires: 1 });
  };
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} sx={{ mb: 2.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={upSM ? 'medium' : 'small'}
            name="email"
            label="Email address"
            value={formData.email}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={upSM ? 'medium' : 'small'}
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <IconifyIcon icon={showPassword ? 'majesticons:eye' : 'majesticons:eye-off'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end" sx={{ my: 3 }}>
        <Grid item>
          <Link href="/authentication/forget-password" variant="subtitle2" underline="hover">
            Forgot password?
          </Link>
        </Grid>
      </Grid>
      <Button
        fullWidth
        size={upSM ? 'large' : 'medium'}
        type="submit"
        variant="contained"
        color="primary"
      >
        Login
      </Button>
      {successMessage && <p>{successMessage}</p>}
      {error && <p>{error}</p>}
    </form>
  );
};

export default LoginForm;
