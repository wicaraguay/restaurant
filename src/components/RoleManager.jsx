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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      p: { xs: 2, sm: 3, md: 4 },
      fontFamily: 'Montserrat, Arial, sans-serif',
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 700,
        mx: 'auto',
        background: 'transparent',
        borderRadius: 0,
        boxShadow: 'none',
        p: 0,
        m: 0,
      }}>
        <Typography variant="h4" sx={{
          mb: 4,
          fontWeight: 700,
          textAlign: 'center',
          color: '#2d3a4a',
          letterSpacing: 1,
        }}>
          <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 32, color: '#1976d2' }} />
          Gestión de Roles y Privilegios
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', px: 3 }} startIcon={<AddIcon />}>
            Nuevo rol
          </Button>
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: { xs: 2.5, sm: 3 },
          width: '100%',
          mb: 2,
        }}>
          {roles.map((role, idx) => (
            <Paper key={role.name || role} elevation={6} sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              background: `linear-gradient(135deg, #1976d220 60%, #fff 100%)`,
              boxShadow: '0 4px 24px 0 #1976d222',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 140,
              position: 'relative',
              transition: 'transform 0.18s, box-shadow 0.18s',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.035)',
                boxShadow: '0 8px 32px 0 #1976d244',
                borderColor: '#1976d2',
              },
            }}>
              <AdminPanelSettingsIcon sx={{
                fontSize: 38,
                color: '#1976d2',
                mb: 1,
                background: '#fff',
                borderRadius: '50%',
                boxShadow: `0 2px 8px #1976d233`,
                p: 1,
              }} />
              <Typography variant="h6" sx={{
                fontWeight: 800,
                color: '#2d3a4a',
                mb: 0.5,
                textAlign: 'center',
                fontSize: { xs: 17, sm: 19 }
              }}>
                {role.name || role}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#607d8b',
                mb: 1,
                textAlign: 'center',
                fontSize: { xs: 13, sm: 14 }
              }}>
                {role.privileges && role.privileges.length > 0
                  ? `Privilegios: ${role.privileges.map(p => defaultPrivileges.find(dp => dp.key === p)?.label || p).join(', ')}`
                  : 'Sin privilegios'}
              </Typography>
              <Box sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                display: 'flex',
                gap: 1
              }}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpen(idx)}
                  sx={{
                    bgcolor: '#e3f2fd',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px #1976d222',
                    '&:hover': { bgcolor: '#1976d2', color: '#fff' },
                    fontSize: 18,
                    p: 1
                  }}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(idx)}
                  sx={{
                    bgcolor: '#ffebee',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px #d8431544',
                    '&:hover': { bgcolor: '#d84315', color: '#fff' },
                    fontSize: 18,
                    p: 1
                  }}
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef', borderBottom: '1px solid #cfd8dc' }}>{editIndex !== null ? 'Editar rol' : 'Nuevo rol'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320, background: '#f8fafc' }}>
          <TextField
            label="Nombre del rol"
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            fullWidth
            sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Privilegios</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {defaultPrivileges.map(priv => {
              let icon = null;
              switch (priv.key) {
                case 'crud_empleados': icon = <GroupIcon sx={{ mr: 1 }} />; break;
                case 'crud_menu': icon = <RestaurantMenuIcon sx={{ mr: 1 }} />; break;
                case 'crud_mesas': icon = <TableRestaurantIcon sx={{ mr: 1 }} />; break;
                case 'ver_reportes': icon = <AssessmentIcon sx={{ mr: 1 }} />; break;
                case 'ver_pedidos': icon = <ReceiptLongIcon sx={{ mr: 1 }} />; break;
                case 'admin': icon = <AdminPanelSettingsIcon sx={{ mr: 1 }} />; break;
                default: break;
              }
              return (
                <Button
                  key={priv.key}
                  variant={privileges.includes(priv.key) ? 'contained' : 'outlined'}
                  color={privileges.includes(priv.key) ? 'primary' : 'inherit'}
                  onClick={() => handleTogglePrivilege(priv.key)}
                  sx={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: { xs: 13, sm: 15 }, borderRadius: 2 }}
                >
                  {icon}
                  {priv.label}
                </Button>
              );
            })}
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
    </Box>
  );
}
