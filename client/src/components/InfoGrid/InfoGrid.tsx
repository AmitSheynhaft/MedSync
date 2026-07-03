import React from 'react';
import { Box, Typography } from '@mui/material';

export interface IInfoField {
  label: string;
  value?: string | number | null;
}

export interface IInfoGridProps {
  fields: IInfoField[];
}

export const InfoGrid: React.FC<IInfoGridProps> = ({ fields }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
      gap: { xs: 1.5, sm: 2 },
      mb: { xs: 2.25, sm: 3 },
    }}
  >
    {fields.map((field) => (
      <Box
        key={field.label}
        sx={{
          bgcolor: '#fff',
          border: '1px solid #e1e6ee',
          borderRadius: 3,
          p: { xs: 1.6, sm: 2 },
          boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
        }}
      >
        <Typography sx={{ fontSize: 12, color: '#98a2b3', fontWeight: 600, mb: 0.35 }}>
          {field.label}
        </Typography>
        <Typography sx={{ fontSize: 15, color: '#1a1a2e', fontWeight: 700 }}>
          {field.value ?? '—'}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default InfoGrid;
