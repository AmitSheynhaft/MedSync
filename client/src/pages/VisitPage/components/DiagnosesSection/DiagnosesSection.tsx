import React from 'react';
import { Autocomplete, Box, Stack, TextField, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { ListItemRow } from '../ListItemRow/ListItemRow';
import { RTL_TEXT_DIRECTION, DiagnosisItem } from '../../constants';
import type { Diagnosis } from '../../../../api/diagnoses';
import {
  diagnosesSectionIconSx,
  diagnosesSectionListSx,
  diagnosesSectionOptionSx,
} from './styles';

interface IDiagnosesSectionProps {
  isReadOnly: boolean;
  diagnosesList: DiagnosisItem[];
  diagnosisOptions: Diagnosis[];
  isDiagnosesLoading: boolean;
  diagnosisSearch: string;
  setDiagnosisSearch: (value: string) => void;
  addDiagnosis: (item: DiagnosisItem) => void;
  removeDiagnosis: (index: number) => void;
}

export const DiagnosesSection: React.FC<IDiagnosesSectionProps> = ({
  isReadOnly, diagnosesList, diagnosisOptions, isDiagnosesLoading, diagnosisSearch, setDiagnosisSearch, addDiagnosis, removeDiagnosis,
}) => (
  <>
    <SectionHeader icon={<LocalHospitalIcon sx={diagnosesSectionIconSx} />} label="אבחנות ICD-10" color="#7048e8" bg="#f3f0ff" />
    <Stack sx={diagnosesSectionListSx}>
      {diagnosesList.map((diagnosis, index) => (
        <ListItemRow
          key={`${diagnosis.code}|${diagnosis.description}`}
          primaryText={diagnosis.code}
          primaryColor="#7048e8"
          secondaryText={diagnosis.description}
          isReadOnly={isReadOnly}
          onRemove={() => removeDiagnosis(index)}
        />
      ))}
    </Stack>
    {!isReadOnly && (
      <Autocomplete
        size="small"
        options={diagnosisOptions}
        value={null}
        getOptionLabel={option => `${option.code} — ${option.description}`}
        filterOptions={options => options}
        loading={isDiagnosesLoading}
        inputValue={diagnosisSearch}
        onInputChange={(_, value, reason) => { if (reason !== 'reset') setDiagnosisSearch(value); }}
        onChange={(_, selectedOption) => {
          if (!selectedOption) return;
          addDiagnosis({ code: selectedOption.code, description: selectedOption.description });
          setDiagnosisSearch('');
        }}
        renderInput={params => (
          <TextField {...params} placeholder="חפש קוד או תיאור ICD-10..."
            slotProps={{ ...params.slotProps, htmlInput: { ...(params.slotProps?.htmlInput as object), ...RTL_TEXT_DIRECTION } }} />
        )}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props as typeof props & { key: React.Key };
          return (
            <Box key={key} component="li" {...optionProps} sx={diagnosesSectionOptionSx}>
              <Typography variant="body2"><strong style={{ color: '#7048e8' }}>{option.code}</strong> — {option.description}</Typography>
            </Box>
          );
        }}
        noOptionsText="לא נמצאו אבחנות"
        slotProps={{ popper: { placement: 'bottom-start', modifiers: [{ name: 'flip', enabled: false }] } }}
      />
    )}
  </>
);

export default DiagnosesSection;
