import React, { useState } from 'react';
// import CategoryManager from './CategoryManager';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const initialMenuByDay = {
  lunes: [
    {
      id: 1,
      name: 'Pollo a la brasa',
      category: 'Plato principal',
      price: 12.5,
      description: 'Pollo jugoso acompañado de papas y ensalada.',
      photo: '',
      active: true,
      special: true,
      history: [
        { date: '2025-07-01', action: 'Creado' },
        { date: '2025-07-10', action: 'Actualizado' }
      ]
    }
  ],
  martes: [
    {
      id: 2,
      name: 'Ceviche mixto',
      category: 'Entrada',
      price: 8.0,
      description: 'Pescado y mariscos frescos en jugo de limón.',
      photo: '',
      active: true,
      special: false,
      history: [
        { date: '2025-07-02', action: 'Creado' }
      ]
    }
  ],
  miercoles: [],
  jueves: [],
  viernes: [],
  sabado: [],
  domingo: []
};

const defaultCategories = [
  { name: 'Entrada', subcategories: ['Fría', 'Caliente'] },
  { name: 'Plato principal', subcategories: ['Carne', 'Pollo', 'Vegetariano'] },
  { name: 'Bebida', subcategories: ['Fría', 'Caliente'] },
  { name: 'Postre', subcategories: [] }
];

export default function Menu({ categories, setCategories, menuByDay, setMenuByDay, selectedDay, setSelectedDay, currency }) {
  // Edición y eliminación de categorías ahora se gestiona en CategoryManager
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  // Día seleccionado
  // const [selectedDay, setSelectedDay] = useState('lunes');

  // Guardar menú por días en localStorage cada vez que cambian
  React.useEffect(() => {
    localStorage.setItem('menuByDay', JSON.stringify(menuByDay));
  }, [menuByDay]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', subcategory: '', price: '', description: '', photo: '', active: true, special: false });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Filtrado y búsqueda por día
  const filtered = menuByDay[selectedDay].filter(item => {
    const term = search.trim().toLowerCase();
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (subcategoryFilter && item.subcategory !== subcategoryFilter) return false;
    if (!term) return true;
    return (
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.subcategory ? item.subcategory.toLowerCase().includes(term) : false) ||
      item.description.toLowerCase().includes(term)
    );
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Abrir modal para agregar/editar
  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setForm({
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || '',
        price: item.price,
        description: item.description,
        photo: item.photo || '',
        active: item.active,
        special: item.special || false
      });
      setHistoryData(item.history || []);
    } else {
      setEditId(null);
      setForm({ name: '', category: '', subcategory: '', price: '', description: '', photo: '', active: true, special: false });
      setHistoryData([]);
    }
    setErrors({});
    setOpen(true);
  };

  // Guardar platillo por día
  const handleSave = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.category) newErrors.category = 'La categoría es obligatoria';
    if (!form.subcategory) newErrors.subcategory = 'La subcategoría es obligatoria';
    if (!form.price || isNaN(form.price)) {
      newErrors.price = 'El precio es obligatorio y debe ser numérico';
    } else if (Number(form.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor que cero';
    } else if (Number(form.price) > 9999) {
      newErrors.price = 'El precio no debe exceder 9999';
    }
    if (!form.description.trim()) newErrors.description = 'La descripción es obligatoria';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setMenuByDay(prev => {
      const platillos = prev[selectedDay] || [];
      if (editId) {
        return {
          ...prev,
          [selectedDay]: platillos.map(item =>
            item.id === editId
              ? { ...item, ...form, history: [...(item.history || []), { date: new Date().toISOString().slice(0, 10), action: 'Actualizado' }] }
              : item
          )
        };
      } else {
        return {
          ...prev,
          [selectedDay]: [
            ...platillos,
            { ...form, id: crypto.randomUUID(), history: [{ date: new Date().toISOString().slice(0, 10), action: 'Creado' }] }
          ]
        };
      }
    });
    setOpen(false);
  };

  // Eliminar platillo con confirmación por día
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteRequest = id => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setMenuByDay(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter(item => item.id !== deleteId)
    }));
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Menú del Restaurante', 14, 16);
    autoTable(doc, {
      head: [['Nombre', 'Categoría', 'Precio', 'Descripción', 'Disponible', 'Especial']],
      body: menu.map(item => [
        item.name,
        item.category,
        item.price,
        item.description,
        item.active ? 'Sí' : 'No',
        item.special ? 'Sí' : 'No'
      ])
    });
    doc.save('menu.pdf');
  };

  // Exportar menú a Excel (CSV) del día
  const handleExportCSV = () => {
    const csvRows = [
      ['Nombre', 'Categoría', 'Precio', 'Descripción', 'Disponible', 'Especial'],
      ...menuByDay[selectedDay].map(item => [
        item.name,
        item.category,
        item.price,
        item.description,
        item.active ? 'Sí' : 'No',
        item.special ? 'Sí' : 'No'
      ])
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu_${selectedDay}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cambiar estado activo/inactivo por día
  const handleToggleActive = id => {
    setMenuByDay(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(item =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    }));
  };

  // Cambiar especial por día
  const handleToggleSpecial = id => {
    setMenuByDay(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(item =>
        item.id === id ? { ...item, special: !item.special } : item
      )
    }));
  };

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

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', fontFamily: 'Montserrat, Arial, sans-serif', p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#2d3a4a', letterSpacing: 1 }}>Gestión de Menú</Typography>
      {/* CategoryManager removed: now managed via navigation, not inside Menu */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 160, background: '#fff', borderRadius: 2 }}>
          <InputLabel id="day-label">Día</InputLabel>
          <Select
            labelId="day-label"
            value={selectedDay}
            label="Día"
            onChange={e => { setSelectedDay(e.target.value); setPage(1); }}
          >
            {Object.keys(menuByDay).map(day => (
              <MenuItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Buscar platillo"
          variant="outlined"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          sx={{ minWidth: 220, background: '#fff', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        />
        <FormControl sx={{ minWidth: 160, background: '#fff', borderRadius: 2 }}>
          <InputLabel id="cat-label">Categoría</InputLabel>
          <Select
            labelId="cat-label"
            value={categoryFilter}
            label="Categoría"
            onChange={e => { setCategoryFilter(e.target.value); setSubcategoryFilter(''); setPage(1); }}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160, background: '#fff', borderRadius: 2 }}>
          <InputLabel id="subcat-label">Subcategoría</InputLabel>
          <Select
            labelId="subcat-label"
            value={subcategoryFilter}
            label="Subcategoría"
            onChange={e => { setSubcategoryFilter(e.target.value); setPage(1); }}
            disabled={!categoryFilter}
          >
            <MenuItem value="">Todas</MenuItem>
            {categoryFilter && categories.find(c => c.name === categoryFilter)?.subcategories.map(sub => (
              <MenuItem key={sub} value={sub}>{sub}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', px: 3 }}>
          <AddIcon sx={{ mr: 1 }} />
          Agregar platillo
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleExportPDF} sx={{ fontWeight: 600, borderRadius: 2, px: 2 }}>
          <PictureAsPdfIcon sx={{ mr: 1 }} />
          Exportar PDF
        </Button>
        <Button variant="outlined" color="success" onClick={handleExportCSV} sx={{ fontWeight: 600, borderRadius: 2, px: 2 }}>
          <FileDownloadIcon sx={{ mr: 1 }} />
          Exportar Excel
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
      {/* Tarjetas de platillos */}
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
        {paginated.map(item => (
          <Paper key={item.id} elevation={3} sx={{
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
              src={item.photo}
              alt={item.name}
              sx={{ width: 64, height: 64, mb: 2, bgcolor: '#e0e7ef', fontWeight: 700, fontSize: 28 }}
            >
              {!item.photo && item.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3a4a', mb: 1 }}>{item.name}</Typography>
            <Typography variant="body2" sx={{ color: '#607d8b', mb: 1 }}>{item.category}</Typography>
            <Typography variant="body2" sx={{ color: '#607d8b', mb: 1 }}>$ {item.price}</Typography>
            <Typography variant="body2" sx={{ color: '#607d8b', mb: 2, textAlign: 'center' }}>{item.description}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Switch
                checked={item.active}
                onChange={() => handleToggleActive(item.id)}
                color="success"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, color: item.active ? '#388e3c' : '#d32f2f' }}>
                {item.active ? 'Disponible' : 'No disponible'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Switch
                checked={item.special}
                onChange={() => handleToggleSpecial(item.id)}
                color="warning"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, color: item.special ? '#fbc02d' : '#607d8b' }}>
                {item.special ? 'Especial' : 'Normal'}
              </Typography>
            </Box>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 2, mt: 'auto', pt: 2 }}>
              <IconButton color="primary" onClick={() => handleOpen(item)}>
                <EditIcon />
              </IconButton>
              <IconButton color="secondary" onClick={() => { setHistoryData(item.history || []); setHistoryOpen(true); }}>
                <span role="img" aria-label="Historial">🕑</span>
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteRequest(item.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
      {/* Modal agregar/editar platillo */}
      {/* Modal historial de cambios */}
      {/* Modal confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f', background: '#e0e7ef', borderBottom: '1px solid #cfd8dc' }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent sx={{ background: '#f8fafc' }}>
          <Typography>
            ¿Está seguro que desea eliminar este platillo? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ background: '#e0e7ef', borderTop: '1px solid #cfd8dc' }}>
          <Button onClick={handleDeleteCancel} sx={{ color: '#2d3a4a', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 600 }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef', borderBottom: '1px solid #cfd8dc' }}>Historial de cambios</DialogTitle>
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3a4a', background: '#e0e7ef', borderBottom: '1px solid #cfd8dc' }}>{editId ? 'Editar platillo' : 'Agregar platillo'}</DialogTitle>
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
          </Box>
          <TextField
            label="Nombre"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="cat-form-label">Categoría</InputLabel>
            <Select
              labelId="cat-form-label"
              value={form.category}
              label="Categoría"
              onChange={e => { setForm({ ...form, category: e.target.value, subcategory: '' }); }}
              required
              error={!!errors.category}
              sx={{ background: '#fff', borderRadius: 2 }}
            >
              {categories.map(cat => (
                <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
              ))}
            </Select>
            {errors.category && <Typography color="error" variant="caption">{errors.category}</Typography>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="subcat-form-label">Subcategoría</InputLabel>
            <Select
              labelId="subcat-form-label"
              value={form.subcategory}
              label="Subcategoría"
              onChange={e => setForm({ ...form, subcategory: e.target.value })}
              required
              error={!!errors.subcategory}
              sx={{ background: '#fff', borderRadius: 2 }}
              disabled={!form.category}
            >
              {form.category && categories.find(c => c.name === form.category)?.subcategories.map(sub => (
                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
              ))}
            </Select>
            {errors.subcategory && <Typography color="error" variant="caption">{errors.subcategory}</Typography>}
          </FormControl>
          <TextField
            label="Precio (USD)"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            required
            error={!!errors.price}
            helperText={errors.price}
            sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
            inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
          />
          <TextField
            label="Descripción"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
            error={!!errors.description}
            helperText={errors.description}
            sx={{ mb: 2, background: '#fff', borderRadius: 2 }}
            multiline
            minRows={2}
            maxRows={4}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Switch
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
              color="success"
            />
            <Typography sx={{ fontWeight: 500 }}>{form.active ? 'Disponible' : 'No disponible'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Switch
              checked={form.special}
              onChange={e => setForm({ ...form, special: e.target.checked })}
              color="warning"
            />
            <Typography sx={{ fontWeight: 500 }}>{form.special ? 'Especial' : 'Normal'}</Typography>
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
