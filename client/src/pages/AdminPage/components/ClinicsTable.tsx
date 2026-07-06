import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  IconButton, Typography, Tooltip, Box,
  TextField, InputAdornment, Stack, Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import EditIcon    from '@mui/icons-material/Edit';
import DeleteIcon  from '@mui/icons-material/Delete';
import SearchIcon  from '@mui/icons-material/Search';
import ClearIcon   from '@mui/icons-material/Clear';
import { Clinic, ClinicInput } from '../../../api/clinics';
import { TablePaper } from '../styled';
import ClinicFormDialog from './ClinicFormDialog';

interface Props {
  clinics: Clinic[];
  onCreate: (input: ClinicInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<ClinicInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const ClinicsTable: React.FC<Props> = ({ clinics, onCreate, onUpdate, onDelete }) => {
  const [editing, setEditing]   = useState<Clinic | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [page, setPage]       = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clinics;
    return clinics.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.address ?? '').toLowerCase().includes(q),
    );
  }, [clinics, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };

  return (
    <>
      <Paper elevation={0} sx={{ mb: 2, px: 2, py: 1.5, border: '1px solid #e9ecef', borderRadius: 2, bgcolor: '#fff' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <TextField
            placeholder="חיפוש לפי שם או כתובת..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            size="small"
            sx={{
              width: 320,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2, bgcolor: '#f8f9fa',
                '& fieldset': { borderColor: '#dee2e6' },
                '&:hover fieldset': { borderColor: '#adb5bd' },
                '&.Mui-focused fieldset': { borderColor: '#3b5bdb' },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#868e96', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearchChange('')} edge="end">
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box sx={{ flex: 1 }} />

          <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#f1f3f5', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{filtered.length}</Typography>
            <Typography sx={{ fontSize: 13, color: '#868e96' }}>/ {clinics.length}</Typography>
          </Box>

          <Button
            variant="contained" size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreating(true)}
            sx={{ borderRadius: 2, fontWeight: 600, px: 2, whiteSpace: 'nowrap' }}
          >
            מרפאה חדשה
          </Button>
        </Stack>
      </Paper>

      <TablePaper>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                {['שם מרפאה', 'כתובת', 'תאריך יצירה'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#495057', fontSize: 13 }}>{h}</TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, color: '#495057', fontSize: 13 }} align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography sx={{ textAlign: 'center', color: '#868e96', py: 3, fontSize: 14 }}>
                      {search ? 'לא נמצאו מרפאות תואמות' : 'אין מרפאות'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((clinic) => (
                <TableRow key={clinic.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{clinic.name}</TableCell>
                  <TableCell sx={{ color: '#495057' }}>{clinic.address ?? '—'}</TableCell>
                  <TableCell sx={{ color: '#495057' }}>
                    {clinic.createdAt ? new Date(clinic.createdAt).toLocaleDateString('he-IL') : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="עריכה">
                      <IconButton size="small" onClick={() => setEditing(clinic)} sx={{ color: '#495057' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחיקה">
                      <IconButton size="small" color="error" onClick={() => setConfirmDeleteId(clinic.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          labelRowsPerPage="שורות לעמוד:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} מתוך ${count}`}
          sx={{ borderTop: '1px solid #f1f3f5' }}
        />
      </TablePaper>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs">
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography sx={{ pt: 1 }}>האם למחוק את המרפאה? פעולה זו אינה ניתנת לשחזור.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeleteId(null)}>ביטול</Button>
          <Button
            variant="contained" color="error"
            onClick={async () => { if (confirmDeleteId) await onDelete(confirmDeleteId); setConfirmDeleteId(null); }}
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {editing && (
        <ClinicFormDialog open clinic={editing}
          onClose={() => setEditing(null)}
          onSave={async (input) => { await onUpdate(editing.id, input); setEditing(null); }}
        />
      )}
      <ClinicFormDialog open={creating}
        onClose={() => setCreating(false)}
        onSave={async (input) => { await onCreate(input); setCreating(false); }}
      />
    </>
  );
};

export default ClinicsTable;
