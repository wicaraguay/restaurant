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
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#2d3a4a' }}>Gestión de Roles y Privilegios</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2 }}>Agregar rol</Button>
      <List>
        {roles.map((role, idx) => (
          <Paper key={role.name || role} sx={{ mb: 2, p: 2 }}>
            <ListItem>
              <ListItemText
                primary={role.name || role}
                secondary={role.privileges && role.privileges.length > 0
                  ? `Privilegios: ${role.privileges.map(p => defaultPrivileges.find(dp => dp.key === p)?.label || p).join(', ')}`
                  : 'Sin privilegios'}
              />
              <ListItemSecondaryAction>
                <IconButton color="primary" onClick={() => handleOpen(idx)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        ))}
      </List>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editIndex !== null ? 'Editar rol' : 'Agregar rol'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre del rol"
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Privilegios</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {defaultPrivileges.map(priv => (
              <Button
                key={priv.key}
                variant={privileges.includes(priv.key) ? 'contained' : 'outlined'}
                color={privileges.includes(priv.key) ? 'primary' : 'inherit'}
                onClick={() => handleTogglePrivilege(priv.key)}
                sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                {priv.label}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
