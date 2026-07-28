import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  infoGridItemSx,
  infoGridLabelSx,
  infoGridRootSx,
  infoGridValueSx,
} from './InfoGrid.styles';

export interface IInfoField {
  label: string;
  value?: string | number | null;
}

export interface IInfoGridProps {
  fields: IInfoField[];
}

export const InfoGrid: React.FC<IInfoGridProps> = ({ fields }) => (
  <Box sx={infoGridRootSx}>
    {fields.map((field) => (
      <Box key={field.label} sx={infoGridItemSx}>
        <Typography sx={infoGridLabelSx}>
          {field.label}
        </Typography>
        <Typography sx={infoGridValueSx}>
          {field.value ?? '—'}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default InfoGrid;
