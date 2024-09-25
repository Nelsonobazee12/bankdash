import React, { useState } from 'react';
import { TextField, Button, Typography, CircularProgress, Tabs, Tab, Box } from '@mui/material';
import InvoiceOverviewTable from 'components/sections/dashboard/invoice/InvoiceOverviewTable';
import Cookies from 'js-cookie';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

const TransactionActions: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [amount, setAmount] = useState('');
  const [destinationCardNumber, setDestinationCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setDestinationCardNumber('');
    setMessage(null);
  };

  const accessToken = Cookies.get('accessToken');

  const handleDeposit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${backendUrl}/api/v1/cards/add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Deposit failed');
      setMessage(`Successfully deposited`);
    } catch (error) {
      setMessage('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${backendUrl}/api/v1/cards/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ amount, destinationCardNumber }), // Include recipient in the request
      });
      if (!response.ok) throw new Error('Transfer failed');
      setMessage('Successfully transferred');
    } catch (error) {
      setMessage('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${backendUrl}/api/v1/cards/deduct-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Withdrawal failed');
      setMessage(`Successfully withdrew`);
    } catch (error) {
      setMessage('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Transaction Actions
      </Typography>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="Deposit" />
        <Tab label="Transfer" />
        <Tab label="Withdraw" />
      </Tabs>

      {/* Deposit Tab */}
      <Box hidden={selectedTab !== 0}>
        <TextField
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
        <Button onClick={handleDeposit} variant="contained" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} /> : 'Deposit'}
        </Button>
      </Box>

      {/* Transfer Tab */}
      <Box hidden={selectedTab !== 1}>
        <TextField
          label="Account Number"
          value={destinationCardNumber}
          onChange={(e) => setDestinationCardNumber(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
        <Button onClick={handleTransfer} variant="contained" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} /> : 'Transfer'}
        </Button>
      </Box>

      {/* Withdraw Tab */}
      <Box hidden={selectedTab !== 2}>
        <TextField
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
        <Button onClick={handleWithdraw} variant="contained" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} /> : 'Withdraw'}
        </Button>
      </Box>

      {message && (
        <Typography color="error" marginTop={2}>
          {message}
        </Typography>
      )}

      {/* Render the InvoiceOverviewTable component */}
      <InvoiceOverviewTable />
    </div>
  );
};

export default TransactionActions;
