import React, { Fragment, useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
// import StatementImage from 'assets/income-details.svg';
// import LoanImage from 'assets/loan.svg';
// import TransactionImage from 'assets/transaction-money.svg';
import IconifyIcon from 'components/base/IconifyIcon';
import dayjs from 'dayjs';
import SimpleBar from 'simplebar-react';
import Cookies from 'js-cookie';

const defaultAvatar = './assets/profile/image-1.png';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

interface AppUser {
  profileImage: string;
}

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  appUser: AppUser;
}

interface NotificationDropdownProps {
  onClose: () => void;
  open: null | HTMLElement;
}

const NotificationDropdown = ({ open, onClose }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/v1/cards/bank-card/notification`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include', // if you need to include cookies for authentication
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: Notification[] = await response.json();
        const sortedNotifications = data.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setNotifications(sortedNotifications.slice(0, 20));
      } catch (error) {
        console.log('Error fetching data:');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const totalUnreadMsg = notifications.length; // Adjusted to count all notifications

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Fragment>
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { mt: 1.5, ml: 0.75, width: 300, bgcolor: 'common.white', borderRadius: '3%' },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', py: 2, px: 2.5 }}>
          <Stack gap={1} sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">All Notifications</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              You have {totalUnreadMsg} notifications
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <List disablePadding dense>
          <SimpleBar style={{ height: '100%', maxHeight: 350 }}>
            {notifications.map((notification) => (
              <ListItemButton
                key={notification.id}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  mt: '1px',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{ bgcolor: 'action.disabledBackground', width: 35, height: 35 }}
                    src={notification.appUser?.profileImage || defaultAvatar}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="button"
                      sx={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      <IconifyIcon
                        icon="flat-color-icons:clock"
                        sx={{ mr: 0.5, width: 16, height: 16 }}
                      />
                      {dayjs(notification.timestamp).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </SimpleBar>
        </List>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="primary">
            View All
          </Button>
        </Box>
      </Popover>
    </Fragment>
  );
};

export default NotificationDropdown;
