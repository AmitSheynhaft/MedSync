import React from 'react';
import { Box, Chip, InputAdornment, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FILTERS, TFilterKey } from '../utils';

interface IDocumentsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeFilter: TFilterKey;
  onFilterChange: (filter: TFilterKey) => void;
}

export const DocumentsToolbar: React.FC<IDocumentsToolbarProps> = ({ query, onQueryChange, activeFilter, onFilterChange }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5, flexWrap: 'wrap' }}>
    <TextField
      value={query}
      onChange={e => onQueryChange(e.target.value)}
      placeholder="חיפוש לפי רופא או סוג..."
      sx={{ flex: 1, minWidth: 200, maxWidth: 360, '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: '#fff' } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#adb5bd' }} />
            </InputAdornment>
          ),
        },
      }}
    />
    <Box
      sx={{
        width: { xs: '100%', sm: 'auto' },
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'nowrap', width: 'max-content', py: 0.25 }}>
      {FILTERS.map(filterOption => {
        const isActive = activeFilter === filterOption.key;
        return (
          <Chip
            key={filterOption.key}
            label={filterOption.label}
            onClick={() => onFilterChange(filterOption.key)}
            variant={isActive ? 'filled' : 'outlined'}
            color={isActive ? 'primary' : 'default'}
            sx={{ borderRadius: 999, fontWeight: 600, fontSize: 13, px: 1.5, height: 38, bgcolor: isActive ? undefined : '#fff', flexShrink: 0 }}
          />
        );
      })}
      </Stack>
    </Box>
  </Box>
);

export default DocumentsToolbar;
