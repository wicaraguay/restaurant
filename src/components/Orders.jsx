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

  // Cambia la estructura de platillos a [{ name, cantidad }]
  React.useEffect(() => {
    if (!pedidoMesa || !Array.isArray(pedidoMesa.platillos)) return;
    if (pedidoMesa.platillos.length > 0 && typeof pedidoMesa.platillos[0] === 'string') {
      setOrders(orders.map(o =>
        o.mesa === mesaSeleccionada
          ? { ...o, platillos: o.platillos.map(p => ({ name: p, cantidad: 1 })) }
          : o
      ));
    }
  }, [mesaSeleccionada]);

  // Handler para agregar platillo desde menú visual (con cantidad)
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
          platillos: [{ name: platillo.name, cantidad: 1 }],
          estado: 'pendiente',
          notas: '',
          fecha: new Date().toISOString().slice(0, 16)
        }
      ]);
      setSnackbar({ open: true, message: 'Pedido creado y platillo agregado' });
    } else {
      // Buscar si ya existe el platillo
      const idx = pedidoMesa.platillos.findIndex(p => p.name === platillo.name);
      if (idx === -1) {
        setOrders(orders.map(o =>
          o.mesa === mesaSeleccionada
            ? { ...o, platillos: [...o.platillos, { name: platillo.name, cantidad: 1 }] }
            : o
        ));
        setSnackbar({ open: true, message: 'Platillo agregado' });
      } else {
        setOrders(orders.map(o =>
          o.mesa === mesaSeleccionada
            ? { ...o, platillos: o.platillos.map((p, i) => i === idx ? { ...p, cantidad: p.cantidad + 1 } : p) }
            : o
        ));
        setSnackbar({ open: true, message: 'Cantidad aumentada' });
      }
    }
  };

  // Eliminar platillo del pedido de la mesa seleccionada
  const handleEliminarPlatillo = (nombrePlatillo) => {
    if (!mesaSeleccionada || !pedidoMesa) return;
    setOrders(orders.map(o =>
      o.mesa === mesaSeleccionada
        ? { ...o, platillos: o.platillos.filter(p => p.name !== nombrePlatillo) }
        : o
    ));
    setSnackbar({ open: true, message: 'Platillo eliminado del pedido' });
  };

  // Cambiar cantidad de un platillo
  const handleCambiarCantidad = (nombrePlatillo, nuevaCantidad) => {
    if (!mesaSeleccionada || !pedidoMesa) return;
    if (nuevaCantidad < 1) {
      handleEliminarPlatillo(nombrePlatillo);
      return;
    }
    setOrders(orders.map(o =>
      o.mesa === mesaSeleccionada
        ? { ...o, platillos: o.platillos.map(p => p.name === nombrePlatillo ? { ...p, cantidad: nuevaCantidad } : p) }
        : o
    ));
  };

  // Calcular total del pedido de la mesa seleccionada
  let totalPedido = 0;
  if (pedidoMesa && Array.isArray(pedidoMesa.platillos)) {
    totalPedido = pedidoMesa.platillos.reduce((acc, p) => {
      const platillo = menuByDay[selectedDay]?.find(m => m.name === p.name);
      return platillo ? acc + Number(platillo.price || 0) * (p.cantidad || 1) : acc;
    }, 0);
  }

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', fontFamily: 'Montserrat, Arial, sans-serif', p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#2d3a4a', letterSpacing: 1 }}>Gestión de Pedidos</Typography>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, sm: 3, md: 4 },
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-start' },
          justifyContent: 'center',
          width: '100%',
          maxWidth: { xs: '100%', md: 1200 },
          mx: 'auto',
        }}
      >
        {/* Columna 1: Mesas */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 220 }, maxWidth: { xs: '100%', md: 340 }, mb: { xs: 2, md: 0 } }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>Mesas</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr',
                sm: '1fr 1fr',
                md: '1fr',
              },
              gap: { xs: 1, sm: 2 },
            }}
          >
            {mesas.map(mesa => {
              const pedido = orders.find(o => o.mesa === mesa);
              const isSelected = mesaSeleccionada === mesa;
              return (
                <Paper
                  key={mesa}
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: isSelected ? '#fffbe6' : '#fff',
                    boxShadow: isSelected ? '0 4px 16px #ffe082' : '0 2px 12px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #fbc02d' : '2px solid #e0e0e0',
                    minHeight: 120
                  }}
                  onClick={() => setMesaSeleccionada(isSelected ? null : mesa)}
                >
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
        <Box sx={{
          flex: 2,
          minWidth: { xs: '100%', sm: 320 },
          maxWidth: { xs: '100%', md: 800 },
          width: '100%',
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>Menú del día ({selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)})</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr', // dos columnas en móvil
                sm: '1fr 1fr', // dos columnas en tablet
                md: '1fr 1fr 1fr', // tres columnas en desktop
              },
              gap: { xs: 1, sm: 2 },
            }}
          >
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
            <Box
              sx={{
                mt: 4,
                p: { xs: 1, sm: 2 },
                background: '#fffbe6',
                borderRadius: 3,
                boxShadow: '0 2px 8px #ffe082',
                border: '1px solid #fbc02d',
                width: '100%',
                maxWidth: 420,
                mx: { xs: 'auto', md: 0 },
              }}
            >
              <Typography variant="h6" sx={{ color: '#fbc02d', fontWeight: 700, mb: 1 }}>Pedido de Mesa {mesaSeleccionada}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="body2" sx={{ color: '#607d8b', mr: 1 }}>Cliente:</Typography>
      <TextField
        size="small"
        variant="outlined"
        value={pedidoMesa.cliente || ''}
        onChange={e => setOrders(orders.map(o => o.mesa === mesaSeleccionada ? { ...o, cliente: e.target.value } : o))}
        placeholder="Nombre del cliente"
        sx={{ background: '#fff', borderRadius: 2, minWidth: 140 }}
      />
    </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, width: '100%' }}>
                {Array.isArray(pedidoMesa.platillos) ? pedidoMesa.platillos.map((p, idx) => {
                  const platillo = menuByDay[selectedDay]?.find(m => m.name === p.name);
                  return (
                    <Paper
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: { xs: 0.5, sm: 1 },
                        borderRadius: 2,
                        background: '#fff',
                        boxShadow: '0 1px 4px #ffe082',
                        mb: 0.5,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        width: '100%',
                        minWidth: 0,
                      }}
                    >
                      <Typography sx={{ minWidth: 70, fontWeight: 600, fontSize: { xs: 13, sm: 15 } }}>{p.name}</Typography>
                      <Button size="small" onClick={() => handleCambiarCantidad(p.name, p.cantidad - 1)} sx={{ minWidth: 28, fontWeight: 700, px: 0 }}>-</Button>
                      <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center', fontWeight: 600, fontSize: { xs: 13, sm: 15 } }}>{p.cantidad}</Typography>
                      <Button size="small" onClick={() => handleCambiarCantidad(p.name, p.cantidad + 1)} sx={{ minWidth: 28, fontWeight: 700, px: 0 }}>+</Button>
                      <Typography sx={{ ml: 2, minWidth: 48, color: '#388e3c', fontWeight: 600, fontSize: { xs: 13, sm: 15 } }}>
                        ${platillo ? (platillo.price * p.cantidad).toFixed(2) : '0.00'}
                      </Typography>
                      <Button size="small" color="error" onClick={() => handleEliminarPlatillo(p.name)} sx={{ ml: 1, minWidth: 28, px: 0 }}>x</Button>
                    </Paper>
                  );
                }) : null}
              </Box>
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
