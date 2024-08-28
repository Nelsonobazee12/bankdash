import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  Stack,
  Typography,
  Link,
} from '@mui/material';
import { useEffect, useState, MouseEvent } from 'react';
import { Fragment } from 'react/jsx-runtime';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import IconifyIcon from 'components/base/IconifyIcon';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

interface UserProfile {
  name: string;
  roles: string;
  email: string;
  image: string;
}

/* ------------------------Profile dropdown Data --------------------------- */
const profileData = [
  {
    href: '#!',
    title: 'My Profile',
    subtitle: 'Account Settings',
    icon: 'fa:user-circle-o',
    color: 'primary.light',
  },
];
/* -------------------------------------------------------------------------- */

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');

    if (accessToken) {
      fetch(`${backendUrl}/api/v1/get_current_user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserProfile(data);
        })
        .catch((error) => {
          console.error('Failed to fetch user profile:', error);
        });
    }
  }, []);

  const handleOpenDropdown = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    const accessToken = Cookies.get('accessToken');

    fetch(`${backendUrl}/api/v1/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Logout failed.');
        }

        Cookies.remove('accessToken');
        navigate('/authentication/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <Fragment>
      <IconButton sx={{ p: 0, position: 'relative' }} onClick={handleOpenDropdown}>
        <Avatar
          alt="Avatar"
          src={userProfile?.image}
          sx={{ width: { xs: 40, md: 45, xl: 60 }, height: { xs: 40, md: 45, xl: 60 } }}
        />
      </IconButton>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: 280,
            bgcolor: 'common.white',
          },
        }}
      >
        <Box p={3}>
          <Typography variant="subtitle1" color="text.primary">
            User Profile
          </Typography>
          <Stack direction="row" py={2.5} spacing={1.5} alignItems="center">
            <Avatar src={userProfile?.image} alt="Profile Image" sx={{ width: 65, height: 65 }} />
            <Box>
              <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
                {userProfile?.name || 'Loading...'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {userProfile?.roles || 'Loading...'}
              </Typography>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                display="flex"
                alignItems="center"
                gap={0.5}
              >
                <IconifyIcon icon="majesticons:mail-line" />
                {userProfile?.email || 'Loading...'}
              </Typography>
            </Box>
          </Stack>
          <Divider />
          {/* Profile Data Links */}
          {profileData.map((profileItem) => (
            <Box key={profileItem.title} sx={{ py: 1.5, px: 0 }}>
              <Link href={profileItem.href}>
                <Stack direction="row" spacing={1.5}>
                  <Stack
                    direction="row"
                    sx={{
                      width: 45,
                      height: 45,
                      bgcolor: 'neutral.light',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{
                        minWidth: 24,
                        height: 24,
                        bgcolor: 'transparent',
                      }}
                    >
                      <IconifyIcon icon={profileItem.icon} color={profileItem.color} />
                    </Avatar>
                  </Stack>
                  <div>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      noWrap
                      sx={{
                        width: 150,
                      }}
                    >
                      {profileItem.title}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: 150,
                      }}
                      noWrap
                    >
                      {profileItem.subtitle}
                    </Typography>
                  </div>
                </Stack>
              </Link>
            </Box>
          ))}
          <Box mt={1.25}>
            <Button onClick={handleLogout} variant="outlined" color="error" fullWidth>
              Logout
            </Button>
          </Box>
        </Box>
      </Menu>
    </Fragment>
  );
};

export default ProfileDropdown;
