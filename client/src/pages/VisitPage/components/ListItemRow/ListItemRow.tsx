import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  listItemRowCloseIconSx,
  listItemRowPrimarySx,
  listItemRowRemoveButtonSx,
  listItemRowRootSx,
  listItemRowSecondarySx,
} from './styles';

interface IListItemRowProps {
  primaryText: string;
  primaryColor: string;
  secondaryText: string;
  isReadOnly: boolean;
  onRemove: () => void;
}

export const ListItemRow: React.FC<IListItemRowProps> = ({
  primaryText, primaryColor, secondaryText, isReadOnly, onRemove,
}) => (
  <Box sx={listItemRowRootSx}>
    <Typography sx={listItemRowPrimarySx(primaryColor)}>{primaryText}</Typography>
    <Typography sx={listItemRowSecondarySx}>{secondaryText}</Typography>
    {!isReadOnly && (
      <Button size="small" onClick={onRemove} sx={listItemRowRemoveButtonSx}>
        <CloseIcon sx={listItemRowCloseIconSx} />
      </Button>
    )}
  </Box>
);

export default ListItemRow;
