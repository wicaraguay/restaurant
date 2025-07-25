import React, { useState } from 'react';
// import Tables from './components/Tables.jsx';
import Orders from './components/Orders.jsx';
import Menu from './components/Menu.jsx';
import Employees from './components/Employees.jsx';
import RoleManager from './components/RoleManager.jsx';
import Reports from './components/Reports.jsx';
import DashboardFull from './components/DashboardFull.jsx';
import CategoryManager from './components/CategoryManager.jsx';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
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
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import CssBaseline from '@mui/material/CssBaseline';


const drawerWidth = 220;

const defaultCategories = [
  { name: 'Entrada', subcategories: ['Fría', 'Caliente'] },
  { name: 'Plato principal', subcategories: ['Carne', 'Pollo', 'Vegetariano'] },
  { name: 'Bebida', subcategories: ['Fría', 'Caliente'] },
  { name: 'Postre', subcategories: [] }
];

function App() {
  const [selected, setSelected] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);
  const [currency, setCurrency] = useState('PEN'); // Default: Soles
  const [roles, setRoles] = useState(['Mesero', 'Cocinero', 'Administrador', 'Cajero']);
  // Estado global para menú por día y día seleccionado
  const [menuByDay, setMenuByDay] = useState(() => {
    const stored = localStorage.getItem('menuByDay');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch {}
    }
    return {
      lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], domingo: []
    };
  });
  const [selectedDay, setSelectedDay] = useState('lunes');

  // Sincronizar cambios del menú por día
  React.useEffect(() => {
    localStorage.setItem('menuByDay', JSON.stringify(menuByDay));
  }, [menuByDay]);

  const sections = [
    {
      name: 'Dashboard',
      icon: <DashboardIcon />, 
      component: (
        <DashboardFull
          resumen={{
            ventasHoy: 120,
            ventasSemana: 800,
            ventasMes: 3200,
            clientesHoy: 45,
            platilloTop: 'Hamburguesa',
            mesasOcupadas: 6,
            mesasLibres: 4,
            pedidosEnCurso: 3,
            pedidosPendientes: 2,
            ventasPorHora: [
              { hora: '08:00', ventas: 5 }, { hora: '09:00', ventas: 8 }, { hora: '10:00', ventas: 12 },
              { hora: '11:00', ventas: 20 }, { hora: '12:00', ventas: 30 }, { hora: '13:00', ventas: 25 },
              { hora: '14:00', ventas: 18 }, { hora: '15:00', ventas: 10 }
            ],
            rankingPlatillos: [
              { name: 'Hamburguesa', value: 30 }, { name: 'Pizza', value: 22 }, { name: 'Ensalada', value: 15 }, { name: 'Tacos', value: 10 }
            ],
            horasPico: [
              { hora: '12:00', pedidos: 18 }, { hora: '13:00', pedidos: 22 }, { hora: '14:00', pedidos: 15 }
            ]
          }}
          actividad={[
            'Pedido #123 completado',
            'Pedido #124 cancelado',
            'Pedido #125 modificado',
            'Pedido #126 pagado',
            'Pedido #127 en curso'
          ]}
          alertas={[
            'Pedido #128 lleva más de 30 minutos',
            'Stock bajo: Papas Fritas'
          ]}
          comparativas={{
            ventas: [
              { periodo: 'Semana Actual', total: 1200 },
              { periodo: 'Semana Anterior', total: 950 }
            ],
            empleados: [
              { empleado: 'Ana', pedidos: 40 },
              { empleado: 'Luis', pedidos: 32 },
              { empleado: 'Pedro', pedidos: 28 }
            ]
          }}
          mesas={[
            { id: 1, ocupada: true }, { id: 2, ocupada: false }, { id: 3, ocupada: true }, { id: 4, ocupada: false },
            { id: 5, ocupada: true }, { id: 6, ocupada: false }, { id: 7, ocupada: true }, { id: 8, ocupada: false },
            { id: 9, ocupada: false }, { id: 10, ocupada: true }
          ]}
          feedback={{ promedio: 4.7 }}
          onNuevoPedido={() => setSelected(sections.findIndex(s => s.name === 'Pedidos'))}
          onIrReportes={() => setSelected(sections.findIndex(s => s.name === 'Reportes'))}
          onIrMenu={() => setSelected(sections.findIndex(s => s.name === 'Menú'))}
        />
      )
    },
    // { name: 'Mesas', icon: <TableRestaurantIcon />, component: <Tables /> },
    { name: 'Pedidos', icon: <ReceiptLongIcon />, component: <Orders menuByDay={menuByDay} selectedDay={selectedDay} /> },
    { name: 'Menú', icon: <RestaurantMenuIcon />, component: <Menu categories={categories} setCategories={setCategories} menuByDay={menuByDay} setMenuByDay={setMenuByDay} selectedDay={selectedDay} setSelectedDay={setSelectedDay} currency={currency} /> },
    { name: 'Categorías', icon: <CategoryIcon />, component: <CategoryManager categories={categories} setCategories={setCategories} currency={currency} setCurrency={setCurrency} standalone /> },
    { name: 'Roles', icon: <AssignmentIndIcon />, component: <RoleManager roles={roles} setRoles={setRoles} /> },
    { name: 'Empleados', icon: <GroupIcon />, component: <Employees roles={roles} setRoles={setRoles} /> },
    { name: 'Reportes', icon: <BarChartIcon />, component: <Reports /> },
  ];


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f5c16c 100%)', fontFamily: 'Montserrat, Arial, sans-serif' }}>
      <CssBaseline />
      {/* AppBar siempre visible, menú lateral solo en md+ */}
      <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #8d5524 60%, #c68642 100%)', boxShadow: 3, fontFamily: 'Montserrat, Arial, sans-serif' }}>
        <Toolbar sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, px: { xs: 1, sm: 2, md: 4 }, fontFamily: 'Montserrat, Arial, sans-serif' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Logo administración" style={{ width: 40, height: 40, borderRadius: 8, background: '#fffbe6', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: { xs: 18, sm: 22, md: 26 } }}>
              Gestor de Restaurante "Picanteria Miraflores"
            </Typography>
          </Box>
          {/* Menú hamburguesa en xs/sm, oculto en md+ */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', fontFamily: 'Montserrat, Arial, sans-serif' }}>
            <IconButton color="inherit" onClick={() => setMobileMenuOpen(true)} sx={{ ml: 1 }}>
              <MenuIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Drawer temporal para menú hamburguesa */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, zIndex: 1300 }}
        PaperProps={{ sx: { width: 220, background: 'linear-gradient(180deg, #fffbe6 0%, #f5c16c 100%)', pt: 2, fontFamily: 'Montserrat, Arial, sans-serif' } }}
      >
        <List sx={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
          {sections.map((section, idx) => (
            <ListItem key={section.name} disablePadding>
              <ListItemButton selected={selected === idx} onClick={() => { setSelected(idx); setMobileMenuOpen(false); }} sx={{ my: 0.5, borderRadius: 2, fontFamily: 'Montserrat, Arial, sans-serif' }}>
                <ListItemIcon sx={{ color: selected === idx ? '#8d5524' : '#c68642', minWidth: 36 }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText primary={section.name} sx={{ '& span': { fontWeight: selected === idx ? 'bold' : 'normal', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 18 } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* Drawer lateral solo en md+ */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          fontFamily: 'Montserrat, Arial, sans-serif',
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #fffbe6 0%, #f5c16c 100%)',
            borderRight: '1px solid #e0e0e0',
            fontFamily: 'Montserrat, Arial, sans-serif',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', fontFamily: 'Montserrat, Arial, sans-serif' }}>
          <List sx={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
            {sections.map((section, idx) => (
              <ListItem key={section.name} disablePadding>
                <ListItemButton selected={selected === idx} onClick={() => setSelected(idx)} sx={{ my: 0.5, borderRadius: 2, fontFamily: 'Montserrat, Arial, sans-serif' }}>
                  <ListItemIcon sx={{ color: selected === idx ? '#8d5524' : '#c68642' }}>
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText primary={section.name} sx={{ '& span': { fontWeight: selected === idx ? 'bold' : 'normal', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 18 } }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 4 }, mt: { xs: 10, sm: 10, md: 8 }, maxWidth: '100vw', fontFamily: 'Montserrat, Arial, sans-serif' }}>
        <Container maxWidth="xl" sx={{ boxShadow: 3, borderRadius: 3, background: 'rgba(255,255,255,0.98)', p: { xs: 1, sm: 2, md: 4 }, minHeight: { xs: '60vh', md: '70vh' }, fontFamily: 'Montserrat, Arial, sans-serif' }}>
          {sections[selected].component}
        </Container>
        <Box sx={{ textAlign: 'center', py: 3, color: '#8d5524', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: { xs: 14, sm: 16, md: 18 } }}>
          © {new Date().getFullYear()} Picantería Miraflores - Todos los derechos reservados
        </Box>
      </Box>
    </Box>
  );
}

export default App;
