import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { getUserActionLogs, getParserActivityLogs } from '../api/monitorApi';
import toast from 'react-hot-toast';

export default function Logs() {
  const [tab, setTab] = useState(0);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [parserLogs, setParserLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [tab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const response = await getUserActionLogs(24, 100);
        setUserLogs(response.data.logs || []);
      } else {
        const response = await getParserActivityLogs(24, 100);
        setParserLogs(response.data.logs || []);
      }
    } catch (error) {
      toast.error('Ошибка загрузки логов');
    } finally {
      setLoading(false);
    }
  };

  const renderLogs = (logs: any[]) => (
    <List>
      {logs.map((log, index) => (
        <ListItem key={index} divider>
          <ListItemText
            primary={log.message}
            secondary={
              <>
                <Chip label={log.level} size="small" sx={{ mr: 1 }} />
                <Chip label={log.service} size="small" sx={{ mr: 1 }} />
                {log.timestamp && new Date(log.timestamp).toLocaleString('ru-RU')}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>Логи</Typography>
      
      <Paper>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Действия пользователей" />
          <Tab label="Активность парсера" />
        </Tabs>
        
        <Box p={2}>
          {loading ? (
            <Typography>Загрузка...</Typography>
          ) : (
            renderLogs(tab === 0 ? userLogs : parserLogs)
          )}
        </Box>
      </Paper>
    </Box>
  );
}

