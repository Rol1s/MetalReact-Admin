import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  PushPin,
  ViewList,
  Logout,
} from '@mui/icons-material';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Pins from './pages/Pins';
import Logs from './pages/Logs';
import Login from './pages/Login';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

const drawerWidth = 240;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('admin_password')
  );

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    setIsAuthenticated(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Пользователи', icon: <People />, path: '/users' },
    { text: 'Закрепы', icon: <PushPin />, path: '/pins' },
    { text: 'Логи', icon: <ViewList />, path: '/logs' },
  ];

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          {/* AppBar */}
          <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Toolbar>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                MetalReact Admin Panel
              </Typography>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Выйти" />
              </ListItemButton>
            </Toolbar>
          </AppBar>

          {/* Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                {menuItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton component={Link} to={item.path}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
            }}
          >
            <Toolbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/pins" element={<Pins />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
