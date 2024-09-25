import React, { useState, useEffect } from 'react';
import { Card, List, ListItem, Stack, Typography } from '@mui/material';
import CardContainer from 'components/common/CardContainter';
import CoinIcon from 'components/icons/card-icons/CoinIcon';
import CreditCardIcon from 'components/icons/card-icons/CreditCardIcon';
import PaypalIcon from 'components/icons/card-icons/PaypalIcon';
import { currencyFormat } from 'helpers/utils';
import Cookies from 'js-cookie';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

interface Transaction {
  id: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  cardHolderName: string;
  timestamp: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
}

interface ExtendedTransaction extends Transaction {
  icon: keyof typeof iconMap;
  bgcolor: string;
  title: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amountColor: string;
}

const iconMap: Record<string, React.ElementType> = {
  CreditCardIcon: CreditCardIcon,
  PaypalIcon: PaypalIcon,
  CoinIcon: CoinIcon,
};

const RecentTransactions: React.FC = () => {
  const accessToken = Cookies.get('accessToken');
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/cards/bank-card/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: Transaction[] = await response.json();

      const transformedData: ExtendedTransaction[] = data
        .map((transaction) => {
          let amountColor: string;

          switch (transaction.type) {
            case 'DEPOSIT':
              amountColor = 'success.main';
              break;
            case 'WITHDRAWAL':
              amountColor = 'error.main';
              break;
            case 'TRANSFER':
              amountColor = 'error.main';
              break;
            default:
              amountColor = transaction.amount >= 0 ? 'success.main' : 'error.main';
              break;
          }

          return {
            ...transaction,
            icon: 'CreditCardIcon',
            bgcolor: 'primary.main',
            title: transaction.type, // Display the transaction type
            amountColor: amountColor,
            date: transaction.timestamp,
          };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setTransactions(transformedData.slice(0, 3));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('We are unable to fetch your recent transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(); // Fetch transactions on initial render

    const intervalId = setInterval(() => {
      fetchTransactions(); // Fetch transactions every 30 seconds
    }, 30000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [accessToken]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Returns a readable date and time format
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) {
    return (
      <Typography
        sx={{
          color: 'error.main',
          textAlign: 'center',
          fontWeight: 'bold',
          mt: 2,
        }}
      >
        {error}
      </Typography>
    );
  }

  return (
    <CardContainer title="Recent Transactions">
      <Card sx={{ p: { xs: 0.5, xl: 1 } }}>
        {transactions.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            No recent transactions available.
          </Typography>
        ) : (
          <List
            disablePadding
            sx={{
              color: 'primary.main',
              '& > *:not(:last-child)': { mb: 2.5 },
            }}
          >
            {transactions.map(
              ({ id, icon, bgcolor, title, timestamp, amount, amountColor, type }) => {
                const IconComponent = iconMap[icon];
                return (
                  <ListItem
                    key={id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      '&:hover': {
                        '& .title': {
                          color: 'text.secondary',
                        },
                        '& .date': {
                          color: 'neutral.main',
                          transform: 'translateX(2px)',
                        },
                      },
                    }}
                    disablePadding
                  >
                    <Stack
                      direction="row"
                      sx={{
                        width: 55,
                        height: 55,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: bgcolor,
                        borderRadius: '50%',
                      }}
                    >
                      <IconComponent sx={{ mb: 0.75 }} />
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{
                        flexGrow: 1,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Stack gap={1}>
                        <Typography
                          className="title"
                          sx={{
                            color: 'primary.darker',
                            fontSize: { xs: 'subtitle1.fontSize', md: 'body2.fontSize' },
                          }}
                        >
                          {title}
                        </Typography>
                        <Typography
                          className="date"
                          sx={{
                            color: 'primary.light',
                            fontSize: {
                              xs: 'caption.fontSize',
                              sm: 'caption.fontSize',
                              md: 'body1.fontSize',
                            },
                          }}
                        >
                          {formatDate(timestamp)}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          color: amountColor,
                          fontSize: {
                            xs: 'caption.fontSize',
                            sm: 'button.fontSize',
                            md: 'body1.fontSize',
                          },
                        }}
                      >
                        {type === 'DEPOSIT' ? '+' : '-'} {currencyFormat(Math.abs(amount))}
                      </Typography>
                    </Stack>
                  </ListItem>
                );
              },
            )}
          </List>
        )}
      </Card>
    </CardContainer>
  );
};

export default RecentTransactions;
