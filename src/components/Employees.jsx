import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Switch
} from '@mui/material';

function Employees({ roles, setRoles }) {
  // Manejo de foto
  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(f => ({ ...f, photo: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setForm(f => ({ ...f, photo: '' }));
  };
  // Persistencia de empleados en localStorage
  const [employees, setEmployees] = useState(() => {
    const stored = localStorage.getItem('employees');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    // Datos de ejemplo iniciales
    return [
      {
        id: 1,
        name: 'Juan Pérez',
        cedula: '12345678',
        role: 'Mesero',
        phone: '555-1234',
        active: true,
        photo: '',
        notes: 'Empleado destacado por atención al cliente.',
        history: [
          { date: '2025-07-01', action: 'Creado' },
          { date: '2025-07-10', action: 'Actualizado' }
        ]
      },
      {
        id: 2,
        name: 'Ana Gómez',
        cedula: '87654321',
        role: 'Cocinero',
        phone: '555-5678',
        active: false,
        photo: '',
        notes: '',
        history: [
          { date: '2025-07-02', action: 'Creado' }
        ]
      }
    ];
  });

  // Guardar empleados en localStorage cada vez que cambian
  React.useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', cedula: '', role: '', phone: '', active: true, photo: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  // roles ahora viene como prop desde App.jsx
  // Para obtener los privilegios del rol seleccionado
  const getPrivilegesForRole = (role) => {
    if (!role) return [];
    if (typeof role === 'string') return [];
    return Array.isArray(role.privileges) ? role.privileges : [];
  };

  // Filtrado de empleados
  const filtered = employees.filter(e => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      e.name.toLowerCase().includes(term) ||
      e.role.toLowerCase().includes(term) ||
      e.phone.toLowerCase().includes(term) ||
      (e.active ? 'activo' : 'inactivo').includes(term)
    );
  });
  // Paginación
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Abrir formulario para agregar o editar
  const handleOpen = (emp = null) => {
    if (emp) {
      setEditId(emp.id);
      setForm({
        name: emp.name,
        cedula: emp.cedula || '',
        role: emp.role,
        phone: emp.phone,
        active: emp.active,
        photo: emp.photo || '',
        notes: emp.notes || ''
      });
    } else {
      setEditId(null);
      setForm({ name: '', cedula: '', role: '', phone: '', active: true, photo: '', notes: '' });
    }
    setErrors({});
    setOpen(true);
  };

  // Guardar empleado nuevo o editado
  const handleSave = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!/^\d{6,12}$/.test(form.cedula.trim())) {
      newErrors.cedula = 'La cédula debe ser numérica y tener entre 6 y 12 dígitos';
    }
    if (!form.role) newErrors.role = 'El cargo es obligatorio';
    if (!form.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (editId) {
      setEmployees(employees.map(e =>
        e.id === editId
          ? { ...e, ...form, history: [...(e.history || []), { date: new Date().toISOString().slice(0, 10), action: 'Actualizado' }] }
          : e
      ));
    } else {
      setEmployees([
        ...employees,
        {
          ...form,
          id: Date.now(),
          history: [{ date: new Date().toISOString().slice(0, 10), action: 'Creado' }]
        }
      ]);
    }
    setOpen(false);
  };

  // Mostrar historial de actividad
  const handleShowHistory = (emp) => {
    setHistoryData(emp.history || []);
    setHistoryOpen(true);
  };

  // Eliminar empleado
  const handleDelete = id => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  // Cambiar estado activo/inactivo
  const handleToggleActive = id => {
    setEmployees(employees.map(e =>
      e.id === id
        ? { ...e, active: !e.active, history: [...(e.history || []), { date: new Date().toISOString().slice(0, 10), action: e.active ? 'Desactivado' : 'Activado' }] }
        : e
    ));
  };

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      padding: { xs: 2, sm: 3, md: 4 },
      margin: 0,
      fontFamily: 'Montserrat, Arial, sans-serif',
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        height: 'auto',
        background: 'transparent',
        borderRadius: 0,
        boxShadow: 'none',
        p: 0,
        m: 0,
        border: 'none',
        fontFamily: 'Montserrat, Arial, sans-serif',
      }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#2d3a4a', letterSpacing: 1 }}>Gestión de Empleados</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <TextField
            label="Buscar empleado"
            variant="outlined"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 220, background: '#fff', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          />
          <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', px: 3 }}>
            <AddIcon sx={{ mr: 1 }} />
            Agregar empleado
          </Button>
        </Box>
        {/* Paginación */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Página {page} de {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)'
          },
          gap: { xs: 2, sm: 3 },
          mt: 0,
          mb: 0,
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 900, lg: 1200 },
          minHeight: { xs: 'auto', sm: 'calc(60vh - 32px)' },
          mx: 'auto',
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          overflow: 'hidden',
        }}>
          {paginated.map(emp => (
            <Paper key={emp.id} elevation={3} sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              aspectRatio: '1 / 1',
              minWidth: { xs: 140, sm: 180 },
              maxWidth: { xs: 180, sm: 220 },
              width: '100%',
              position: 'relative',
              justifyContent: 'flex-start',
            }}>
              <Avatar
                src={emp.photo}
                alt={emp.name}
                sx={{ width: 64, height: 64, mb: 2, bgcolor: '#e0e7ef', fontWeight: 700, fontSize: 28 }}
              >
                {!emp.photo && emp.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3a4a', mb: 1 }}>{emp.name}</Typography>
              <Typography variant="body2" sx={{ color: '#607d8b', mb: 1 }}>Cédula: {emp.cedula}</Typography>
              <Typography variant="body2" sx={{ color: '#607d8b', mb: 1 }}>{typeof emp.role === 'object' ? emp.role.name : emp.role}</Typography>
              {/* Mostrar privilegios si existen */}
              {getPrivilegesForRole(emp.role).length > 0 && (
                <Box sx={{ mb: 1, width: '100%' }}>
                  <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600, textAlign: 'center', display: 'block', mb: 0.5 }}>Privilegios:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                    {getPrivilegesForRole(emp.role).map((priv, idx) => (
                      <Typography key={idx} variant="caption" sx={{ background: '#e3f2fd', color: '#1976d2', px: 1, py: 0.5, borderRadius: 1, fontWeight: 500 }}>{priv}</Typography>
                    ))}
                  </Box>
                </Box>
              )}
              <Typography variant="body2" sx={{ color: '#607d8b', mb: 2 }}>Tel: {emp.phone}</Typography>
              {emp.notes && (
                <Typography variant="body2" sx={{ color: '#8d5524', mb: 1, fontStyle: 'italic', textAlign: 'center', px: 1 }}>
                  {emp.notes}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Switch
                  checked={emp.active}
                  onChange={() => handleToggleActive(emp.id)}
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500, color: emp.active ? '#388e3c' : '#d32f2f' }}>
                  {emp.active ? 'Activo' : 'Inactivo'}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 2, mt: 'auto', pt: 2 }}>
                <IconButton color="primary" onClick={() => handleOpen(emp)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleShowHistory(emp)}>
                  <HistoryIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(emp.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef', borderBottom: '1px solid #cfd8dc' }}>{editId ? 'Editar empleado' : 'Agregar empleado'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320, background: '#f8fafc' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={form.photo}
                alt={form.name}
                sx={{ width: 64, height: 64, mb: 2, bgcolor: '#e0e7ef', fontWeight: 700, fontSize: 28 }}
              >
                {!form.photo && form.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button component="label" variant="outlined" size="small" sx={{ fontSize: 12 }}>
                  Subir foto
                  <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                </Button>
                {form.photo && (
                  <Button variant="text" color="error" size="small" sx={{ fontSize: 12 }} onClick={handleRemovePhoto}>
                    Quitar foto
                  </Button>
                )}
              </Box>
              {/* Mostrar privilegios del rol seleccionado en el formulario */}
              {getPrivilegesForRole(form.role).length > 0 && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600, textAlign: 'center', display: 'block', mb: 0.5 }}>Privilegios del cargo:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                    {getPrivilegesForRole(form.role).map((priv, idx) => (
                      <Typography key={idx} variant="caption" sx={{ background: '#e3f2fd', color: '#1976d2', px: 1, py: 0.5, borderRadius: 1, fontWeight: 500 }}>{priv}</Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
            <TextField
              label="Notas o comentarios internos"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              multiline
              minRows={2}
              maxRows={4}
              sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
            />
            <TextField
              label="Nombre"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
            />
            <TextField
              label="Cédula"
              value={form.cedula}
              onChange={e => setForm({ ...form, cedula: e.target.value })}
              required
              error={!!errors.cedula}
              helperText={errors.cedula}
              sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-label">Cargo</InputLabel>
              <Select
                labelId="role-label"
                value={typeof form.role === 'object' ? form.role.name : form.role}
                label="Cargo"
                onChange={e => {
                  const value = e.target.value;
                  // Buscar el objeto completo en roles
                  const selected = roles.find(r => (typeof r === 'string' ? r === value : r.name === value));
                  setForm({ ...form, role: selected });
                }}
                required
                error={!!errors.role}
                sx={{ background: '#fff', borderRadius: 2 }}
              >
                {roles.map((role, idx) => {
                  if (typeof role === 'string') {
                    return <MenuItem key={role} value={role}>{role}</MenuItem>;
                  }
                  return <MenuItem key={role.name || idx} value={role.name}>{role.name}</MenuItem>;
                })}
              </Select>
              {errors.role && <Typography color="error" variant="caption">{errors.role}</Typography>}
            </FormControl>
            <TextField
              label="Teléfono"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
              error={!!errors.phone}
              helperText={errors.phone}
              sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Switch
                checked={form.active}
                onChange={e => setForm({ ...form, active: e.target.checked })}
                color="success"
              />
              <Typography sx={{ fontWeight: 500 }}>{form.active ? 'Activo' : 'Inactivo'}</Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ background: '#e0e7ef', borderTop: '1px solid #cfd8dc' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#2d3a4a', fontWeight: 600 }}>
              <CancelIcon sx={{ mr: 1 }} />
              Cancelar
            </Button>
            <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
              <SaveIcon sx={{ mr: 1 }} />
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal historial de actividad */}
        <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef', borderBottom: '1px solid #cfd8dc' }}>Historial de actividad</DialogTitle>
          <DialogContent sx={{ background: '#f8fafc' }}>
            {historyData.length === 0 ? (
              <Typography>No hay historial disponible.</Typography>
            ) : (
              <Box>
                {historyData.map((h, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {h.date} - {h.action}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ background: '#e0e7ef', borderTop: '1px solid #cfd8dc' }}>
            <Button onClick={() => setHistoryOpen(false)} sx={{ color: '#2d3a4a', fontWeight: 600 }}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Employees;
