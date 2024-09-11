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
  icon: string;
  title: string;
  bgcolor: string;
  type: 'debit' | 'credit';
  date: string;
  amount: number;
  amountColor: string;
}

const iconMap: Record<string, React.ElementType> = {
  CreditCardIcon: CreditCardIcon,
  PaypalIcon: PaypalIcon,
  CoinIcon: CoinIcon,
};

export const RecentTransactions: React.FC = () => {
  const accessToken = Cookies.get('accessToken');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/v1/cards/bank-card/transactions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: Transaction[] = await response.json();
        // Sort transactions by date in descending order
        const sortedTransactions = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setTransactions(sortedTransactions);
      } catch (error) {
        setError('Failed to fetch transaction data');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accessToken]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <CardContainer title="Recent Transactions">
      <Card sx={{ p: { xs: 0.5, xl: 1 } }}>
        <List disablePadding sx={{ color: 'primary.main', '& > *:not(:last-child)': { mb: 2.5 } }}>
          {transactions.map(({ id, icon, bgcolor, title, date, amount, type, amountColor }) => {
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
                      {date}
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
                    {type === 'credit' ? '+' : '-'} {currencyFormat(amount)}
                  </Typography>
                </Stack>
              </ListItem>
            );
          })}
        </List>
      </Card>
    </CardContainer>
  );
};
