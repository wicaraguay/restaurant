

import React, { useState } from 'react';
import Tables from './components/Tables.jsx';
import Orders from './components/Orders.jsx';
import Menu from './components/Menu.jsx';
import Employees from './components/Employees.jsx';
import Reports from './components/Reports.jsx';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import CssBaseline from '@mui/material/CssBaseline';


const drawerWidth = 220;
const sections = [
  { name: 'Dashboard', icon: <DashboardIcon />, component: <Box sx={{p:2}}><Typography variant="h4" sx={{fontWeight:'bold',mb:2}}>Bienvenido al Panel de Gestión</Typography><Typography>Selecciona una sección en el menú lateral para comenzar.</Typography></Box> },
  { name: 'Mesas', icon: <TableRestaurantIcon />, component: <Tables /> },
  { name: 'Pedidos', icon: <ReceiptLongIcon />, component: <Orders /> },
  { name: 'Menú', icon: <RestaurantMenuIcon />, component: <Menu /> },
  { name: 'Empleados', icon: <PeopleIcon />, component: <Employees /> },
  { name: 'Reportes', icon: <BarChartIcon />, component: <Reports /> },
];


function App() {
  const [selected, setSelected] = useState(0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f5c16c 100%)', fontFamily: 'Roboto, Arial, sans-serif' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #8d5524 60%, #c68642 100%)', boxShadow: 3 }}>
        <Toolbar>
          <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Roboto Slab, serif' }}>
            Restaurante Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #fffbe6 0%, #f5c16c 100%)',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {sections.map((section, idx) => (
              <ListItem key={section.name} disablePadding>
                <ListItemButton selected={selected === idx} onClick={() => setSelected(idx)} sx={{ my: 0.5, borderRadius: 2 }}>
                  <ListItemIcon sx={{ color: selected === idx ? '#8d5524' : '#c68642' }}>
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText primary={section.name} sx={{ '& span': { fontWeight: selected === idx ? 'bold' : 'normal', fontFamily: 'Roboto Slab, serif', fontSize: 18 } }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8, maxWidth: '100vw' }}>
        <Container maxWidth="lg" sx={{ boxShadow: 3, borderRadius: 3, background: 'rgba(255,255,255,0.98)', p: 4, minHeight: '70vh' }}>
          {sections[selected].component}
        </Container>
        <Box sx={{ textAlign: 'center', py: 3, color: '#8d5524', fontFamily: 'Roboto Slab, serif', fontSize: 18 }}>
          © 2025 Restaurante Dashboard
        </Box>
      </Box>
    </Box>
  );
}

export default App;
