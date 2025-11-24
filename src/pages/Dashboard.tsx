import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  People,
  CardGiftcard,
  PushPin,
  CreditCard,
} from '@mui/icons-material';
import type { DashboardStats, Service } from '../api/monitorApi';
import { getDashboardAnalytics, getUsersGrowth, getAllServices } from '../api/monitorApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, growthRes, servicesRes] = await Promise.all([
        getDashboardAnalytics(),
        getUsersGrowth('30d'),
        getAllServices(),
      ]);
      
      setStats(statsRes.data);
      setGrowthData(growthRes.data.data || []);
      setServices(servicesRes.data.services || []);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value || 0}
            </Typography>
          </Box>
          <Icon style={{ fontSize: 48, color }} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>Dashboard</Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего пользователей"
            value={stats?.total_users}
            icon={People}
            color="#3f51b5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Premium пользователей"
            value={stats?.premium_users}
            icon={CardGiftcard}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активных закрепов"
            value={stats?.active_pins}
            icon={PushPin}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего карт"
            value={stats?.total_cards}
            icon={CreditCard}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* Users Growth Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Рост пользователей (30 дней)</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3f51b5" name="Новые пользователи" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Services Status */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Статус сервисов</Typography>
        <Grid container spacing={2}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.name}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">{service.name}</Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: service.status === 'healthy' ? '#4caf50' : '#f44336',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Port: {service.port} | CPU: {service.cpu_percent?.toFixed(1)}% | RAM: {service.memory_mb?.toFixed(0)}MB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

