import { Button, Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useBreakpoints } from 'providers/useBreakpoints';
import { useState } from 'react';
import Cookies from 'js-cookie';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    fetch(`${backendUrl}/api/v1/registration/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Registration failed. Please try again later.');
        }
        return response.json();
      })
      .then((data) => {
        const { access_token } = data;
        if (access_token) {
          setCookies(access_token);
          setSuccessMessage('Registration successful! Please confirm your email');
          setTimeout(() => {
            setSuccessMessage(null);
          }, 2000);
        } else {
          throw new Error('Authentication token or refresh token is missing or invalid.');
        }
      })
      .catch((error: Error) => {
        console.error('Error:', error);
        setError('Registration failed.');
        setTimeout(() => {
          setError(null);
        }, 2000);
      });
  };

  const setCookies = (authToken: string) => {
    Cookies.set('accessToken', authToken, { expires: 1 });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} sx={{ mb: 2.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={upSM ? 'medium' : 'small'}
            name="name"
            label="User Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={upSM ? 'medium' : 'small'}
            name="email"
            label="Email address"
            type="email"
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
        <Grid item xs={12}>
          <TextField
            fullWidth
            size={upSM ? 'medium' : 'small'}
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    <IconifyIcon
                      icon={showConfirmPassword ? 'majesticons:eye' : 'majesticons:eye-off'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <Button
        fullWidth
        size={upSM ? 'large' : 'medium'}
        type="submit"
        variant="contained"
        color="primary"
      >
        Sign Up
      </Button>
      {successMessage && <p>{successMessage}</p>}
      {error && <p>{error}</p>}
    </form>
  );
};

export default SignupForm;
