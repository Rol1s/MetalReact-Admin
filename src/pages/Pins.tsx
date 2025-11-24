import { Box, Typography } from '@mui/material';
import PinsTable from '../components/PinsTable';

export default function Pins() {
  return (
    <Box>
      <Typography variant="h4" mb={3}>Модерация закрепов</Typography>
      <PinsTable />
    </Box>
  );
}

