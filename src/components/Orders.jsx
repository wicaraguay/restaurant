import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputLabel,
  FormControl,
  Snackbar,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';

export default function Orders({ menuByDay, selectedDay }) {
  // Estado de pedidos
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('orders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  React.useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Estado UI
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ mesa: '', cliente: '', platillos: [], estado: 'pendiente', notas: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [filter, setFilter] = useState('');
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const estados = [
    { value: 'pendiente', label: 'Pendiente', color: 'warning' },
    { value: 'preparacion', label: 'En preparación', color: 'info' },
    { value: 'servido', label: 'Servido', color: 'success' },
    { value: 'pagado', label: 'Pagado', color: 'default' }
  ];
  const mesas = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const platillosEjemplo = ['Pollo a la brasa', 'Ceviche mixto', 'Lomo saltado', 'Jugo de maracuyá', 'Tarta de chocolate'];

  // Filtrado
  const filteredOrders = filter ? orders.filter(o => o.estado === filter) : orders;

  // Platillos activos del menú del día seleccionado
  const platillosDisponibles = menuByDay && selectedDay && menuByDay[selectedDay]
    ? menuByDay[selectedDay].filter(p => p.active).map(p => p.name)
    : [];

  // Abrir modal para agregar/editar
  const handleOpen = (order = null) => {
    if (order) {
      setEditId(order.id);
      setForm({
        ...order,
        platillos: Array.isArray(order.platillos) ? order.platillos : (order.platillos ? order.platillos.split(',').map(p => p.trim()) : [])
      });
    } else {
      setEditId(null);
      setForm({ mesa: '', cliente: '', platillos: [], estado: 'pendiente', notas: '' });
    }
    setOpen(true);
  };

  // Guardar pedido
  const handleSave = () => {
    if (!form.mesa || !form.platillos || form.platillos.length === 0) {
      setSnackbar({ open: true, message: 'Mesa y platillos son obligatorios' });
      return;
    }
    const pedido = {
      ...form,
      platillos: form.platillos,
      id: editId ? editId : crypto.randomUUID(),
      fecha: editId ? form.fecha : new Date().toISOString().slice(0, 16)
    };
    if (editId) {
      setOrders(orders.map(o => o.id === editId ? pedido : o));
      setSnackbar({ open: true, message: 'Pedido actualizado' });
    } else {
      setOrders([
        ...orders,
        pedido
      ]);
      setSnackbar({ open: true, message: 'Pedido creado' });
    }
    setOpen(false);
  };

  // Cambiar estado del pedido
  const handleChangeEstado = (id, nextEstado) => {
    setOrders(orders.map(o => o.id === id ? { ...o, estado: nextEstado } : o));
    setSnackbar({ open: true, message: `Estado cambiado a ${estados.find(e => e.value === nextEstado)?.label}` });
  };

  // Eliminar pedido
  const handleDelete = id => {
    setOrders(orders.filter(o => o.id !== id));
    setSnackbar({ open: true, message: 'Pedido eliminado' });
  };

  // Helper para obtener el pedido de la mesa seleccionada
  const pedidoMesa = mesaSeleccionada ? orders.find(o => o.mesa === mesaSeleccionada) : null;

  // Calcular total del pedido de la mesa seleccionada
  let totalPedido = 0;
  if (pedidoMesa && Array.isArray(pedidoMesa.platillos)) {
    totalPedido = pedidoMesa.platillos.reduce((acc, nombrePlatillo) => {
      const platillo = menuByDay[selectedDay]?.find(p => p.name === nombrePlatillo);
      return platillo ? acc + Number(platillo.price || 0) : acc;
    }, 0);
  }

  // Handler para agregar platillo desde menú visual
  const handleAgregarPlatillo = (platillo) => {
    if (!mesaSeleccionada) return;
    if (!pedidoMesa) {
      // Crear pedido nuevo
      setOrders([
        ...orders,
        {
          id: crypto.randomUUID(),
          mesa: mesaSeleccionada,
          cliente: '',
          platillos: [platillo.name],
          estado: 'pendiente',
          notas: '',
          fecha: new Date().toISOString().slice(0, 16)
        }
      ]);
      setSnackbar({ open: true, message: 'Pedido creado y platillo agregado' });
    } else if (!pedidoMesa.platillos.includes(platillo.name)) {
      setOrders(orders.map(o => o.mesa === mesaSeleccionada ? { ...o, platillos: [...o.platillos, platillo.name] } : o));
      setSnackbar({ open: true, message: 'Platillo agregado' });
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', fontFamily: 'Montserrat, Arial, sans-serif', p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#2d3a4a', letterSpacing: 1 }}>Gestión de Pedidos</Typography>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Columna 1: Mesas */}
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>Mesas</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {mesas.map(mesa => {
              const pedido = orders.find(o => o.mesa === mesa);
              return (
                <Paper key={mesa} elevation={3} sx={{ p: 2, borderRadius: 3, background: mesaSeleccionada === mesa ? '#fffbe6' : '#fff', boxShadow: mesaSeleccionada === mesa ? '0 4px 16px #ffe082' : '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: mesaSeleccionada === mesa ? '2px solid #fbc02d' : '2px solid #e0e0e0', minHeight: 120 }} onClick={() => setMesaSeleccionada(mesa)}>
                  <TableRestaurantIcon sx={{ color: pedido ? '#fbc02d' : '#1976d2', fontSize: 36, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#2d3a4a' }}>Mesa {mesa}</Typography>
                  {pedido ? (
                    <Chip label={estados.find(e => e.value === pedido.estado)?.label} color={estados.find(e => e.value === pedido.estado)?.color} size="small" sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="caption" sx={{ color: '#bdbdbd', fontStyle: 'italic', mt: 1 }}>Sin pedido</Typography>
                  )}
                </Paper>
              );
            })}
          </Box>
        </Box>
        {/* Columna 2: Menú del día */}
        <Box sx={{ flex: 2, minWidth: 320 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>Menú del día ({selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)})</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {menuByDay[selectedDay].length === 0 ? (
              <Typography variant="body2" sx={{ color: '#bdbdbd', fontStyle: 'italic', gridColumn: '1/-1' }}>No hay platillos para este día.</Typography>
            ) : (
              menuByDay[selectedDay].map(platillo => (
                <Paper key={platillo.id} elevation={2} sx={{ p: 2, borderRadius: 3, background: platillo.active ? '#fff' : '#f5f5f5', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: platillo.active ? 1 : 0.5, cursor: platillo.active && mesaSeleccionada ? 'pointer' : 'not-allowed', border: '1px solid #e0e0e0', minHeight: 220 }} onClick={() => platillo.active && mesaSeleccionada && handleAgregarPlatillo(platillo)}>
                  <Avatar src={platillo.photo} alt={platillo.name} sx={{ width: 64, height: 64, mb: 1, bgcolor: '#e0e7ef', fontWeight: 700, fontSize: 28 }}>
                    {!platillo.photo && platillo.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#2d3a4a', mb: 0.5 }}>{platillo.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#607d8b', mb: 0.5 }}>{platillo.category}</Typography>
                  <Typography variant="body2" sx={{ color: '#388e3c', fontWeight: 600, mb: 0.5 }}>${platillo.price}</Typography>
                  <Typography variant="caption" sx={{ color: '#607d8b', mb: 1, textAlign: 'center' }}>{platillo.description}</Typography>
                  <Chip label={platillo.active ? 'Disponible' : 'No disponible'} color={platillo.active ? 'success' : 'default'} size="small" sx={{ mb: 1 }} />
                  {mesaSeleccionada && platillo.active && <Button size="small" variant="outlined" color="primary" sx={{ mt: 1 }} onClick={e => { e.stopPropagation(); handleAgregarPlatillo(platillo); }}>Agregar</Button>}
                </Paper>
              ))
            )}
          </Box>
          {/* Mostrar pedido actual de la mesa seleccionada */}
          {mesaSeleccionada && pedidoMesa && (
            <Box sx={{ mt: 4, p: 2, background: '#fffbe6', borderRadius: 3, boxShadow: '0 2px 8px #ffe082', border: '1px solid #fbc02d' }}>
              <Typography variant="h6" sx={{ color: '#fbc02d', fontWeight: 700, mb: 1 }}>Pedido de Mesa {mesaSeleccionada}</Typography>
              <Typography variant="body2" sx={{ color: '#607d8b', mb: 1 }}>Cliente: {pedidoMesa.cliente || 'Sin nombre'}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {Array.isArray(pedidoMesa.platillos) ? pedidoMesa.platillos.map((p, idx) => <Chip key={idx} label={p} size="small" />) : null}
              </Box>
              {/* Mostrar total del pedido */}
              <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 700, mb: 2, textAlign: 'right' }}>
                Total: ${totalPedido.toFixed(2)}
              </Typography>
              <TextField label="Notas (opcional)" value={pedidoMesa.notas || ''} onChange={e => setOrders(orders.map(o => o.mesa === mesaSeleccionada ? { ...o, notas: e.target.value } : o))} multiline minRows={2} maxRows={4} sx={{ mb: 2, background: '#fff', borderRadius: 2 }} />
              <Button onClick={() => { setOrders(orders.filter(o => o.mesa !== mesaSeleccionada)); setSnackbar({ open: true, message: 'Pedido eliminado' }); }} color="error" sx={{ fontWeight: 600 }}>
                <CancelIcon sx={{ mr: 1 }} /> Eliminar pedido
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );

  // Helper para avanzar estado
  function getNextEstado(estado) {
    const idx = estados.findIndex(e => e.value === estado);
    if (idx < estados.length - 1) return estados[idx + 1].value;
    return estado;
  }
}
