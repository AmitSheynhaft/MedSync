export const usersTableToolbarPaperSx = {
  mb: 2,
  px: 2,
  py: 1.5,
  border: '1px solid #e9ecef',
  borderRadius: 2,
  bgcolor: '#fff',
};

export const usersTableToolbarStackSx = { alignItems: 'center' };

export const usersTableSearchFieldSx = {
  width: 320,
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#f8f9fa',
    '& fieldset': { borderColor: '#dee2e6' },
    '&:hover fieldset': { borderColor: '#adb5bd' },
    '&.Mui-focused fieldset': { borderColor: '#3b5bdb' },
  },
};

export const usersTableSearchIconSx = { color: '#868e96', fontSize: 18 };
export const usersTableClearIconSx = { fontSize: 16 };

export const usersTableRoleFilterSx = (hasFilter: boolean) => ({
  width: 190,
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#f8f9fa',
    '& fieldset': { borderColor: hasFilter ? '#3b5bdb' : '#dee2e6' },
    '&:hover fieldset': { borderColor: '#adb5bd' },
    '&.Mui-focused fieldset': { borderColor: '#3b5bdb' },
  },
  '& .MuiInputLabel-root': { fontSize: 13 },
});

export const usersTableRenderValueEmptySx = { fontSize: 13, color: '#868e96' };
export const usersTableSelectedRolesWrapSx = { display: 'flex', gap: 0.5, flexWrap: 'wrap' };

export const usersTableSelectedRoleChipSx = (bg?: string, fg?: string) => ({
  height: 18,
  fontSize: 11,
  fontWeight: 700,
  '& .MuiChip-label': { px: 0.75 },
  bgcolor: bg,
  color: fg,
});

export const usersTableRoleMenuPaperSx = {
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
};

export const usersTableRoleMenuCheckboxSx = {
  p: 0.5,
  mr: 0.5,
  color: '#adb5bd',
  '&.Mui-checked': { color: '#3b5bdb' },
};

export const usersTableRoleDotSx = (roleName: string) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  mr: 1,
  flexShrink: 0,
  bgcolor:
    roleName === 'admin'
      ? '#fa5252'
      : roleName === 'doctor'
        ? '#7048e8'
        : roleName === 'secretary'
          ? '#3b5bdb'
          : '#40c057',
});

export const usersTableRoleMenuPrimaryTextStyle = (selected: boolean) => ({
  fontSize: 13,
  fontWeight: selected ? 600 : 400,
});

export const usersTableSpacerSx = { flex: 1 };

export const usersTableCounterSx = {
  px: 1.5,
  py: 0.5,
  borderRadius: 2,
  bgcolor: '#f1f3f5',
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
};

export const usersTableCounterCurrentSx = { fontWeight: 700, fontSize: 14, color: '#1a1a2e' };
export const usersTableCounterTotalSx = { fontSize: 13, color: '#868e96' };

export const usersTableCreateButtonSx = {
  borderRadius: 2,
  fontWeight: 600,
  px: 2,
  whiteSpace: 'nowrap',
};

export const usersTableScrollableSx = { overflowX: 'auto' };
export const usersTableSx = { minWidth: 700 };
export const usersTableHeadRowSx = { bgcolor: '#f8f9fa' };
export const usersTableHeadCellSx = { fontWeight: 700, color: '#495057', fontSize: 13 };
export const usersTableEmptyTextSx = { textAlign: 'center', color: '#868e96', py: 3, fontSize: 14 };
export const usersTableBodyRowSx = { '&:last-child td': { borderBottom: 0 } };
export const usersTableNameCellSx = { fontWeight: 500 };
export const usersTableDefaultCellSx = { color: '#495057' };

export const usersTableRowRoleChipSx = (bg?: string, fg?: string) => ({
  fontWeight: 600,
  fontSize: 11,
  bgcolor: bg,
  color: fg,
});

export const usersTableEditButtonSx = { color: '#495057' };
export const usersTablePaginationSx = { borderTop: '1px solid #f1f3f5' };
export const usersTableDialogTextSx = { pt: 1 };
export const usersTableDialogActionsSx = { px: 3, pb: 2 };
