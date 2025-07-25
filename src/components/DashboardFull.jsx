import React, { useRef, useEffect, useState } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Grid, Paper, Typography, Avatar, Button, Divider, Chip, LinearProgress } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d84315', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#43a047', '#6d4c41'];

export default function DashboardFull({
  resumen = {},
  actividad = [],
  alertas = [],
  comparativas = {},
  mesas = [],
  feedback = {},
  onNuevoPedido,
  onIrReportes,
  onIrMenu
}) {
  // Datos de ejemplo para gráficas
  const ventasPorHora = resumen.ventasPorHora ?? [
    { hora: '08:00', ventas: 5 }, { hora: '09:00', ventas: 8 }, { hora: '10:00', ventas: 12 },
    { hora: '11:00', ventas: 20 }, { hora: '12:00', ventas: 30 }, { hora: '13:00', ventas: 25 },
    { hora: '14:00', ventas: 18 }, { hora: '15:00', ventas: 10 }
  ];
  const rankingPlatillos = resumen.rankingPlatillos ?? [
    { name: 'Hamburguesa', value: 30 }, { name: 'Pizza', value: 22 }, { name: 'Ensalada', value: 15 }, { name: 'Tacos', value: 10 }
  ];
  const horasPico = resumen.horasPico ?? [
    { hora: '12:00', pedidos: 18 }, { hora: '13:00', pedidos: 22 }, { hora: '14:00', pedidos: 15 }
  ];
  const comparativaVentas = comparativas.ventas ?? [
    { periodo: 'Semana Actual', total: 1200 }, { periodo: 'Semana Anterior', total: 950 }
  ];
  const comparativaEmpleados = comparativas.empleados ?? [
    { empleado: 'Ana', pedidos: 40 }, { empleado: 'Luis', pedidos: 32 }, { empleado: 'Pedro', pedidos: 28 }
  ];
  const mesasEstado = mesas.length ? mesas : [
    { id: 1, ocupada: true }, { id: 2, ocupada: false }, { id: 3, ocupada: true }, { id: 4, ocupada: false }
  ];
  const feedbackProm = feedback.promedio ?? 4.7;
  // Datos de ejemplo para gráficas
  // Tarjetas resumen
  const cards = [
    // ... (dejar igual la definición de cards)
    { title: 'Ventas Hoy', value: resumen.ventasHoy ?? 0, icon: <BarChartIcon fontSize="large" />, color: 'linear-gradient(135deg, #1976d2 60%, #64b5f6 100%)', badge: 'Hoy' },
    { title: 'Ventas Semana', value: resumen.ventasSemana ?? 0, icon: <BarChartIcon fontSize="large" />, color: 'linear-gradient(135deg, #388e3c 60%, #a5d6a7 100%)', badge: 'Semana' },
    { title: 'Ventas Mes', value: resumen.ventasMes ?? 0, icon: <BarChartIcon fontSize="large" />, color: 'linear-gradient(135deg, #fbc02d 60%, #fff176 100%)', badge: 'Mes' },
    { title: 'Pedidos en Curso', value: resumen.pedidosEnCurso ?? 0, icon: <AssignmentTurnedInIcon fontSize="large" />, color: 'linear-gradient(135deg, #1976d2 60%, #90caf9 100%)', badge: 'En curso' },
    { title: 'Pedidos Pendientes', value: resumen.pedidosPendientes ?? 0, icon: <AssignmentTurnedInIcon fontSize="large" />, color: 'linear-gradient(135deg, #d84315 60%, #ffab91 100%)', badge: 'Pendientes' },
    { title: 'Clientes Hoy', value: resumen.clientesHoy ?? 0, icon: <PeopleIcon fontSize="large" />, color: 'linear-gradient(135deg, #43a047 60%, #b9f6ca 100%)', badge: 'Clientes' },
    { title: 'Platillo Más Vendido', value: resumen.platilloTop ?? '-', icon: <RestaurantMenuIcon fontSize="large" />, color: 'linear-gradient(135deg, #0288d1 60%, #b3e5fc 100%)', badge: 'Top' },
    { title: 'Mesas Ocupadas', value: resumen.mesasOcupadas ?? 0, icon: <TableRestaurantIcon fontSize="large" />, color: 'linear-gradient(135deg, #7b1fa2 60%, #ce93d8 100%)', badge: 'Ocupadas' },
    { title: 'Mesas Libres', value: resumen.mesasLibres ?? 0, icon: <TableRestaurantIcon fontSize="large" />, color: 'linear-gradient(135deg, #bdbdbd 60%, #f5f5f5 100%)', badge: 'Libres' },
  ];

  // Carrusel de tarjetas resumen
  const carouselRef = useRef(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  // Visibilidad responsiva para el carrusel
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
  const visible = isMobile ? 1 : 5;
  const total = cards.length;

  // Movimiento automático
  // Actualiza visible en resize
  useEffect(() => {
    const handleResize = () => {
      setCarouselIdx(0); // Reinicia el carrusel al cambiar tamaño
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (total <= visible) return;
    let interval = setInterval(() => {
      setCarouselIdx(prev => {
        const next = prev + 1 > total - visible ? 0 : prev + 1;
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [total, visible]);

  // Efecto de movimiento
  useEffect(() => {
    const ref = carouselRef.current;
    if (!ref) return;
    const cardWidth = ref.firstChild ? ref.firstChild.offsetWidth + 16 : 200;
    ref.style.transform = `translateX(-${carouselIdx * cardWidth}px)`;
  }, [carouselIdx]);

  // Navegación manual
  const handlePrev = () => {
    setCarouselIdx(idx => (idx - 1 < 0 ? total - visible : idx - 1));
  };
  const handleNext = () => {
    setCarouselIdx(idx => (idx + 1 > total - visible ? 0 : idx + 1));
  };

      {/* Carrusel de tarjetas resumen */}
      <Box
        sx={{
          width: { xs: (210 + 8) * 1 + 'px', sm: (210 + 16) * 5 + 'px' },
          maxWidth: '100%',
          overflow: 'hidden',
          mb: { xs: 1, sm: 2 },
          pb: { xs: 0.5, sm: 1 },
          mx: 'auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Flecha izquierda */}
        {total > visible && (
          <Button onClick={handlePrev} sx={{ minWidth: 0, p: 0.5, position: 'absolute', left: -36, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', boxShadow: 2, borderRadius: '50%' }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </Button>
        )}
        <Box
          ref={carouselRef}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: { xs: 1, sm: 2 },
            width: 'fit-content',
            transition: 'transform 0.7s cubic-bezier(.4,1.3,.6,1)',
            willChange: 'transform',
          }}
        >
          {cards.map((card, idx) => (
            <Paper
              key={idx}
              elevation={4}
              sx={{
                minWidth: 180,
                maxWidth: 210,
                flex: '0 0 auto',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 4,
                background: card.color,
                minHeight: 90,
                boxShadow: '0 4px 24px 0 #1976d222',
                position: 'relative',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.03)',
                  boxShadow: '0 8px 32px 0 #1976d244',
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.92)', color: '#1976d2', width: 44, height: 44, boxShadow: '0 2px 8px #1976d222', fontSize: 26 }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 0.5, textShadow: '0 1px 4px #0002', fontSize: 14 }}>{card.title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', textShadow: '0 2px 8px #0002', letterSpacing: 1, fontSize: 22 }}>{card.value}</Typography>
              </Box>
              <Chip label={card.badge} size="small" sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.85)', color: '#1976d2', fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }} />
            </Paper>
          ))}
        </Box>
        {/* Flecha derecha */}
        {total > visible && (
          <Button onClick={handleNext} sx={{ minWidth: 0, p: 0.5, position: 'absolute', right: -36, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', boxShadow: 2, borderRadius: '50%' }}>
            <ArrowForwardIosIcon fontSize="small" />
          </Button>
        )}
      </Box>


  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', p: { xs: 0.5, sm: 3, md: 4 }, boxSizing: 'border-box', maxWidth: { xs: '100vw', sm: 1400 }, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center', color: '#2d3a4a' }}>Dashboard</Typography>
      {/* Carrusel de tarjetas resumen */}
      <Box
        sx={{
          width: (210 + 16) * 5 + 'px',
          maxWidth: '100%',
          overflow: 'hidden',
          mb: 2,
          pb: 1,
          mx: 'auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Flecha izquierda */}
        {total > visible && (
          <Button onClick={handlePrev} sx={{ minWidth: 0, p: 0.5, position: 'absolute', left: -36, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', boxShadow: 2, borderRadius: '50%' }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </Button>
        )}
        <Box
          ref={carouselRef}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            width: 'fit-content',
            transition: 'transform 0.7s cubic-bezier(.4,1.3,.6,1)',
            willChange: 'transform',
          }}
        >
          {cards.map((card, idx) => (
            <Paper
              key={idx}
              elevation={4}
              sx={{
                minWidth: 180,
                maxWidth: 210,
                flex: '0 0 auto',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 4,
                background: card.color,
                minHeight: 90,
                boxShadow: '0 4px 24px 0 #1976d222',
                position: 'relative',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.03)',
                  boxShadow: '0 8px 32px 0 #1976d244',
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.92)', color: '#1976d2', width: 44, height: 44, boxShadow: '0 2px 8px #1976d222', fontSize: 26 }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 0.5, textShadow: '0 1px 4px #0002', fontSize: 14 }}>{card.title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', textShadow: '0 2px 8px #0002', letterSpacing: 1, fontSize: 22 }}>{card.value}</Typography>
              </Box>
              <Chip label={card.badge} size="small" sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.85)', color: '#1976d2', fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }} />
            </Paper>
          ))}
        </Box>
        {/* Flecha derecha */}
        {total > visible && (
          <Button onClick={handleNext} sx={{ minWidth: 0, p: 0.5, position: 'absolute', right: -36, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', boxShadow: 2, borderRadius: '50%' }}>
            <ArrowForwardIosIcon fontSize="small" />
          </Button>
        )}
      </Box>
      {/* Accesos rápidos y Satisfacción del cliente en una fila, Estado de mesas debajo */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 5, mb: { xs: 2, md: 0 }, backdropFilter: 'blur(8px)', background: 'rgba(227,242,253,0.7)', boxShadow: '0 8px 32px 0 #0288d144', border: '1.5px solid #90caf9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MenuBookIcon sx={{ color: '#0288d1', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0288d1', letterSpacing: 1 }}>Accesos rápidos</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary" onClick={onNuevoPedido} sx={{ fontWeight: 700, borderRadius: 3, px: 3, boxShadow: '0 2px 8px #1976d222' }}>Nuevo Pedido</Button>
              <Button variant="outlined" color="primary" onClick={onIrReportes} sx={{ fontWeight: 700, borderRadius: 3, px: 3 }}>Ver Reportes</Button>
              <Button variant="outlined" color="secondary" onClick={onIrMenu} sx={{ fontWeight: 700, borderRadius: 3, px: 3 }}>Ver Menú</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 5, mb: { xs: 2, md: 0 }, backdropFilter: 'blur(8px)', background: 'rgba(255,253,231,0.7)', boxShadow: '0 8px 32px 0 #fbc02d44', border: '1.5px solid #fff176' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ color: '#fbc02d', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fbc02d', letterSpacing: 1 }}>Satisfacción del cliente</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fbc02d', fontSize: 18 }}>Promedio de calificaciones recientes:</Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 900 }}>{feedbackProm}</Typography>
              <LinearProgress variant="determinate" value={feedbackProm * 20} sx={{ flex: 1, height: 14, borderRadius: 6, ml: 2, background: '#fffde7' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3, borderRadius: 5, mb: 4, backdropFilter: 'blur(8px)', background: 'rgba(237,231,246,0.7)', boxShadow: '0 8px 32px 0 #7b1fa244', border: '1.5px solid #ce93d8' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TableRestaurantIcon sx={{ color: '#7b1fa2', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7b1fa2', letterSpacing: 1 }}>Estado de mesas</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              {mesasEstado.map(mesa => (
                <Chip
                  key={mesa.id}
                  label={`Mesa ${mesa.id}`}
                  color={mesa.ocupada ? 'error' : 'success'}
                  variant={mesa.ocupada ? 'filled' : 'outlined'}
                  icon={<TableRestaurantIcon />}
                  sx={{ fontWeight: 600, fontSize: 15, mb: 1 }}
                />
              ))}
            </Box>
            <Box sx={{ width: '100%', height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Ocupadas', value: mesasEstado.filter(m => m.ocupada).length },
                      { name: 'Libres', value: mesasEstado.filter(m => !m.ocupada).length }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    label
                  >
                    <Cell key="ocupadas" fill="#d84315" />
                    <Cell key="libres" fill="#43a047" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Divider sx={{ my: 4, borderColor: '#1976d2', borderWidth: 2, borderRadius: 2 }} />
      {/* Gráficas rápidas */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, minHeight: 220 }}>
            <Typography variant="subtitle1">Ventas por hora/día</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke="#1976d2" name="Ventas" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, minHeight: 220 }}>
            <Typography variant="subtitle1">Ranking de platillos más vendidos</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={rankingPlatillos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {rankingPlatillos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, minHeight: 220 }}>
            <Typography variant="subtitle1">Horas pico de atención</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={horasPico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pedidos" fill="#388e3c" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Divider sx={{ my: 4, borderColor: '#388e3c', borderWidth: 2, borderRadius: 2 }} />
      {/* Actividad reciente, Comparativas y Alertas y notificaciones en una sola fila */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 5, mb: 4, backdropFilter: 'blur(8px)', background: 'rgba(227,242,253,0.7)', boxShadow: '0 8px 32px 0 #1976d244', border: '1.5px solid #90caf9', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>Actividad reciente</Typography>
            </Box>
            {actividad.length === 0 ? (
              <Typography color="text.secondary">Sin actividad reciente.</Typography>
            ) : (
              actividad.slice(0, 5).map((act, idx) => (
                <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>{act}</Typography>
              ))
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 5, mb: 4, backdropFilter: 'blur(8px)', background: 'rgba(232,245,233,0.7)', boxShadow: '0 8px 32px 0 #388e3c44', border: '1.5px solid #a5d6a7', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ color: '#388e3c', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c', letterSpacing: 1 }}>Comparativas</Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>Ventas actuales vs. periodo anterior</Typography>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={comparativaVentas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1976d2" name="Total ventas" />
              </BarChart>
            </ResponsiveContainer>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#388e3c', mt: 2 }}>Desempeño de empleados</Typography>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={comparativaEmpleados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="empleado" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pedidos" fill="#388e3c" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 5, mb: 4, backdropFilter: 'blur(8px)', background: 'rgba(255,235,238,0.7)', boxShadow: '0 8px 32px 0 #d8431544', border: '1.5px solid #ffab91', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon sx={{ color: '#d84315', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#d84315', letterSpacing: 1 }}>Alertas y notificaciones</Typography>
            </Box>
            {alertas.length === 0 ? (
              <Typography color="text.secondary">Sin alertas.</Typography>
            ) : (
              alertas.map((alert, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <WarningIcon color="error" />
                  <Typography variant="body2">{alert}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
