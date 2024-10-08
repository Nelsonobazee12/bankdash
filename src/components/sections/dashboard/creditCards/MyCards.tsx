import React, { useEffect, useState } from 'react';
import { Link, Stack, Typography } from '@mui/material';
import CreditCard, { CreditCardData } from 'components/sections/dashboard/creditCards/CreditCard';
import SimpleBar from 'simplebar-react';
import Cookies from 'js-cookie';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

interface CardData {
  theme: 'blue' | 'white';
  data: CreditCardData;
  id: number;
}

const MyCards: React.FC = () => {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');

    const fetchCardDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/v1/cards/user_card`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch card details');
        }

        const data = await response.json();
        console.log('Fetched card data:', data);

        // Handle the case where data might be an object or an array
        const cardDetails = Array.isArray(data) ? data[0] : data;

        if (!cardDetails || !cardDetails.id) {
          throw new Error('No card data found');
        }

        const formattedCardData: CardData = {
          id: cardDetails.id,
          theme: 'blue', // Adjust this based on your criteria
          data: {
            balance: cardDetails.balance.toString(),
            cardHolderName: cardDetails.cardHolderName,
            expiryDate: cardDetails.expiryDate,
            cardNumber: cardDetails.cardNumber,
          },
        };

        setCardData(formattedCardData);
      } catch (error) {
        console.error('Error fetching card details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  // if (error) {
  //   return (
  //     <Typography
  //       sx={{
  //         color: 'error.main', // Red color to indicate an error
  //         textAlign: 'center',
  //         fontWeight: 'bold',
  //         mt: 2,
  //       }}
  //     >
  //       We're having trouble fetching your card details. Please try again later.
  //     </Typography>
  //   );
  // }

  if (!cardData) {
    return <Typography>No card data available.</Typography>;
  }

  return (
    <React.Fragment>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: 3, pb: 2.5 }}
      >
        <Typography
          sx={{
            fontSize: { xs: 'body2.fontSize', md: 'h6.fontSize', xl: 'h3.fontSize' },
            fontWeight: 600,
          }}
        >
          Card Details
        </Typography>
        <Link
          variant="h5"
          href="#!"
          sx={{
            fontSize: { xs: 'caption.fontSize', md: 'body1.fontSize', xl: 'h5.fontSize' },
            fontWeight: 600,
            pr: 1,
          }}
        >
          See All
        </Link>
      </Stack>
      <SimpleBar style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Stack direction="row" justifyContent="space-between" gap={4} sx={{ minWidth: 800 }}>
          <CreditCard key={cardData.id} theme={cardData.theme} cardData={cardData.data} />
        </Stack>
      </SimpleBar>
    </React.Fragment>
  );
};

export default MyCards;
