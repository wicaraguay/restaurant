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
  Tooltip,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';

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
          <CategoryIcon sx={{ mr: 1, fontSize: 32, color: '#1976d2' }} />
          Gestión de Categorías
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <TextField
            label="Buscar categoría"
            variant="outlined"
            value={''}
            onChange={() => {}}
            sx={{
              minWidth: 220,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon color="primary" />
                </InputAdornment>
              ),
            }}
            disabled
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              px: 3
            }}
            startIcon={<AddIcon />}
          >
            Nueva categoría
          </Button>
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          '@media (max-width:600px)': {
            gridTemplateColumns: '1fr',
          },
          gap: { xs: 2, sm: 3 },
          width: '100%',
          mb: 2,
        }}>
          {categories.map((cat, idx) => (
            <Paper key={cat.name || cat} elevation={6} sx={{
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
              <CategoryIcon sx={{
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
                {cat.name || cat}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#607d8b',
                mb: 1,
                textAlign: 'center',
                fontSize: { xs: 13, sm: 14 }
              }}>
                {cat.subcategories && cat.subcategories.length > 0
                  ? `Subcategorías: ${cat.subcategories.join(', ')}`
                  : 'Sin subcategorías'}
              </Typography>
              <Box sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                display: 'flex',
                gap: 1
              }}>
                <Tooltip title="Editar">
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
                </Tooltip>
                <Tooltip title="Eliminar">
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
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef', borderBottom: '1px solid #cfd8dc' }}>{editIndex !== null ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320, background: '#f8fafc' }}>
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
        <DialogActions sx={{ background: '#e0e7ef', borderTop: '1px solid #cfd8dc' }}>
          <Button onClick={() => setOpen(false)} startIcon={<CancelIcon />} sx={{ color: '#2d3a4a', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" startIcon={<SaveIcon />} sx={{ fontWeight: 600 }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );}
