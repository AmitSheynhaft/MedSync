import React from 'react';
import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import { SectionHeader } from './SectionHeader';
import { ListItemRow } from './ListItemRow';
import { RTL_TEXT_DIRECTION, MedicineItem } from '../constants';
import type { Medicine } from '../../../api/medicines';

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
}

export const MedicinesSection: React.FC<IMedicinesSectionProps> = ({
  isReadOnly, medicinesList, medicineOptions, medicineSearch, setMedicineSearch,
  medicineDosage, setMedicineDosage, medicineFrequency, setMedicineFrequency,
  medicineDuration, setMedicineDuration, handleAddMedicine, removeMedicine,
}) => (
  <>
    <SectionHeader icon={<MedicationIcon sx={{ fontSize: 16 }} />} label="תרופות" color="#e8590c" bg="#fff3e6" />
    <Stack sx={{ gap: 0.5 }}>
      {medicinesList.map((medicine, index) => (
        <ListItemRow
          key={index}
          primaryText={medicine.name}
          primaryColor="#e8590c"
          secondaryText={`${medicine.dosage} · ${medicine.frequency} · ${medicine.duration}`}
          isReadOnly={isReadOnly}
          onRemove={() => removeMedicine(index)}
        />
      ))}
    </Stack>
    {!isReadOnly && (
      <Stack sx={{ gap: 1 }}>
        <Autocomplete
          size="small"
          options={medicineOptions}
          getOptionLabel={option => option.name}
          filterOptions={options => options}
          inputValue={medicineSearch}
          onInputChange={(_, value, reason) => { if (reason !== 'reset') setMedicineSearch(value); }}
          onChange={(_, selectedOption) => {
            if (!selectedOption) return;
            setTimeout(() => setMedicineSearch(selectedOption.name), 0);
          }}
          renderInput={params => (
            <TextField {...params} placeholder="חפש שם תרופה..."
              slotProps={{ ...params.slotProps, htmlInput: { ...(params.slotProps?.htmlInput as object), ...RTL_TEXT_DIRECTION } }} />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ direction: 'rtl' }}>
              <Typography variant="body2">{option.name}</Typography>
            </Box>
          )}
          noOptionsText="לא נמצאו תרופות"
          slotProps={{ popper: { placement: 'bottom-start', modifiers: [{ name: 'flip', enabled: false }] } }}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1 }}>
          <TextField size="small" placeholder="מינון (100mg)" value={medicineDosage}
            onChange={e => setMedicineDosage(e.target.value)} slotProps={{ htmlInput: RTL_TEXT_DIRECTION }} />
          <TextField size="small" placeholder="תדירות (פעם ביום)" value={medicineFrequency}
            onChange={e => setMedicineFrequency(e.target.value)} slotProps={{ htmlInput: RTL_TEXT_DIRECTION }} />
          <TextField size="small" placeholder="משך טיפול (7 ימים)" value={medicineDuration}
            onChange={e => setMedicineDuration(e.target.value)} slotProps={{ htmlInput: RTL_TEXT_DIRECTION }} />
        </Box>
        <Button variant="outlined" size="small" onClick={handleAddMedicine}
          sx={{ alignSelf: 'flex-start', px: 3, borderRadius: '6px', fontWeight: 600 }}>
          הוסף תרופה
        </Button>
      </Stack>
    )}
  </>
);

export default MedicinesSection;
