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
  Avatar,
  Tabs,
  Tab,
  Switch,
  Grid
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
  // Estado para el popup de pedido
  const [pedidoPopup, setPedidoPopup] = useState(null);
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
  const [alert, setAlert] = useState({ open: false, message: '' });
  const [filter, setFilter] = useState('');
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const estados = [
    { value: 'pendiente', label: 'Pendiente', color: 'warning' },
    { value: 'preparacion', label: 'En preparación', color: 'info' },
    { value: 'servido', label: 'Servido', color: 'success' },
    { value: 'pagado', label: 'Pagado', color: 'default' }
  ];
  const [mesas, setMesas] = useState(['1', '2', '3', '4', '5']);
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
      <Grid container spacing={3} sx={{ width: '100%', maxWidth: 1200, mx: 'auto', alignItems: 'flex-start' }}>
        {/* Mesas */}
        <Grid item xs={12} md={4}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)'
            },
            gap: { xs: 1.2, sm: 2 },
            pb: { xs: 1, sm: 0 }
          }}>
            {mesas.map((mesa, idx) => {
              const pedido = orders.find(o => o.mesa === mesa);
              const isSelected = mesaSeleccionada === mesa;
              const cliente = pedido?.cliente || '';
              const tienePedido = !!pedido;
              const tienePlatillos = pedido && Array.isArray(pedido.platillos) && pedido.platillos.length > 0;
              return (
                <Paper
                  key={mesa}
                  elevation={isSelected ? 12 : 4}
                  sx={{
                    p: { xs: 1.2, sm: 2.5 },
                    borderRadius: { xs: 3, sm: 4 },
                    background: isSelected
                      ? 'linear-gradient(135deg, #fffbe6 60%, #ffe082 100%)'
                      : 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                    boxShadow: isSelected
                      ? '0 6px 24px 0 #ffe082, 0 1.5px 8px 0 #fbc02d44'
                      : '0 2px 12px 0 #b0bec540',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: isSelected ? '2.5px solid #fbc02d' : '2px solid #e0e0e0',
                    minHeight: { xs: 100, sm: 120 },
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 220 },
                    transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
                    mb: { xs: 1, sm: 1.5 },
                    position: 'relative',
                    '&:hover': {
                      boxShadow: '0 8px 32px 0 #ffe082, 0 2px 12px 0 #fbc02d44',
                      border: '2.5px solid #fbc02d',
                      background: 'linear-gradient(135deg, #fffde7 60%, #ffe082 100%)',
                    },
                  }}
                  onClick={() => {
                    setMesaSeleccionada(mesa);
                    if (tienePedido) {
                      setPedidoPopup(pedido);
                    } else {
                      setPedidoPopup({
                        id: null,
                        mesa,
                        cliente: '',
                        platillos: [],
                        estado: 'pendiente',
                        notas: '',
                        fecha: new Date().toISOString().slice(0, 16),
                        tabIndex: 0
                      });
                    }
                  }}
                >
                  {/* Botón eliminar solo para mesas extra (no las 5 primeras) */}
                  {idx >= 5 && (
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2, color: '#e53935', background: '#fff', boxShadow: 1 }}
                      onClick={e => {
                        e.stopPropagation();
                        if (tienePlatillos) {
                          setAlert({ open: true, message: `No se puede eliminar la mesa ${mesa} porque está ocupada.\nLibere la mesa antes de eliminarla.` });
                          return;
                        }
                        setMesas(mesas.filter((m, i) => i !== idx));
                        // Eliminar pedido asociado si existe
                        setOrders(orders.filter(o => o.mesa !== mesa));
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box sx={{
                    width: { xs: 44, sm: 56 },
                    height: { xs: 44, sm: 56 },
                    borderRadius: '50%',
                    background: tienePlatillos ? 'linear-gradient(135deg, #ffe082 60%, #ffd54f 100%)' : 'linear-gradient(135deg, #e3f2fd 60%, #bbdefb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: tienePlatillos ? '0 2px 8px #ffd54f88' : '0 1px 4px #90caf988',
                    mb: { xs: 1, sm: 1.5 },
                  }}>
                    <TableRestaurantIcon sx={{ color: tienePlatillos ? '#fbc02d' : '#1976d2', fontSize: { xs: 26, sm: 34 } }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#2d3a4a', textAlign: 'center', fontSize: 18, letterSpacing: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#2d3a4a', textAlign: 'center', fontSize: { xs: 15, sm: 18 }, letterSpacing: 1, mb: { xs: 0.2, sm: 0.5 } }}>
                      Mesa {mesa}
                    </Typography>
                  </Typography>
                  {cliente && (
                    <Typography variant="body2" sx={{ color: '#607d8b', fontWeight: 500, textAlign: 'center', fontSize: 14, mb: 0.5, maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: 0.2 }}>
                      {cliente}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1.2, width: '100%', mb: 1, mt: 1 }}>
                      <Chip
                        label={tienePlatillos ? 'Ocupada' : 'Disponible'}
                        color={tienePlatillos ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: 12, px: 1.2, borderRadius: 2, letterSpacing: 0.5, background: tienePlatillos ? '#fff3e0' : '#e3fcef', color: tienePlatillos ? '#d84315' : '#388e3c', border: '1px solid #ffe082' }}
                      />
                      {!tienePlatillos && (
                        <Typography variant="caption" sx={{ color: '#bdbdbd', fontStyle: 'italic', fontSize: 13, ml: 1 }}>
                          Sin pedido
                        </Typography>
                      )}
                    </Box>
                    <Button
                      size="small"
                      variant={tienePlatillos ? 'contained' : 'outlined'}
                      color={tienePlatillos ? 'warning' : 'primary'}
                      sx={{
                        mb: 0.5,
                        fontSize: 14,
                        py: 1,
                        px: 2.5,
                        fontWeight: 700,
                        borderRadius: 2.5,
                        boxShadow: tienePlatillos ? '0 2px 8px #ffe08288' : 'none',
                        letterSpacing: 0.5,
                        background: tienePlatillos ? 'linear-gradient(90deg, #ffe082 60%, #ffd54f 100%)' : undefined,
                        color: tienePlatillos ? '#6d4c00' : undefined,
                        border: tienePlatillos ? '1.5px solid #ffd54f' : undefined,
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: tienePlatillos ? 'linear-gradient(90deg, #ffd54f 60%, #ffe082 100%)' : undefined,
                          color: tienePlatillos ? '#4e3400' : undefined,
                        },
                      }}
                      onClick={e => { e.stopPropagation(); tienePedido && tienePlatillos && setPedidoPopup(pedido); }}
                      disabled={!tienePedido || !tienePlatillos}
                    >
                      Ver pedido
                    </Button>
                  </Box>
                </Paper>
              );
            })}
            {/* Card para agregar nueva mesa */}
            <Paper
              key="add-mesa"
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 3,
                background: '#e3f2fd',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed #90caf9',
                minHeight: 100,
                width: '100%',
                maxWidth: 200,
                transition: 'box-shadow 0.2s, border 0.2s',
                mb: 1,
              }}
              onClick={() => {
                let nextMesa = (parseInt(mesas[mesas.length - 1] || '0', 10) + 1).toString();
                // Si ya existe, buscar el siguiente disponible
                while (mesas.includes(nextMesa)) {
                  nextMesa = (parseInt(nextMesa, 10) + 1).toString();
                }
                setMesas([...mesas, nextMesa]);
              }}
            >
              <AddIcon sx={{ color: '#1976d2', fontSize: 36, mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976d2', textAlign: 'center', fontSize: 16 }}>
                Agregar mesa
              </Typography>
            </Paper>
          </Box>
        </Grid>
        {/* Pedido (panel eliminado, solo se usa el popup) */}
        <Grid item xs={12} md={8}></Grid>
      </Grid>
      {/* Popup para ver pedido */}
      <Dialog open={!!pedidoPopup} onClose={() => setPedidoPopup(null)} maxWidth="xs" fullWidth PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          width: '100%',
          maxWidth: { xs: '98vw', sm: 500 },
          borderRadius: { xs: 2, sm: 3 },
        }
      }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: { xs: 16, sm: 20 } }}>
          Pedido de Mesa {pedidoPopup?.mesa}
          {pedidoPopup && (
            Array.isArray(pedidoPopup.platillos) && pedidoPopup.platillos.length > 0 ?
              <Chip label="Ocupada" color="error" size="small" /> :
              <Chip label="Disponible" color="success" size="small" />
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 0, sm: 1 } }}>
          {pedidoPopup && (
            <>
              {/* Tabs para Detalles y Menú */}
              <Tabs
                value={pedidoPopup.tabIndex || 0}
                onChange={(_, newValue) => {
                  setPedidoPopup({ ...pedidoPopup, tabIndex: newValue });
                }}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, minHeight: { xs: 32, sm: 48 } }}
              >
                <Tab label="Detalles del pedido" sx={{ fontSize: { xs: 12, sm: 15 } }} />
                <Tab label="Menú del día" sx={{ fontSize: { xs: 12, sm: 15 } }} />
              </Tabs>
              {/* Contenido de la pestaña Detalles */}
              {(!pedidoPopup.tabIndex || pedidoPopup.tabIndex === 0) && (
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  {/* Cliente editable */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>Cliente:</Typography>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={pedidoPopup.cliente || ''}
                      onChange={e => {
                        const nuevo = { ...pedidoPopup, cliente: e.target.value };
                        setPedidoPopup(nuevo);
                        setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, cliente: e.target.value } : o));
                      }}
                      placeholder="Nombre del cliente"
                      sx={{ background: '#fff', borderRadius: 2, minWidth: 140 }}
                    />
                  </Box>
                  {/* Estado editable */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>Estado:</Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={pedidoPopup.estado}
                        onChange={e => {
                          const nuevo = { ...pedidoPopup, estado: e.target.value };
                          setPedidoPopup(nuevo);
                          setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, estado: e.target.value } : o));
                        }}
                      >
                        {estados.map(e => (
                          <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  {/* Platillos editable */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Platillos:</Typography>
                  <Box sx={{ mb: 2 }}>
                    {Array.isArray(pedidoPopup.platillos) && pedidoPopup.platillos.length > 0 ? pedidoPopup.platillos.map((p, idx) => {
                      const platillo = menuByDay[selectedDay]?.find(m => m.name === p.name);
                      return (
                        <Paper key={idx} sx={{ display: 'flex', alignItems: 'center', p: { xs: 0.5, sm: 1 }, mb: 1, borderRadius: 2, background: '#f8fafc', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                          <Typography sx={{ minWidth: 70, fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>{p.name}</Typography>
                          <Button size="small" onClick={() => {
                            // Disminuir cantidad
                            if (p.cantidad <= 1) {
                              // Eliminar platillo
                              const nuevos = pedidoPopup.platillos.filter((_, i) => i !== idx);
                              setPedidoPopup({ ...pedidoPopup, platillos: nuevos });
                              setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, platillos: nuevos } : o));
                            } else {
                              const nuevos = pedidoPopup.platillos.map((pl, i) => i === idx ? { ...pl, cantidad: pl.cantidad - 1 } : pl);
                              setPedidoPopup({ ...pedidoPopup, platillos: nuevos });
                              setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, platillos: nuevos } : o));
                            }
                          }} sx={{ minWidth: 28, fontWeight: 700, px: 0 }}>-</Button>
                          <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center', fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>{p.cantidad}</Typography>
                          <Button size="small" onClick={() => {
                            // Aumentar cantidad
                            const nuevos = pedidoPopup.platillos.map((pl, i) => i === idx ? { ...pl, cantidad: pl.cantidad + 1 } : pl);
                            setPedidoPopup({ ...pedidoPopup, platillos: nuevos });
                            setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, platillos: nuevos } : o));
                          }} sx={{ minWidth: 28, fontWeight: 700, px: 0 }}>+</Button>
                          <Button size="small" color="error" onClick={() => {
                            // Eliminar platillo
                            const nuevos = pedidoPopup.platillos.filter((_, i) => i !== idx);
                            setPedidoPopup({ ...pedidoPopup, platillos: nuevos });
                            setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, platillos: nuevos } : o));
                          }} sx={{ ml: 1, minWidth: 28, px: 0 }}>x</Button>
                          <Typography sx={{ ml: 2, minWidth: 48, color: '#388e3c', fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>
                            ${platillo ? (platillo.price * p.cantidad).toFixed(2) : '0.00'}
                          </Typography>
                        </Paper>
                      );
                    }) : <Typography variant="body2" sx={{ color: '#bdbdbd', ml: 1 }}>Sin platillos</Typography>}
                  </Box>
                  {/* Notas editable */}
                  <TextField
                    label="Notas (opcional)"
                    value={pedidoPopup.notas || ''}
                    onChange={e => {
                      const nuevo = { ...pedidoPopup, notas: e.target.value };
                      setPedidoPopup(nuevo);
                      setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, notas: e.target.value } : o));
                    }}
                    multiline
                    minRows={2}
                    maxRows={4}
                    sx={{ mb: 2, background: '#fff', borderRadius: 2, mt: 2, fontSize: { xs: 13, sm: 15 } }}
                  />
                  <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 700, textAlign: 'right', mt: 2 }}>
                    Total: ${Array.isArray(pedidoPopup.platillos) ? pedidoPopup.platillos.reduce((acc, p) => {
                      const platillo = menuByDay[selectedDay]?.find(m => m.name === p.name);
                      return platillo ? acc + Number(platillo.price || 0) * (p.cantidad || 1) : acc;
                    }, 0).toFixed(2) : '0.00'}
                  </Typography>
                </Box>
              )}
              {/* Contenido de la pestaña Menú del día */}
              {pedidoPopup.tabIndex === 1 && (
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, mb: 2 }}>
                    Menú del día: {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 1fr',
                      md: '1fr 1fr 1fr',
                    },
                    gap: { xs: 1, sm: 2 },
                  }}>
                    {menuByDay[selectedDay]?.length === 0 ? (
                      <Typography variant="body2" sx={{ color: '#bdbdbd', fontStyle: 'italic', gridColumn: '1/-1' }}>No hay platillos para este día.</Typography>
                    ) : (
                      menuByDay[selectedDay].map(platillo => {
                        const yaEnPedido = pedidoPopup.platillos.some(pl => pl.name === platillo.name);
                        return (
                          <Paper key={platillo.id} elevation={2} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: platillo.active ? 1 : 0.5, cursor: yaEnPedido ? 'not-allowed' : 'pointer', border: '1px solid #e0e0e0', minHeight: { xs: 120, sm: 180 } }}>
                            <Avatar src={platillo.photo} alt={platillo.name} sx={{ width: { xs: 36, sm: 48 }, height: { xs: 36, sm: 48 }, mb: 1, bgcolor: '#e0e7ef', fontWeight: 700, fontSize: { xs: 16, sm: 20 } }}>
                              {!platillo.photo && platillo.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#2d3a4a', mb: 0.5, fontSize: { xs: 13, sm: 16 } }}>{platillo.name}</Typography>
                            <Typography variant="body2" sx={{ color: '#607d8b', mb: 0.5, fontSize: { xs: 12, sm: 14 } }}>{platillo.category}</Typography>
                            <Typography variant="body2" sx={{ color: '#388e3c', fontWeight: 600, mb: 0.5, fontSize: { xs: 12, sm: 14 } }}>${platillo.price}</Typography>
                            <Typography variant="caption" sx={{ color: '#607d8b', mb: 1, textAlign: 'center', fontSize: { xs: 11, sm: 12 } }}>{platillo.description}</Typography>
                            <Chip label={platillo.active ? 'Disponible' : 'No disponible'} color={platillo.active ? 'success' : 'default'} size="small" sx={{ mb: 1, fontSize: { xs: 10, sm: 12 } }} />
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ mt: 1, fontSize: { xs: 11, sm: 13 }, py: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 2 } }}
                              disabled={yaEnPedido || !platillo.active}
                              onClick={() => {
                                if (yaEnPedido || !platillo.active) return;
                                const nuevos = [...pedidoPopup.platillos, { name: platillo.name, cantidad: 1 }];
                                if (pedidoPopup.id) {
                                  // Pedido ya existe, actualizar platillos y estado a 'pendiente'
                                  setPedidoPopup({ ...pedidoPopup, platillos: nuevos, estado: 'pendiente' });
                                  setOrders(orders.map(o => o.id === pedidoPopup.id ? { ...o, platillos: nuevos, estado: 'pendiente' } : o));
                                } else {
                                  // Es un pedido nuevo (mesa estaba disponible), crear pedido en orders
                                  const nuevoPedido = {
                                    id: crypto.randomUUID(),
                                    mesa: pedidoPopup.mesa,
                                    cliente: pedidoPopup.cliente,
                                    platillos: nuevos,
                                    estado: 'pendiente',
                                    notas: pedidoPopup.notas,
                                    fecha: new Date().toISOString().slice(0, 16)
                                  };
                                  const nuevosOrders = [...orders, nuevoPedido];
                                  setOrders(nuevosOrders);
                                  setPedidoPopup(nuevoPedido);
                                }
                              }}
                            >
                              {yaEnPedido ? 'Agregado' : 'Agregar'}
                            </Button>
                          </Paper>
                        );
                      })
                    )}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPedidoPopup(null);
            setMesaSeleccionada(null);
          }} color="primary" variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Alerta para intento de eliminar mesa ocupada */}
      <Dialog
        open={alert.open}
        onClose={() => setAlert({ open: false, message: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            background: '#fff8e1',
            border: '2px solid #ffb300',
            boxShadow: '0 4px 24px #ffe082',
          }
        }}
      >
        <DialogTitle sx={{ color: '#e65100', fontWeight: 700, fontSize: 20, textAlign: 'center', pb: 0 }}>
          <CancelIcon sx={{ color: '#e65100', fontSize: 32, mb: -0.5, mr: 1 }} />
          Mesa ocupada
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 1, pb: 2 }}>
          <Typography sx={{ color: '#6d4c41', fontSize: 16, whiteSpace: 'pre-line' }}>{alert.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => setAlert({ open: false, message: '' })} variant="contained" color="warning" sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}>Aceptar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Helper para avanzar estado
  function getNextEstado(estado) {
    const idx = estados.findIndex(e => e.value === estado);
    if (idx < estados.length - 1) return estados[idx + 1].value;
    return estado;
  }
}
