import React from 'react';
import { Box, Chip, InputAdornment, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FILTERS, TFilterKey } from '../../utils';
import {
  documentsToolbarFilterChipSx,
  documentsToolbarFilterScrollerSx,
  documentsToolbarFilterStackSx,
  documentsToolbarRootSx,
  documentsToolbarSearchFieldSx,
  documentsToolbarSearchIconSx,
} from './styles';

interface IDocumentsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeFilter: TFilterKey;
  onFilterChange: (filter: TFilterKey) => void;
}

export const DocumentsToolbar: React.FC<IDocumentsToolbarProps> = ({ query, onQueryChange, activeFilter, onFilterChange }) => (
  <Box sx={documentsToolbarRootSx}>
    <TextField
      value={query}
      onChange={e => onQueryChange(e.target.value)}
      placeholder="חיפוש לפי רופא או סוג..."
      sx={documentsToolbarSearchFieldSx}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={documentsToolbarSearchIconSx} />
            </InputAdornment>
          ),
        },
      }}
    />
    <Box sx={documentsToolbarFilterScrollerSx}>
      <Stack direction="row" sx={documentsToolbarFilterStackSx}>
        {FILTERS.map(filterOption => {
          const isActive = activeFilter === filterOption.key;
          return (
            <Chip
              key={filterOption.key}
              label={filterOption.label}
              onClick={() => onFilterChange(filterOption.key)}
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? 'primary' : 'default'}
              sx={documentsToolbarFilterChipSx(isActive)}
            />
          );
        })}
      </Stack>
    </Box>
  </Box>
);

export default DocumentsToolbar;
