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
  Slider,
  Typography,
} from '@mui/material';
import {
  Edit,
  Delete,
  Block,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import type { Pin } from '../api/monitorApi';
import { getPins, updatePin, deletePin, extendPin, blockPin, unblockPin } from '../api/monitorApi';
import toast from 'react-hot-toast';

export default function PinsTable() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Edit modal
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [editText, setEditText] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [extendHours, setExtendHours] = useState(24);

  useEffect(() => {
    fetchPins();
  }, [page, pageSize, statusFilter]);

  const fetchPins = async () => {
    setLoading(true);
    try {
      const response = await getPins(page + 1, pageSize, statusFilter || undefined);
      setPins(response.data.pins);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Ошибка загрузки закрепов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPin = async () => {
    if (!selectedPin) return;
    
    try {
      await updatePin(selectedPin.id, { text: editText, price: editPrice });
      toast.success('Закреп обновлен');
      setEditDialogOpen(false);
      fetchPins();
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  const handleDeletePin = async (pinId: number) => {
    if (!confirm('Удалить закреп?')) return;
    
    try {
      await deletePin(pinId);
      toast.success('Закреп удален');
      fetchPins();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleExtendPin = async (pinId: number) => {
    try {
      await extendPin(pinId, extendHours);
      toast.success(`Закреп продлен на ${extendHours} часов`);
      fetchPins();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleBlockPin = async (pinId: number) => {
    try {
      await blockPin(pinId);
      toast.success('Закреп заблокирован');
      fetchPins();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleUnblockPin = async (pinId: number) => {
    try {
      await unblockPin(pinId);
      toast.success('Закреп разблокирован');
      fetchPins();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'author_id', headerName: 'Автор ID', width: 120 },
    {
      field: 'type',
      headerName: 'Тип',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'buy' ? 'primary' : 'secondary'} size="small" />
      ),
    },
    {
      field: 'text',
      headerName: 'Текст',
      width: 250,
      renderCell: (params) => params.value?.substring(0, 50) + '...',
    },
    {
      field: 'price',
      headerName: 'Цена',
      width: 100,
      renderCell: (params) => `${params.value} ₽`,
    },
    {
      field: 'expires_at',
      headerName: 'Истекает',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString('ru-RU'),
      renderCell: (params) => {
        const expiresAt = new Date(params.value);
        const now = new Date();
        const isExpired = expiresAt < now;
        return (
          <span style={{ color: isExpired ? 'red' : 'inherit' }}>
            {expiresAt.toLocaleString('ru-RU')}
          </span>
        );
      },
    },
    {
      field: 'responses_count',
      headerName: 'Отклики',
      width: 100,
      align: 'center',
    },
    {
      field: 'is_blocked',
      headerName: 'Статус',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Chip label="Blocked" color="error" size="small" />
        ) : (
          <Chip label="Active" color="success" size="small" />
        )
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Действия',
      width: 150,
      getActions: (params: GridRowParams<Pin>) => {
        const pin = params.row;
        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Редактировать"
            onClick={() => {
              setSelectedPin(pin);
              setEditText(pin.text);
              setEditPrice(pin.price);
              setEditDialogOpen(true);
            }}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<AccessTime />}
            label="Продлить"
            onClick={() => handleExtendPin(pin.id)}
            showInMenu
          />,
          pin.is_blocked ? (
            <GridActionsCellItem
              icon={<CheckCircle />}
              label="Разблокировать"
              onClick={() => handleUnblockPin(pin.id)}
              showInMenu
            />
          ) : (
            <GridActionsCellItem
              icon={<Block />}
              label="Заблокировать"
              onClick={() => handleBlockPin(pin.id)}
              showInMenu
            />
          ),
          <GridActionsCellItem
            icon={<Delete />}
            label="Удалить"
            onClick={() => handleDeletePin(pin.id)}
            showInMenu
          />,
        ];
      },
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={2}>
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Статус</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Статус">
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="active">Активные</MenuItem>
            <MenuItem value="expired">Истекшие</MenuItem>
            <MenuItem value="blocked">Заблокированные</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchPins}>
          Обновить
        </Button>
      </Stack>

      <DataGrid
        rows={pins}
        columns={columns}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать закреп</DialogTitle>
        <DialogContent>
          <TextField
            label="Текст"
            multiline
            rows={4}
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Цена (₽)"
            type="number"
            fullWidth
            value={editPrice}
            onChange={(e) => setEditPrice(parseFloat(e.target.value))}
            margin="normal"
          />
          <Typography gutterBottom mt={2}>Продлить на {extendHours} часов</Typography>
          <Slider
            value={extendHours}
            onChange={(_, value) => setExtendHours(value as number)}
            min={24}
            max={168}
            step={24}
            marks
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEditPin} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

