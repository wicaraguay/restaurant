import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const defaultPrivileges = [
  { key: 'crud_empleados', label: 'Gestionar empleados' },
  { key: 'crud_menu', label: 'Gestionar menú' },
  { key: 'crud_mesas', label: 'Gestionar mesas' },
  { key: 'ver_reportes', label: 'Ver reportes' },
  { key: 'ver_pedidos', label: 'Ver pedidos' },
  { key: 'admin', label: 'Administrador total' },
];

export default function RoleManager({ roles, setRoles }) {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [privileges, setPrivileges] = useState([]);

  // Cargar roles desde localStorage al iniciar
  React.useEffect(() => {
    const stored = localStorage.getItem('roles');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRoles(parsed);
      } catch {}
    }
  }, [setRoles]);

  // Guardar roles en localStorage cada vez que cambian
  React.useEffect(() => {
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [roles]);

  // Para backend: aquí puedes hacer fetch/axios a tu API para guardar roles
  // Ejemplo:
  // React.useEffect(() => {
  //   fetch('/api/roles', { method: 'POST', body: JSON.stringify(roles) })
  // }, [roles]);

  // Abrir modal para agregar/editar rol
  const handleOpen = (idx = null) => {
    if (idx !== null) {
      setEditIndex(idx);
      // Soporta roles como string o como objeto
      const r = roles[idx];
      if (typeof r === 'string') {
        setRoleName(r);
        setPrivileges([]);
      } else {
        setRoleName(r.name || '');
        setPrivileges(r.privileges || []);
      }
    } else {
      setEditIndex(null);
      setRoleName('');
      setPrivileges([]);
    }
    setOpen(true);
  };

  // Guardar rol
  const handleSave = () => {
    if (!roleName.trim()) return;
    const newRole = { name: roleName.trim(), privileges };
    if (editIndex !== null) {
      setRoles(prev => {
        const updated = prev.map((r, i) => i === editIndex ? newRole : r);
        localStorage.setItem('roles', JSON.stringify(updated));
        return updated;
      });
    } else {
      setRoles(prev => {
        const updated = [...prev, newRole];
        localStorage.setItem('roles', JSON.stringify(updated));
        return updated;
      });
    }
    setOpen(false);
    setRoleName('');
    setPrivileges([]);
    // Para backend: aquí puedes hacer fetch/axios a tu API para guardar el rol
    // Ejemplo:
    // fetch('/api/roles', { method: 'POST', body: JSON.stringify(newRole) })
  };

  // Eliminar rol
  const handleDelete = idx => {
    setRoles(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      localStorage.setItem('roles', JSON.stringify(updated));
      return updated;
    });
    // Para backend: aquí puedes hacer fetch/axios a tu API para eliminar el rol
    // Ejemplo:
    // fetch(`/api/roles/${idx}`, { method: 'DELETE' })
  };

  // Toggle privilegio
  const handleTogglePrivilege = key => {
    setPrivileges(prev =>
      prev.includes(key)
        ? prev.filter(p => p !== key)
        : [...prev, key]
    );
  };

  return (
    <Box sx={{
      width: '100%',
      maxWidth: { xs: '100%', sm: 500 },
      mx: 'auto',
      mt: { xs: 2, sm: 4 },
      px: { xs: 1, sm: 2 },
      boxSizing: 'border-box',
    }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#2d3a4a' }}>Gestión de Roles y Privilegios</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2, width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }}>Agregar rol</Button>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr' },
            gap: 2,
          }}
        >
          {roles.map((role, idx) => (
            <Paper
              key={role.name || role}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                boxShadow: 2,
                width: '100%',
                display: 'flex',
                alignItems: 'stretch',
                minHeight: { xs: 110, sm: 'auto' },
              }}
            >
              <ListItem
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                  width: '100%',
                  p: 0,
                }}
              >
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 18 } }}>{role.name || role}</Typography>}
                  secondary={role.privileges && role.privileges.length > 0
                    ? `Privilegios: ${role.privileges.map(p => defaultPrivileges.find(dp => dp.key === p)?.label || p).join(', ')}`
                    : 'Sin privilegios'}
                  sx={{ width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1, width: '100%', justifyContent: 'flex-end' }}>
                  <IconButton color="primary" onClick={() => handleOpen(idx)} size="small"><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(idx)} size="small"><DeleteIcon /></IconButton>
                </Box>
              </ListItem>
            </Paper>
          ))}
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef' }}>{editIndex !== null ? 'Editar rol' : 'Agregar rol'}</DialogTitle>
        <DialogContent sx={{ px: { xs: 1, sm: 3 }, py: { xs: 2, sm: 3 }, background: '#f8fafc' }}>
          <TextField
            label="Nombre del rol"
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            fullWidth
            sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Privilegios</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {defaultPrivileges.map(priv => (
              <Button
                key={priv.key}
                variant={privileges.includes(priv.key) ? 'contained' : 'outlined'}
                color={privileges.includes(priv.key) ? 'primary' : 'inherit'}
                onClick={() => handleTogglePrivilege(priv.key)}
                sx={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: { xs: 13, sm: 15 }, borderRadius: 2 }}
              >
                {priv.label}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: '#e0e7ef' }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#2d3a4a', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontWeight: 600 }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
