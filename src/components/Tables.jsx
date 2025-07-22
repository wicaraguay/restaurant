import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'number', headerName: 'Mesa', width: 130 },
  { field: 'status', headerName: 'Estado', width: 130 },
];

const rows = [
  { id: 1, number: '1', status: 'Libre' },
  { id: 2, number: '2', status: 'Ocupada' },
];

export default function Tables() {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <h2>Gestión de Mesas</h2>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}
