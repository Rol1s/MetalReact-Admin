import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Проверяем токен из URL при загрузке
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyToken(token);
    }
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.nikamet.pro/monitor/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // Сохраняем session token
        localStorage.setItem('admin_password', data.session_token);
        toast.success('Успешный вход через one-time link!');
        navigate('/');
      } else {
        setError(data.detail || 'Токен недействителен, истек или уже использован');
        toast.error('Токен недействителен');
        // Удаляем токен из URL
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Сохраняем пароль в localStorage
      localStorage.setItem('admin_password', password);
      
      // Проверяем что пароль работает (делаем тестовый запрос)
      const response = await fetch('https://api.nikamet.pro/monitor/health', {
        headers: {
          'X-Admin-Password': password,
        },
      });

      if (response.ok) {
        toast.success('Успешный вход!');
        navigate('/');
      } else {
        setError('Неверный пароль');
        localStorage.removeItem('admin_password');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      localStorage.removeItem('admin_password');
    } finally {
      setLoading(false);
    }
  };

  // Показываем загрузку если проверяем токен
  if (loading && searchParams.get('token')) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6">Проверка токена...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            MetalReact Admin V2
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Введите пароль или используйте одноразовую ссылку из бота
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
              disabled={loading}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!password || loading}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            💡 Напишите /admin боту для получения одноразовой ссылки
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

