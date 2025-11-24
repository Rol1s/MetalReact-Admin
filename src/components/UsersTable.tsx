import { useState, useEffect } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Block,
  CheckCircle,
  CardGiftcard,
} from '@mui/icons-material';
import type { User } from '../api/monitorApi';
import { getUsers, grantPremium, revokePremium, banUser, unbanUser } from '../api/monitorApi';
import toast from 'react-hot-toast';

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  // Premium modal
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [premiumDays, setPremiumDays] = useState(30);

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers(page + 1, pageSize, filter || undefined, search || undefined);
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Ошибка загрузки пользователей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPremium = async () => {
    if (!selectedUser) return;
    
    try {
      await grantPremium(selectedUser.telegram_id, premiumDays);
      toast.success(`Премиум выдан на ${premiumDays} дней`);
      setPremiumDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка выдачи премиума');
    }
  };

  const handleRevokePremium = async (userId: number) => {
    try {
      await revokePremium(userId);
      toast.success('Премиум забран');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleBan = async (userId: number) => {
    try {
      await banUser(userId);
      toast.success('Пользователь забанен');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      await unbanUser(userId);
      toast.success('Пользователь разбанен');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'telegram_id',
      headerName: 'ID',
      width: 120,
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      renderCell: (params) => `@${params.value || 'unknown'}`,
    },
    {
      field: 'first_name',
      headerName: 'Имя',
      width: 150,
    },
    {
      field: 'is_premium',
      headerName: 'Premium',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Premium' : 'Free'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'is_banned',
      headerName: 'Статус',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Chip label="Banned" color="error" size="small" />
        ) : (
          <Chip label="Active" color="success" size="small" />
        )
      ),
    },
    {
      field: 'created_at',
      headerName: 'Регистрация',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString('ru-RU'),
    },
    {
      field: 'cards_count',
      headerName: 'Карты',
      width: 80,
      align: 'center',
    },
    {
      field: 'pins_count',
      headerName: 'Закрепы',
      width: 100,
      align: 'center',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Действия',
      width: 150,
      getActions: (params: GridRowParams<User>) => {
        const user = params.row;
        const actions = [
          <GridActionsCellItem
            key="premium"
            icon={<CardGiftcard />}
            label="Premium"
            onClick={() => {
              setSelectedUser(user);
              setPremiumDialogOpen(true);
            }}
            showInMenu
          />,
        ];
        
        if (user.is_premium) {
          actions.push(
            <GridActionsCellItem
              key="revoke"
              icon={<Block />}
              label="Забрать Premium"
              onClick={() => handleRevokePremium(user.telegram_id)}
              showInMenu
            />
          );
        }
        
        if (user.is_banned) {
          actions.push(
            <GridActionsCellItem
              key="unban"
              icon={<CheckCircle />}
              label="Разбанить"
              onClick={() => handleUnban(user.telegram_id)}
              showInMenu
            />
          );
        } else {
          actions.push(
            <GridActionsCellItem
              key="ban"
              icon={<Block />}
              label="Забанить"
              onClick={() => handleBan(user.telegram_id)}
              showInMenu
            />
          );
        }
        
        return actions;
      },
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Поиск"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
          sx={{ width: 300 }}
        />
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Фильтр</InputLabel>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Фильтр">
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
            <MenuItem value="free">Free</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchUsers}>
          Поиск
        </Button>
      </Stack>

      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.telegram_id}
        paginationMode="server"
        rowCount={total}
        loading={loading}
        pageSizeOptions={[10, 20, 50, 100]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        disableRowSelectionOnClick
        sx={{ height: 600 }}
      />

      {/* Premium Dialog */}
      <Dialog open={premiumDialogOpen} onClose={() => setPremiumDialogOpen(false)}>
        <DialogTitle>Выдать Premium</DialogTitle>
        <DialogContent>
          <TextField
            label="Количество дней"
            type="number"
            fullWidth
            value={premiumDays}
            onChange={(e) => setPremiumDays(parseInt(e.target.value))}
            margin="normal"
          />
          <Stack direction="row" spacing={1} mt={2}>
            <Button onClick={() => setPremiumDays(30)} variant="outlined" size="small">
              30 дней
            </Button>
            <Button onClick={() => setPremiumDays(90)} variant="outlined" size="small">
              90 дней
            </Button>
            <Button onClick={() => setPremiumDays(365)} variant="outlined" size="small">
              365 дней
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPremiumDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleGrantPremium} variant="contained" color="primary">
            Выдать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

