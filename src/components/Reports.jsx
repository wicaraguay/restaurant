
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

// Puedes usar librerías como chart.js o recharts para las gráficas
// Aquí se deja la estructura lista para integrar

export default function Reports({ orders = [], menuByDay = {}, empleados = [] }) {
  const [tab, setTab] = useState(0);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    empleado: '',
    mesa: '',
    platillo: '',
    estado: '',
    periodo: 'dia',
  });

  // Helpers para filtrar y agrupar datos
  const pedidosFiltrados = useMemo(() => {
    return orders.filter(o => {
      const fecha = o.fecha || '';
      const cumpleFecha = (!filtros.fechaInicio || fecha >= filtros.fechaInicio) && (!filtros.fechaFin || fecha <= filtros.fechaFin);
      const cumpleEmpleado = !filtros.empleado || o.empleado === filtros.empleado;
      const cumpleMesa = !filtros.mesa || o.mesa === filtros.mesa;
      const cumplePlatillo = !filtros.platillo || (Array.isArray(o.platillos) && o.platillos.some(p => p.name === filtros.platillo));
      const cumpleEstado = !filtros.estado || o.estado === filtros.estado;
      return cumpleFecha && cumpleEmpleado && cumpleMesa && cumplePlatillo && cumpleEstado;
    });
  }, [orders, filtros]);

  // 1. Ventas por periodo
  const ventasPorPeriodo = useMemo(() => {
    const agrupado = {};
    pedidosFiltrados.forEach(o => {
      const key = filtros.periodo === 'mes'
        ? (o.fecha || '').slice(0, 7)
        : filtros.periodo === 'semana'
          ? (o.fecha || '').slice(0, 10) // simplificado
          : (o.fecha || '').slice(0, 10);
      if (!agrupado[key]) agrupado[key] = { total: 0, pedidos: 0 };
      let totalPedido = 0;
      if (Array.isArray(o.platillos)) {
        o.platillos.forEach(p => {
          const plat = menuByDay[o.dia]?.find(m => m.name === p.name) || { price: 0 };
          totalPedido += (plat.price || 0) * (p.cantidad || 1);
        });
      }
      agrupado[key].total += totalPedido;
      agrupado[key].pedidos += 1;
    });
    return agrupado;
  }, [pedidosFiltrados, filtros.periodo, menuByDay]);

  // Datos para la gráfica de ventas
  const ventasData = Object.entries(ventasPorPeriodo).map(([periodo, datos]) => ({
    periodo,
    total: datos.total,
    pedidos: datos.pedidos,
  }));


  // 2. Platillos más vendidos
  const rankingPlatillos = useMemo(() => {
    const conteo = {};
    pedidosFiltrados.forEach(o => {
      if (Array.isArray(o.platillos)) {
        o.platillos.forEach(p => {
          conteo[p.name] = (conteo[p.name] || 0) + (p.cantidad || 1);
        });
      }
    });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  }, [pedidosFiltrados]);
  const platillosData = rankingPlatillos.map(([name, value]) => ({ name, value }));

  // Colores para gráficas de pastel
  const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d84315', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#43a047', '#6d4c41'];

  // 3. Mesas más ocupadas
  const mesasOcupadas = useMemo(() => {
    const conteo = {};
    pedidosFiltrados.forEach(o => {
      conteo[o.mesa] = (conteo[o.mesa] || 0) + 1;
    });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  }, [pedidosFiltrados]);
  const mesasData = mesasOcupadas.map(([name, value]) => ({ name: `Mesa ${name}`, value }));

  // 4. Ingresos por empleado
  const ingresosPorEmpleado = useMemo(() => {
    const conteo = {};
    pedidosFiltrados.forEach(o => {
      if (!o.empleado) return;
      let totalPedido = 0;
      if (Array.isArray(o.platillos)) {
        o.platillos.forEach(p => {
          const plat = menuByDay[o.dia]?.find(m => m.name === p.name) || { price: 0 };
          totalPedido += (plat.price || 0) * (p.cantidad || 1);
        });
      }
      conteo[o.empleado] = (conteo[o.empleado] || 0) + totalPedido;
    });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  }, [pedidosFiltrados, menuByDay]);
  const empleadosData = ingresosPorEmpleado.map(([name, value]) => ({ name, value }));

  // 5. Pedidos cancelados o modificados
  const pedidosCancelados = useMemo(() => pedidosFiltrados.filter(o => o.estado === 'cancelado'), [pedidosFiltrados]);
  const pedidosModificados = useMemo(() => pedidosFiltrados.filter(o => o.modificado), [pedidosFiltrados]);
  const canceladosData = [
    { name: 'Cancelados', value: pedidosCancelados.length },
    { name: 'Modificados', value: pedidosModificados.length },
    { name: 'Completos', value: pedidosFiltrados.length - pedidosCancelados.length - pedidosModificados.length }
  ];

  // 6. Horarios pico
  const horariosPico = useMemo(() => {
    const horas = {};
    pedidosFiltrados.forEach(o => {
      const hora = (o.fecha || '').slice(11, 13);
      horas[hora] = (horas[hora] || 0) + 1;
    });
    return Object.entries(horas).sort((a, b) => b[1] - a[1]);
  }, [pedidosFiltrados]);
  const horariosData = horariosPico.map(([name, value]) => ({ name: `${name}:00`, value }));

  // 7. Comparativa de ventas (simplificada)
  const comparativaVentas = ventasPorPeriodo;

  // 8. Exportar (placeholder)
  const handleExport = formato => {
    // Aquí puedes usar jsPDF, xlsx, etc.
    alert('Funcionalidad de exportar a ' + formato + ' próximamente.');
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
        p: { xs: 1, sm: 3, md: 4 },
        boxSizing: 'border-box',
        maxWidth: { xs: '100vw', sm: 1200 },
        mx: 'auto',
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center', color: '#2d3a4a' }}>Reportes</Typography>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        centered
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3, maxWidth: { xs: '100vw', sm: 900 }, mx: 'auto' }}
      >
        <Tab label="Ventas" icon={<BarChartIcon />} iconPosition="start" />
        <Tab label="Platillos" icon={<RestaurantMenuIcon />} iconPosition="start" />
        <Tab label="Mesas" icon={<TableRestaurantIcon />} iconPosition="start" />
        <Tab label="Empleados" icon={<PeopleIcon />} iconPosition="start" />
        <Tab label="Pedidos" icon={<PieChartIcon />} iconPosition="start" />
        <Tab label="Comparativas" icon={<BarChartIcon />} iconPosition="start" />
      </Tabs>
      {/* Filtros globales */}
      <Paper
        sx={{
          p: { xs: 1, sm: 2 },
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Periodo</InputLabel>
          <Select value={filtros.periodo} label="Periodo" onChange={e => setFiltros(f => ({ ...f, periodo: e.target.value }))}>
            <MenuItem value="dia">Día</MenuItem>
            <MenuItem value="semana">Semana</MenuItem>
            <MenuItem value="mes">Mes</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="date"
          size="small"
          label="Desde"
          InputLabelProps={{ shrink: true }}
          value={filtros.fechaInicio}
          onChange={e => setFiltros(f => ({ ...f, fechaInicio: e.target.value }))}
        />
        <TextField
          type="date"
          size="small"
          label="Hasta"
          InputLabelProps={{ shrink: true }}
          value={filtros.fechaFin}
          onChange={e => setFiltros(f => ({ ...f, fechaFin: e.target.value }))}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={filtros.estado} label="Estado" onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="preparacion">En preparación</MenuItem>
            <MenuItem value="servido">Servido</MenuItem>
            <MenuItem value="pagado">Pagado</MenuItem>
            <MenuItem value="cancelado">Cancelado</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('PDF')}>Exportar PDF</Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('Excel')}>Exportar Excel</Button>
      </Paper>
      {/* Contenido de cada tab */}
      {tab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Ventas por {filtros.periodo}</Typography>
          <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 220 : 300} minWidth={0} minHeight={0}>
            <BarChart data={ventasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#1976d2" name="Total ventas" />
              <Bar dataKey="pedidos" fill="#ffc107" name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14, marginTop: 16 }}>{JSON.stringify(ventasPorPeriodo, null, 2)}</pre>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Ranking de platillos más vendidos</Typography>
          <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 220 : 300} minWidth={0} minHeight={0}>
            <PieChart>
              <Pie data={platillosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                {platillosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14, marginTop: 16 }}>{JSON.stringify(rankingPlatillos, null, 2)}</pre>
        </Box>
      )}
      {tab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Mesas más ocupadas</Typography>
          <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 220 : 300} minWidth={0} minHeight={0}>
            <BarChart data={mesasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#1976d2" name="Veces ocupada" />
            </BarChart>
          </ResponsiveContainer>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14, marginTop: 16 }}>{JSON.stringify(mesasOcupadas, null, 2)}</pre>
        </Box>
      )}
      {tab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Ingresos por empleado</Typography>
          <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 220 : 300} minWidth={0} minHeight={0}>
            <BarChart data={empleadosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#388e3c" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14, marginTop: 16 }}>{JSON.stringify(ingresosPorEmpleado, null, 2)}</pre>
        </Box>
      )}
      {tab === 4 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Pedidos cancelados y modificados</Typography>
          <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 220 : 300} minWidth={0} minHeight={0}>
            <PieChart>
              <Pie data={canceladosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                {canceladosData.map((entry, index) => (
                  <Cell key={`cell-cancelados-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <Typography variant="subtitle2">Cancelados:</Typography>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14 }}>{JSON.stringify(pedidosCancelados, null, 2)}</pre>
          <Typography variant="subtitle2">Modificados:</Typography>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14 }}>{JSON.stringify(pedidosModificados, null, 2)}</pre>
        </Box>
      )}
      {tab === 5 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Comparativa de ventas</Typography>
          {/* Aquí puedes renderizar una gráfica y tabla */}
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14 }}>{JSON.stringify(comparativaVentas, null, 2)}</pre>
        </Box>
      )}
      <Divider sx={{ my: 4 }} />
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Horarios pico</Typography>
        <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 220 : 300} minWidth={0} minHeight={0}>
          <BarChart data={horariosData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#7b1fa2" name="Pedidos" />
          </BarChart>
        </ResponsiveContainer>
        <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 14, marginTop: 16 }}>{JSON.stringify(horariosPico, null, 2)}</pre>
      </Box>
    </Box>
  );
}
