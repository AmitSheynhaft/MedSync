import React, { useState } from 'react';
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
import {
  clinicsBodyRowSx,
  clinicsCounterCurrentSx,
  clinicsCounterSx,
  clinicsCounterTotalSx,
  clinicsCreateButtonSx,
  clinicsDefaultCellSx,
  clinicsDialogActionsSx,
  clinicsDialogTextSx,
  clinicsEditButtonSx,
  clinicsEmptyTextSx,
  clinicsHeadCellSx,
  clinicsHeadRowSx,
  clinicsNameCellSx,
  clinicsPaginationSx,
  clinicsSearchFieldSx,
  clinicsSearchIconSx,
  clinicsSpacerSx,
  clinicsTableSx,
  clinicsTableWrapSx,
  clinicsToolbarPaperSx,
  clinicsToolbarStackSx,
  clinicsClearIconSx,
} from './ClinicsTable.styles';

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

  const q = search.trim().toLowerCase();
  const filtered = !q
    ? clinics
    : clinics.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.address ?? '').toLowerCase().includes(q),
      );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };

  return (
    <>
      <Paper elevation={0} sx={clinicsToolbarPaperSx}>
        <Stack direction="row" spacing={1.5} sx={clinicsToolbarStackSx}>
          <TextField
            placeholder="חיפוש לפי שם או כתובת..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            size="small"
            sx={clinicsSearchFieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={clinicsSearchIconSx} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearchChange('')} edge="end">
                      <ClearIcon sx={clinicsClearIconSx} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box sx={clinicsSpacerSx} />

          <Box sx={clinicsCounterSx}>
            <Typography sx={clinicsCounterCurrentSx}>{filtered.length}</Typography>
            <Typography sx={clinicsCounterTotalSx}>/ {clinics.length}</Typography>
          </Box>

          <Button
            variant="contained" size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreating(true)}
            sx={clinicsCreateButtonSx}
          >
            מרפאה חדשה
          </Button>
        </Stack>
      </Paper>

      <TablePaper>
        <Box sx={clinicsTableWrapSx}>
          <Table size="small" sx={clinicsTableSx}>
            <TableHead>
              <TableRow sx={clinicsHeadRowSx}>
                {['שם מרפאה', 'כתובת', 'תאריך יצירה'].map((h) => (
                  <TableCell key={h} sx={clinicsHeadCellSx}>{h}</TableCell>
                ))}
                <TableCell sx={clinicsHeadCellSx} align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography sx={clinicsEmptyTextSx}>
                      {search ? 'לא נמצאו מרפאות תואמות' : 'אין מרפאות'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((clinic) => (
                <TableRow key={clinic.id} hover sx={clinicsBodyRowSx}>
                  <TableCell sx={clinicsNameCellSx}>{clinic.name}</TableCell>
                  <TableCell sx={clinicsDefaultCellSx}>{clinic.address ?? '—'}</TableCell>
                  <TableCell sx={clinicsDefaultCellSx}>
                    {clinic.createdAt ? new Date(clinic.createdAt).toLocaleDateString('he-IL') : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="עריכה">
                      <IconButton size="small" onClick={() => setEditing(clinic)} sx={clinicsEditButtonSx}>
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
          sx={clinicsPaginationSx}
        />
      </TablePaper>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs">
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography sx={clinicsDialogTextSx}>האם למחוק את המרפאה? פעולה זו אינה ניתנת לשחזור.</Typography>
        </DialogContent>
        <DialogActions sx={clinicsDialogActionsSx}>
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
