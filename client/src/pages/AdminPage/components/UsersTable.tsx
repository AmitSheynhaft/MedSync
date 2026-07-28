import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  IconButton, Chip, Typography, Tooltip, Box,
  TextField, InputAdornment, Stack, Paper, Button, MenuItem,
  Select, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import EditIcon      from '@mui/icons-material/Edit';
import DeleteIcon    from '@mui/icons-material/Delete';
import SearchIcon    from '@mui/icons-material/Search';
import ClearIcon     from '@mui/icons-material/Clear';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { User, UpdateUserInput, CreateUserInput } from '../../../api/users';
import { TablePaper } from '../styled';
import UserFormDialog from './UserFormDialog';
import { GENDER_LABELS, ROLE_CHIP, ROLE_LABELS } from './adminUser.constants';

interface Props {
  users: User[];
  roles: { id: string; name: string }[];
  clinics: { id: string; name: string }[];
  onCreate: (input: CreateUserInput) => Promise<void>;
  onUpdate: (id: string, input: UpdateUserInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const UsersTable: React.FC<Props> = ({ users, roles, clinics, onCreate, onUpdate, onDelete }) => {
  const [editing, setEditing]   = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [page, setPage]         = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    const matchesSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q);
    const matchesRole = roleFilter.length === 0 || roleFilter.includes(u.role?.name ?? '');
    return matchesSearch && matchesRole;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };
  const handleRoleChange = (v: string[]) => { setRoleFilter(v); setPage(0); };

  return (
    <>
      <Paper elevation={0} sx={{ mb: 2, px: 2, py: 1.5, border: '1px solid #e9ecef', borderRadius: 2, bgcolor: '#fff' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <TextField
            placeholder="חיפוש לפי שם, אימייל או טלפון..."
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

          <FormControl size="small" sx={{
            width: 190,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2, bgcolor: '#f8f9fa',
              '& fieldset': { borderColor: roleFilter.length > 0 ? '#3b5bdb' : '#dee2e6' },
              '&:hover fieldset': { borderColor: '#adb5bd' },
              '&.Mui-focused fieldset': { borderColor: '#3b5bdb' },
            },
            '& .MuiInputLabel-root': { fontSize: 13 },
          }}>
            <InputLabel>תפקיד</InputLabel>
            <Select
              multiple
              value={roleFilter}
              onChange={(e) => handleRoleChange(e.target.value as string[])}
              input={<OutlinedInput label="תפקיד" />}
              renderValue={(selected) => {
                const arr = selected as unknown as string[];
                if (arr.length === 0) return <Typography sx={{ fontSize: 13, color: '#868e96' }}>הכל</Typography>;
                return (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {arr.map((s) => (
                      <Chip
                        key={s}
                        label={ROLE_LABELS[s] ?? s}
                        size="small"
                        sx={{ height: 18, fontSize: 11, fontWeight: 700, '& .MuiChip-label': { px: 0.75 }, bgcolor: ROLE_CHIP[s]?.bg, color: ROLE_CHIP[s]?.fg }}
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      mt: 0.5,
                      '& .MuiMenuItem-root': {
                        borderRadius: 1,
                        mx: 0.5,
                        my: 0.25,
                        px: 1,
                        fontSize: 13,
                        '&.Mui-selected': { bgcolor: '#eef2ff' },
                        '&.Mui-selected:hover': { bgcolor: '#e0e7ff' },
                      },
                    },
                  },
                },
              }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.name}>
                  <Checkbox
                    size="small"
                    checked={roleFilter.includes(r.name)}
                    sx={{
                      p: 0.5, mr: 0.5,
                      color: '#adb5bd',
                      '&.Mui-checked': { color: '#3b5bdb' },
                    }}
                  />
                  <Box
                    sx={{
                      width: 8, height: 8, borderRadius: '50%', mr: 1, flexShrink: 0,
                      bgcolor: r.name === 'admin' ? '#fa5252' : r.name === 'doctor' ? '#7048e8' : r.name === 'secretary' ? '#3b5bdb' : '#40c057',
                    }}
                  />
                  <ListItemText
                    primary={ROLE_LABELS[r.name] ?? r.name}
                    slotProps={{ primary: { style: { fontSize: 13, fontWeight: roleFilter.includes(r.name) ? 600 : 400 } } }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#f1f3f5', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{filtered.length}</Typography>
            <Typography sx={{ fontSize: 13, color: '#868e96' }}>/ {users.length}</Typography>
          </Box>

          <Button
            variant="contained" size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreating(true)}
            sx={{ borderRadius: 2, fontWeight: 600, px: 2, whiteSpace: 'nowrap' }}
          >
            משתמש חדש
          </Button>
        </Stack>
      </Paper>

      <TablePaper>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                {['שם מלא', 'אימייל', 'תפקיד', 'טלפון', 'תאריך לידה', 'מגדר'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#495057', fontSize: 13 }}>{h}</TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, color: '#495057', fontSize: 13 }} align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ textAlign: 'center', color: '#868e96', py: 3, fontSize: 14 }}>
                      {search || roleFilter.length > 0 ? 'לא נמצאו משתמשים תואמים' : 'אין משתמשים'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{user.fullName}</TableCell>
                  <TableCell sx={{ color: '#495057' }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[user.role?.name ?? ''] ?? (user.role?.name ?? '—')}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: 11, bgcolor: ROLE_CHIP[user.role?.name ?? '']?.bg, color: ROLE_CHIP[user.role?.name ?? '']?.fg }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#495057' }}>{user.phone ?? '—'}</TableCell>
                  <TableCell sx={{ color: '#495057' }}>
                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString('he-IL') : '—'}
                  </TableCell>
                  <TableCell sx={{ color: '#495057' }}>{user.gender ? (GENDER_LABELS[user.gender] ?? user.gender) : '—'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="עריכה">
                      <IconButton size="small" onClick={() => setEditing(user)} sx={{ color: '#495057' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחיקה">
                      <IconButton size="small" color="error" onClick={() => setConfirmDeleteId(user.id)}>
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
          <Typography sx={{ pt: 1 }}>האם למחוק את המשתמש? פעולה זו אינה ניתנת לשחזור.</Typography>
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
        <UserFormDialog open mode="edit" user={editing} roles={roles} clinics={clinics}
          onClose={() => setEditing(null)}
          onSave={async (input) => { await onUpdate(editing.id, input); setEditing(null); }}
        />
      )}
      <UserFormDialog open={creating} mode="create" roles={roles} clinics={clinics}
        onClose={() => setCreating(false)}
        onSave={async (input) => { await onCreate(input); setCreating(false); }}
      />
    </>
  );
};

export default UsersTable;
