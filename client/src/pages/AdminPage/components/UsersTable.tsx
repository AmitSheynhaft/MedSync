import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  IconButton, Chip, Typography, Tooltip, Box,
  TextField, InputAdornment, Stack, Paper, Button, MenuItem,
  Select, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import EditIcon      from '@mui/icons-material/Edit';
import DeleteIcon    from '@mui/icons-material/Delete';
import SearchIcon    from '@mui/icons-material/Search';
import ClearIcon     from '@mui/icons-material/Clear';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { UpdateUserInput, CreateUserInput } from '../../../api/users';
import { IAdminUserListItem, IAdminUserDetail, getAdminUserById } from '../../../api/admin/users';
import { TablePaper } from '../styled';
import UserFormDialog from './UserFormDialog';
import { GENDER_LABELS, ROLE_CHIP, ROLE_LABELS } from './adminUser.constants';
import {
  usersTableBodyRowSx,
  usersTableCounterCurrentSx,
  usersTableCounterSx,
  usersTableCounterTotalSx,
  usersTableCreateButtonSx,
  usersTableDefaultCellSx,
  usersTableDialogActionsSx,
  usersTableDialogTextSx,
  usersTableEditButtonSx,
  usersTableEmptyTextSx,
  usersTableHeadCellSx,
  usersTableHeadRowSx,
  usersTableNameCellSx,
  usersTablePaginationSx,
  usersTableRenderValueEmptySx,
  usersTableRoleDotSx,
  usersTableRoleFilterSx,
  usersTableRoleMenuCheckboxSx,
  usersTableRoleMenuPaperSx,
  usersTableRoleMenuPrimaryTextStyle,
  usersTableRowRoleChipSx,
  usersTableSearchFieldSx,
  usersTableSearchIconSx,
  usersTableSelectedRoleChipSx,
  usersTableSelectedRolesWrapSx,
  usersTableSpacerSx,
  usersTableSx,
  usersTableToolbarPaperSx,
  usersTableToolbarStackSx,
  usersTableScrollableSx,
  usersTableClearIconSx,
} from './UsersTable.styles';

interface Props {
  users: IAdminUserListItem[];
  roles: { id: string; name: string }[];
  clinics: { id: string; name: string }[];
  onCreate: (input: CreateUserInput) => Promise<void>;
  onUpdate: (id: string, input: UpdateUserInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const UsersTable: React.FC<Props> = ({ users, roles, clinics, onCreate, onUpdate, onDelete }) => {
  const [editing, setEditing]   = useState<IAdminUserDetail | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
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
      <Paper elevation={0} sx={usersTableToolbarPaperSx}>
        <Stack direction="row" spacing={1.5} sx={usersTableToolbarStackSx}>
          <TextField
            placeholder="חיפוש לפי שם, אימייל או טלפון..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            size="small"
            sx={usersTableSearchFieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={usersTableSearchIconSx} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearchChange('')} edge="end">
                      <ClearIcon sx={usersTableClearIconSx} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <FormControl size="small" sx={usersTableRoleFilterSx(roleFilter.length > 0)}>
            <InputLabel>תפקיד</InputLabel>
            <Select
              multiple
              value={roleFilter}
              onChange={(e) => handleRoleChange(e.target.value as string[])}
              input={<OutlinedInput label="תפקיד" />}
              renderValue={(selected) => {
                const arr = selected as unknown as string[];
                if (arr.length === 0) return <Typography sx={usersTableRenderValueEmptySx}>הכל</Typography>;
                return (
                  <Box sx={usersTableSelectedRolesWrapSx}>
                    {arr.map((s) => (
                      <Chip
                        key={s}
                        label={ROLE_LABELS[s] ?? s}
                        size="small"
                        sx={usersTableSelectedRoleChipSx(ROLE_CHIP[s]?.bg, ROLE_CHIP[s]?.fg)}
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: usersTableRoleMenuPaperSx,
                  },
                },
              }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.name}>
                  <Checkbox
                    size="small"
                    checked={roleFilter.includes(r.name)}
                    sx={usersTableRoleMenuCheckboxSx}
                  />
                  <Box
                    sx={usersTableRoleDotSx(r.name)}
                  />
                  <ListItemText
                    primary={ROLE_LABELS[r.name] ?? r.name}
                    slotProps={{ primary: { style: usersTableRoleMenuPrimaryTextStyle(roleFilter.includes(r.name)) } }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={usersTableSpacerSx} />

          <Box sx={usersTableCounterSx}>
            <Typography sx={usersTableCounterCurrentSx}>{filtered.length}</Typography>
            <Typography sx={usersTableCounterTotalSx}>/ {users.length}</Typography>
          </Box>

          <Button
            variant="contained" size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreating(true)}
            sx={usersTableCreateButtonSx}
          >
            משתמש חדש
          </Button>
        </Stack>
      </Paper>

      <TablePaper>
        <Box sx={usersTableScrollableSx}>
          <Table size="small" sx={usersTableSx}>
            <TableHead>
              <TableRow sx={usersTableHeadRowSx}>
                {['שם מלא', 'אימייל', 'תפקיד', 'טלפון', 'תאריך לידה', 'מגדר'].map((h) => (
                  <TableCell key={h} sx={usersTableHeadCellSx}>{h}</TableCell>
                ))}
                <TableCell sx={usersTableHeadCellSx} align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={usersTableEmptyTextSx}>
                      {search || roleFilter.length > 0 ? 'לא נמצאו משתמשים תואמים' : 'אין משתמשים'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((user) => (
                <TableRow key={user.id} hover sx={usersTableBodyRowSx}>
                  <TableCell sx={usersTableNameCellSx}>{user.fullName}</TableCell>
                  <TableCell sx={usersTableDefaultCellSx}>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[user.role?.name ?? ''] ?? (user.role?.name ?? '—')}
                      size="small"
                      sx={usersTableRowRoleChipSx(ROLE_CHIP[user.role?.name ?? '']?.bg, ROLE_CHIP[user.role?.name ?? '']?.fg)}
                    />
                  </TableCell>
                  <TableCell sx={usersTableDefaultCellSx}>{user.phone ?? '—'}</TableCell>
                  <TableCell sx={usersTableDefaultCellSx}>
                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString('he-IL') : '—'}
                  </TableCell>
                  <TableCell sx={usersTableDefaultCellSx}>{user.gender ? (GENDER_LABELS[user.gender] ?? user.gender) : '—'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="עריכה">
                      <span>
                        <IconButton
                          size="small"
                          disabled={loadingEditId === user.id}
                          onClick={async () => {
                            setLoadingEditId(user.id);
                            try {
                              const detail = await getAdminUserById(user.id);
                              setEditing(detail);
                            } finally {
                              setLoadingEditId(null);
                            }
                          }}
                          sx={usersTableEditButtonSx}
                        >
                          {loadingEditId === user.id
                            ? <CircularProgress size={16} />
                            : <EditIcon fontSize="small" />}
                        </IconButton>
                      </span>
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
          sx={usersTablePaginationSx}
        />
      </TablePaper>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs">
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography sx={usersTableDialogTextSx}>האם למחוק את המשתמש? פעולה זו אינה ניתנת לשחזור.</Typography>
        </DialogContent>
        <DialogActions sx={usersTableDialogActionsSx}>
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
