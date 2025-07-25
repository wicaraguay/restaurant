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
  Switch
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
                xs: 'repeat(2, 1fr)', // 2 columnas en móviles
                sm: 'repeat(3, 1fr)', // 3 en tablets
                md: 'repeat(4, 1fr)', // 4 en desktop
                lg: 'repeat(6, 1fr)', // 6 en pantallas grandes
              },
              gap: { xs: 1, sm: 2 },
            }}
          >
            {mesas.map(mesa => {
              const pedido = orders.find(o => o.mesa === mesa);
              const isSelected = mesaSeleccionada === mesa;
              const cliente = pedido?.cliente || '';
              const tienePedido = !!pedido;
              const tienePlatillos = pedido && Array.isArray(pedido.platillos) && pedido.platillos.length > 0;
              return (
                <Paper
                  key={mesa}
                  elevation={3}
                  sx={{
                    p: { xs: 1, sm: 2 },
                    borderRadius: 3,
                    background: isSelected ? '#fffbe6' : '#fff',
                    boxShadow: isSelected ? '0 4px 16px #ffe082' : '0 2px 12px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #fbc02d' : '2px solid #e0e0e0',
                    minHeight: { xs: 90, sm: 120 },
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 180, md: 200 },
                    transition: 'box-shadow 0.2s, border 0.2s',
                  }}
                  onClick={() => {
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
                      setMesaSeleccionada(mesa);
                    }
                  }}
                >
                    <TableRestaurantIcon sx={{ color: tienePedido ? '#fbc02d' : '#1976d2', fontSize: { xs: 28, sm: 36 }, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#2d3a4a', textAlign: 'center', fontSize: { xs: 14, sm: 16 } }}>
                      Mesa {mesa}
                      {cliente && ` - ${cliente}`}
                    </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1, width: '100%', mb: 0.5, mt: 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {tienePlatillos
                          ? <Chip label="Ocupada" color="error" size="small" sx={{ fontSize: { xs: 10, sm: 12 } }} />
                          : <Chip label="Disponible" color="success" size="small" sx={{ fontSize: { xs: 10, sm: 12 } }} />}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {tienePlatillos
                          ? <Chip label={estados.find(e => e.value === pedido.estado)?.label || 'Pendiente'} color={estados.find(e => e.value === pedido.estado)?.color || 'warning'} size="small" sx={{ fontSize: { xs: 10, sm: 12 } }} />
                          : <Typography variant="caption" sx={{ color: '#bdbdbd', fontStyle: 'italic', fontSize: { xs: 10, sm: 12 } }}>Sin pedido</Typography>}
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1, fontSize: { xs: 11, sm: 13 }, py: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 2 } }}
                      onClick={e => { e.stopPropagation(); tienePedido && setPedidoPopup(pedido); }}
                      disabled={!tienePedido}
                    >
                      Ver pedido
                    </Button>
                  </Box>
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
          {/* <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>Menú del día ({selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)})</Typography> */}
          {/* Tarjetas de platillos eliminadas, solo se muestra el pedido actual de la mesa seleccionada */}
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
    </Box>
  );

  // Helper para avanzar estado
  function getNextEstado(estado) {
    const idx = estados.findIndex(e => e.value === estado);
    if (idx < estados.length - 1) return estados[idx + 1].value;
    return estado;
  }
}
