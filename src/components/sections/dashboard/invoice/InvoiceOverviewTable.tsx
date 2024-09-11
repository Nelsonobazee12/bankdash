import { Box, Card, Stack, Tab, Tabs, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import CustomPagination from 'components/sections/dashboard/invoice/CustomPagination';
import NoData from 'components/sections/dashboard/invoice/NoData';
import RenderCellDescription from 'components/sections/dashboard/invoice/RenderCellDescription';
import RenderCellDownload from 'components/sections/dashboard/invoice/RenderCellDownload';
import { currencyFormat, dateFormatFromUTC } from 'helpers/utils';
import { useBreakpoints } from 'providers/useBreakpoints';
import { SyntheticEvent, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { shortenString } from 'helpers/utils';

const backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'default_url';

// Define the API response type
interface Transaction {
  id: number;
  type: string;
  transactionId: string;
  cardNumber: string;
  timestamp: string;
  amount: number;
}

interface RowData {
  id: number;
  description: { title: string; revenue: string };
  transactionId: string;
  type: string;
  card: string;
  date: string;
  amount: number;
}

const columns: GridColDef[] = [
  {
    field: 'description',
    headerName: 'Description',
    width: 230,
    hideable: false,
    renderCell: (params) => <RenderCellDescription params={params} />,
    valueGetter: (params: GridValidRowModel) => params.title,
  },
  {
    field: 'transactionId',
    headerName: 'Transaction ID',
    flex: 1,
    minWidth: 150,
    hideable: false,
    renderCell: (params) => <>{shortenString(params.value, 6, 4)}</>, // Shortening Transaction ID
  },
  {
    field: 'type',
    headerName: 'Type',
    flex: 1,
    minWidth: 100,
    hideable: false,
  },
  {
    field: 'card',
    headerName: 'Card',
    minWidth: 100,
    flex: 1,
    hideable: false,
    renderCell: (params) => <>{shortenString(params.value, 4, 4)}</>, // Shortening Card
  },
  {
    field: 'date',
    headerName: 'Date',
    minWidth: 130,
    flex: 1,
    hideable: false,
    renderCell: (params) => <>{dateFormatFromUTC(params.value)}</>,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 1,
    minWidth: 100,
    hideable: false,
    renderCell: (params) => {
      const color = params.row.description.revenue === 'down' ? 'error.main' : 'success.main';
      const symbol = params.row.description.revenue === 'down' ? '-' : '+';

      return (
        <Typography variant="body2" color={color}>
          {symbol} {currencyFormat(params.value)}
        </Typography>
      );
    },
  },
  {
    field: 'download',
    headerName: 'Download',
    sortable: false,
    flex: 1,
    minWidth: 150,
    renderCell: (params) => <RenderCellDownload params={params} />,
  },
];

const a11yProps = (index: number) => ({
  id: `transaction-tab-${index}`,
  'aria-controls': `transaction-tabpanel-${index}`,
});

let rowHeight = 60; // default row height

const InvoiceOverviewTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<GridRowsProp<RowData>>([]);
  const [value, setValue] = useState(0);
  const { down } = useBreakpoints();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const isXs = down('sm');

  if (isXs) {
    rowHeight = 55;
  } else {
    rowHeight = 64;
  }

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
    filterData(newValue);
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const filterData = (tabIndex: number) => {
    switch (tabIndex) {
      case 1:
        setItems((prevItems) => prevItems.filter((row) => row.description.revenue === 'up'));
        break;
      case 2:
        setItems((prevItems) => prevItems.filter((row) => row.description.revenue === 'down'));
        break;
      default:
        setItems((prevItems) => prevItems); // Reset to all items
        break;
    }
  };

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/v1/cards/bank-card/transactions`, {
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
        const data: Transaction[] = await response.json();
        const formattedData = data.map((item) => ({
          id: item.id,
          description: { title: item.type, revenue: item.type === 'DEPOSIT' ? 'up' : 'down' },
          transactionId: item.transactionId,
          type: item.type,
          card: item.cardNumber.slice(-4).padStart(item.cardNumber.length, '*'),
          date: item.timestamp,
          amount: item.amount,
        }));
        setItems(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterData(value);
  }, [value, items]);

  return (
    <Stack sx={{ overflow: 'auto', justifyContent: 'space-between' }}>
      <Box sx={{ mb: 1.5, mt: 3 }}>
        <Typography
          sx={{
            fontSize: {
              xs: 'body2.fontSize',
              md: 'h6.fontSize',
              xl: 'h3.fontSize',
            },
            fontWeight: 600,
          }}
        >
          Recent Invoice
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'secondary.lighter', mb: 3.5 }}>
        <Tabs value={value} onChange={handleChange} aria-label="transaction tabs">
          <Tab label="All Transactions" {...a11yProps(0)} />
          <Tab label="Income" {...a11yProps(1)} />
          <Tab label="Expense" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <Card
        sx={{
          flexGrow: { md: 1 },
          display: { md: 'flex' },
          flexDirection: { md: 'column' },
          overflow: 'hidden',
          borderRadius: 6.5,
          '&.MuiPaper-root': {
            p: 1,
            border: 1,
            borderColor: 'neutral.light',
            bgcolor: { xs: 'transparent', sm: 'white' },
            boxShadow: (theme) => `inset 0px -1px ${theme.palette.neutral.light}`, // color for row border
          },
        }}
      >
        <DataGrid
          rowHeight={rowHeight}
          rows={items.slice(
            paginationModel.page * paginationModel.pageSize,
            (paginationModel.page + 1) * paginationModel.pageSize,
          )}
          rowCount={items.length}
          columns={columns}
          disableRowSelectionOnClick
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          slots={{
            noRowsOverlay: () => <NoData />,
            pagination: () => null, // Hide the default pagination component
          }}
          loading={loading}
          sx={{
            px: { xs: 0, md: 3 },
            '& .MuiDataGrid-main': {
              minHeight: 300,
            },
            '& .MuiDataGrid-virtualScroller': {
              minHeight: 300,
              p: 0,
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: { xs: 13, lg: 16 },
            },
            '& .MuiDataGrid-cell': {
              fontSize: { xs: 13, lg: 16 },
            },
          }}
        />
        <CustomPagination
          page={paginationModel.page + 1} // Adjusting for 1-based index used by Pagination component
          pageCount={Math.ceil(items.length / paginationModel.pageSize)}
          onPageChange={(event, page) =>
            handlePaginationModelChange({ page: page - 1, pageSize: paginationModel.pageSize })
          }
        />
      </Card>
    </Stack>
  );
};

export default InvoiceOverviewTable;
