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

export default function CategoryManager({ categories, setCategories }) {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editCat, setEditCat] = useState('');
  const [editSubs, setEditSubs] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [newSub, setNewSub] = useState('');
  const [subEditIndex, setSubEditIndex] = useState(null);
  const [subEditValue, setSubEditValue] = useState('');

  // Abrir modal para agregar categoría
  const handleOpen = (idx = null) => {
    if (idx !== null) {
      setEditIndex(idx);
      setEditCat(categories[idx].name);
      setEditSubs([...categories[idx].subcategories]);
    } else {
      setEditIndex(null);
      setEditCat('');
      setEditSubs([]);
    }
    setOpen(true);
  };

  // Guardar categoría
  const handleSave = () => {
    if (!editCat.trim()) return;
    if (editIndex !== null) {
      setCategories(prev => prev.map((cat, i) => i === editIndex ? { name: editCat.trim(), subcategories: editSubs } : cat));
    } else {
      setCategories(prev => [...prev, { name: editCat.trim(), subcategories: editSubs }]);
    }
    setOpen(false);
    setEditCat('');
    setEditSubs([]);
  };

  // Eliminar categoría
  const handleDelete = idx => {
    setCategories(prev => prev.filter((_, i) => i !== idx));
  };

  // Agregar subcategoría
  const handleAddSub = () => {
    if (newSub.trim() && !editSubs.includes(newSub.trim())) {
      setEditSubs(prev => [...prev, newSub.trim()]);
      setNewSub('');
    }
  };

  // Editar subcategoría
  const handleEditSub = idx => {
    setSubEditIndex(idx);
    setSubEditValue(editSubs[idx]);
  };

  const handleSaveSubEdit = () => {
    if (subEditValue.trim()) {
      setEditSubs(prev => prev.map((s, i) => i === subEditIndex ? subEditValue.trim() : s));
      setSubEditIndex(null);
      setSubEditValue('');
    }
  };

  const handleDeleteSub = idx => {
    setEditSubs(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#2d3a4a' }}>Gestión de Categorías y Subcategorías</Typography>
      {/* El precio se gestiona solo en dólares (USD) */}
      <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2 }}>Agregar categoría</Button>
      <List>
        {categories.map((cat, idx) => (
          <Paper key={cat.name} sx={{ mb: 2, p: 2 }}>
            <ListItem>
              <ListItemText
                primary={cat.name}
                secondary={cat.subcategories.length > 0 ? `Subcategorías: ${cat.subcategories.join(', ')}` : 'Sin subcategorías'}
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
        <DialogTitle>{editIndex !== null ? 'Editar categoría' : 'Agregar categoría'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre de la categoría"
            value={editCat}
            onChange={e => setEditCat(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Subcategorías</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Nueva subcategoría"
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" onClick={handleAddSub}>Agregar</Button>
          </Box>
          <List>
            {editSubs.map((sub, idx) => (
              <ListItem key={sub}>
                {subEditIndex === idx ? (
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <TextField value={subEditValue} onChange={e => setSubEditValue(e.target.value)} sx={{ flex: 1 }} />
                    <Button variant="contained" size="small" onClick={handleSaveSubEdit}>Guardar</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => { setSubEditIndex(null); setSubEditValue(''); }}>Cancelar</Button>
                  </Box>
                ) : (
                  <>
                    <ListItemText primary={sub} />
                    <ListItemSecondaryAction>
                      <IconButton color="primary" onClick={() => handleEditSub(idx)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteSub(idx)}><DeleteIcon /></IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
// ...existing code...
