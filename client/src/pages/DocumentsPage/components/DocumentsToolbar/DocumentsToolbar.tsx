import React from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { FILTERS, TFilterKey } from '../../utils';
import {
  documentsToolbarFilterChipSx,
  documentsToolbarFilterScrollerSx,
  documentsToolbarFilterStackSx,
  documentsToolbarRootSx,
} from './styles';

interface IDocumentsToolbarProps {
  activeFilter: TFilterKey;
  onFilterChange: (filter: TFilterKey) => void;
}

export const DocumentsToolbar: React.FC<IDocumentsToolbarProps> = ({ activeFilter, onFilterChange }) => (
  <Box sx={documentsToolbarRootSx}>
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
