import React from 'react';
import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { ListItemRow } from '../ListItemRow/ListItemRow';
import { RTL_TEXT_DIRECTION, MedicineItem } from '../../constants';
import type { Medicine } from '../../../../api/medicines';
import {
  medicinesSectionAddButtonSx,
  medicinesSectionFieldsGridSx,
  medicinesSectionFormSx,
  medicinesSectionIconSx,
  medicinesSectionListSx,
  medicinesSectionOptionSx,
} from './styles';

interface IMedicinesSectionProps {
  isReadOnly: boolean;
  medicinesList: MedicineItem[];
  medicineOptions: Medicine[];
  medicineSearch: string;
  setMedicineSearch: (value: string) => void;
  medicineDosage: string;
  setMedicineDosage: (value: string) => void;
  medicineFrequency: string;
  setMedicineFrequency: (value: string) => void;
  medicineDuration: string;
  setMedicineDuration: (value: string) => void;
  handleAddMedicine: () => void;
  removeMedicine: (index: number) => void;
  medicineError?: string;
}

export const MedicinesSection: React.FC<IMedicinesSectionProps> = ({
  isReadOnly, medicinesList, medicineOptions, medicineSearch, setMedicineSearch,
  medicineDosage, setMedicineDosage, medicineFrequency, setMedicineFrequency,
  medicineDuration, setMedicineDuration, handleAddMedicine, removeMedicine, medicineError,
}) => (
  <>
    <SectionHeader icon={<MedicationIcon sx={medicinesSectionIconSx} />} label="תרופות" color="#e8590c" bg="#fff3e6" />
    <Stack sx={medicinesSectionListSx}>
      {medicinesList.map((medicine, index) => (
        <ListItemRow
          key={`${medicine.name}|${medicine.dosage}|${medicine.frequency}|${medicine.duration}`}
          primaryText={medicine.name}
          primaryColor="#e8590c"
          secondaryText={`${medicine.dosage} · ${medicine.frequency} · ${medicine.duration}`}
          isReadOnly={isReadOnly}
          onRemove={() => removeMedicine(index)}
        />
      ))}
    </Stack>
    {!isReadOnly && (
      <Stack sx={medicinesSectionFormSx}>
        <Autocomplete
          size="small"
          options={medicineOptions}
          getOptionLabel={option => option.name}
          filterOptions={options => options}
          inputValue={medicineSearch}
          onInputChange={(_, value, reason) => { if (reason !== 'reset') setMedicineSearch(value); }}
          onChange={(_, selectedOption) => {
            if (!selectedOption) return;
            setMedicineSearch(selectedOption.name);
          }}
          renderInput={params => (
            <TextField {...params} placeholder="חפש שם תרופה..."
              slotProps={{ ...params.slotProps, htmlInput: { ...(params.slotProps?.htmlInput as object), ...RTL_TEXT_DIRECTION } }} />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={medicinesSectionOptionSx}>
              <Typography variant="body2">{option.name}</Typography>
            </Box>
          )}
          noOptionsText="לא נמצאו תרופות"
          slotProps={{ popper: { placement: 'bottom-start', modifiers: [{ name: 'flip', enabled: false }] } }}
        />
        <Box sx={medicinesSectionFieldsGridSx}>
          <TextField size="small" placeholder="מינון (100mg)" value={medicineDosage}
            onChange={e => setMedicineDosage(e.target.value)} slotProps={{ htmlInput: RTL_TEXT_DIRECTION }} />
          <TextField size="small" placeholder="תדירות (פעם ביום)" value={medicineFrequency}
            onChange={e => setMedicineFrequency(e.target.value)} slotProps={{ htmlInput: RTL_TEXT_DIRECTION }} />
          <TextField size="small" placeholder="משך טיפול (7 ימים)" value={medicineDuration}
            onChange={e => setMedicineDuration(e.target.value)} slotProps={{ htmlInput: RTL_TEXT_DIRECTION }} />
        </Box>
        <Button variant="outlined" size="small" onClick={handleAddMedicine} sx={medicinesSectionAddButtonSx}>
          הוסף תרופה
        </Button>
        {medicineError && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, textAlign: 'right' }}>
            {medicineError}
          </Typography>
        )}
      </Stack>
    )}
  </>
);

export default MedicinesSection;
