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
  // Estado para el diálogo de edición/agregado
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [catName, setCatName] = useState('');
  const [subcategories, setSubcategories] = useState([]);

  // Abrir diálogo para agregar o editar
  const handleOpen = (idx = null) => {
    setEditIndex(idx);
    if (idx !== null) {
      setCatName(categories[idx].name || '');
      setSubcategories(categories[idx].subcategories || []);
    } else {
      setCatName('');
      setSubcategories([]);
    }
    setOpen(true);
  };

  // Guardar cambios
  const handleSave = () => {
    const newCategory = { name: catName, subcategories };
    let updated;
    if (editIndex !== null) {
      updated = categories.map((cat, i) => i === editIndex ? newCategory : cat);
    } else {
      updated = [...categories, newCategory];
    }
    setCategories(updated);
    setOpen(false);
    setEditIndex(null);
    setCatName('');
    setSubcategories([]);
  };

  // Eliminar categoría
  const handleDelete = idx => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  // Subcategorías
  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, '']);
  };
  const handleSubcategoryChange = (i, value) => {
    setSubcategories(subcategories.map((sub, idx) => idx === i ? value : sub));
  };
  const handleRemoveSubcategory = i => {
    setSubcategories(subcategories.filter((_, idx) => idx !== i));
  };

  // ...existing code...
  return (
    <Box sx={{
      width: '100%',
      maxWidth: { xs: '100%', sm: 500 },
      mx: 'auto',
      mt: { xs: 2, sm: 4 },
      px: { xs: 1, sm: 2 },
      boxSizing: 'border-box',
    }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#2d3a4a' }}>Gestión de Categorías</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2, width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }}>Agregar categoría</Button>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr' },
            gap: 2,
          }}
        >
          {categories.map((cat, idx) => (
            <Paper
              key={cat.name || cat}
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
                  primary={<Typography sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 18 } }}>{cat.name || cat}</Typography>}
                  secondary={cat.subcategories && cat.subcategories.length > 0
                    ? `Subcategorías: ${cat.subcategories.join(', ')}`
                    : 'Sin subcategorías'}
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
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef' }}>{editIndex !== null ? 'Editar categoría' : 'Agregar categoría'}</DialogTitle>
        <DialogContent sx={{ px: { xs: 1, sm: 3 }, py: { xs: 2, sm: 3 }, background: '#f8fafc' }}>
          <TextField
            label="Nombre de la categoría"
            value={catName}
            onChange={e => setCatName(e.target.value)}
            fullWidth
            sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Subcategorías</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {subcategories.map((subcat, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  value={subcat}
                  onChange={e => handleSubcategoryChange(i, e.target.value)}
                  size="small"
                  sx={{ flex: 1, background: '#fff', borderRadius: 2 }}
                />
                <IconButton color="error" onClick={() => handleRemoveSubcategory(i)} size="small"><DeleteIcon /></IconButton>
              </Box>
            ))}
            <Button variant="outlined" onClick={handleAddSubcategory} sx={{ mt: 1, fontWeight: 600 }}>Agregar subcategoría</Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: '#e0e7ef' }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#2d3a4a', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontWeight: 600 }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );}
