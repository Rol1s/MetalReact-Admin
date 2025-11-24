import { Box, Typography } from '@mui/material';
import UsersTable from '../components/UsersTable';

export default function Users() {
  return (
    <Box>
      <Typography variant="h4" mb={3}>Управление пользователями</Typography>
      <UsersTable />
    </Box>
  );
}

