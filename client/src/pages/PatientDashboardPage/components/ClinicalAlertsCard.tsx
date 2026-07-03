import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type {
  ClinicalAlert,
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
} from '../../../api/patients';
import {
  createManualAlert,
  deleteManualAlert,
} from '../../../api/clinical-alerts';

interface Props {
  patientId: string;
  alerts: ClinicalAlert[];
  onAlertsChange: (alerts: ClinicalAlert[]) => void;
}

const CATEGORY_LABEL: Record<ClinicalAlertCategory, string> = {
  LIFE_THREATENING: 'סכנת חיים',
  ALLERGY: 'אלרגיה',
  CHRONIC: 'כרוני',
};

const SEVERITY_OPTIONS: Array<{ value: ClinicalAlertSeverity; label: string }> = [
  { value: 'HIGH', label: 'גבוהה' },
  { value: 'MEDIUM', label: 'בינונית' },
  { value: 'LOW', label: 'נמוכה' },
];

const CATEGORY_OPTIONS: Array<{ value: ClinicalAlertCategory; label: string }> = [
  { value: 'ALLERGY', label: 'אלרגיה' },
  { value: 'LIFE_THREATENING', label: 'סכנת חיים' },
  { value: 'CHRONIC', label: 'מחלה כרונית' },
];

function severityRank(s: ClinicalAlertSeverity): number {
  if (s === 'HIGH') return 0;
  if (s === 'MEDIUM') return 1;
  return 2;
}

function categoryRank(c: ClinicalAlertCategory): number {
  if (c === 'LIFE_THREATENING') return 0;
  if (c === 'ALLERGY') return 1;
  return 2;
}

function chipPalette(severity: ClinicalAlertSeverity): {
  bg: string;
  fg: string;
  border: string;
} {
  if (severity === 'HIGH')
    return { bg: '#e03131', fg: '#ffffff', border: '#e03131' };
  if (severity === 'MEDIUM')
    return { bg: '#fff4e6', fg: '#b35900', border: '#ffa94d' };
  return { bg: '#e7f5ff', fg: '#1971c2', border: '#74c0fc' };
}

export const ClinicalAlertsCard: React.FC<Props> = ({
  patientId,
  alerts,
  onAlertsChange,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addSeverity, setAddSeverity] = useState<ClinicalAlertSeverity>('HIGH');
  const [addCategory, setAddCategory] = useState<ClinicalAlertCategory>('ALLERGY');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = addLabel.trim();
    if (!trimmed) {
      setAddError('יש להזין שם התראה');
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const created = await createManualAlert(
        patientId,
        trimmed,
        addSeverity,
        addCategory,
      );
      const next = [...alerts.filter((a) => a.id !== created.id), created];
      onAlertsChange(next);
      setAddLabel('');
      setAddSeverity('HIGH');
      setAddCategory('ALLERGY');
      setAddOpen(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'שגיאה בשמירה');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(alert: ClinicalAlert) {
    if (alert.source !== 'MANUAL') return;
    try {
      await deleteManualAlert(patientId, alert.id);
      onAlertsChange(alerts.filter((a) => a.id !== alert.id));
    } catch {
      // ignore — UI will reflect server state on next load
    }
  }

  const sorted = [...alerts].sort((a, b) => {
    const sev = severityRank(a.severity) - severityRank(b.severity);
    if (sev !== 0) return sev;
    const cat = categoryRank(a.category) - categoryRank(b.category);
    if (cat !== 0) return cat;
    return a.label.localeCompare(b.label, 'he');
  });

  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: '#fff8f8',
        border: '1px solid #ffc9c9',
        borderRight: '4px solid #e03131',
        px: 2,
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <WarningAmberIcon sx={{ color: '#e03131', fontSize: 20 }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#c92a2a' }}>
          התראות קליניות
        </Typography>
      </Stack>

      <Box sx={{ width: '1px', height: 20, bgcolor: '#ffc9c9', flexShrink: 0 }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, flex: 1, minWidth: 0 }}>
        {sorted.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: '#868e96' }}>
            אין התראות
          </Typography>
        ) : (
          sorted.map((alert) => {
            const palette = chipPalette(alert.severity);
            const isManual = alert.source === 'MANUAL';
            return (
              <Tooltip key={alert.id} title={CATEGORY_LABEL[alert.category]}>
                <Chip
                  label={alert.label}
                  size="small"
                  onDelete={isManual ? () => handleDelete(alert) : undefined}
                  deleteIcon={isManual ? <CloseIcon /> : undefined}
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    bgcolor: palette.bg,
                    color: palette.fg,
                    border: `1px solid ${palette.border}`,
                    '& .MuiChip-deleteIcon': { color: palette.fg },
                    '& .MuiChip-deleteIcon:hover': { color: palette.fg, opacity: 0.7 },
                  }}
                />
              </Tooltip>
            );
          })
        )}
      </Box>

      <Tooltip title="הוספת התראה">
        <IconButton
          size="small"
          onClick={() => setAddOpen(true)}
          sx={{
            color: '#c92a2a',
            border: '1px dashed #ffa8a8',
            borderRadius: 1.5,
            p: 0.5,
            flexShrink: 0,
          }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        dir="rtl"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>הוספת התראה</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="קטגוריה"
              value={addCategory}
              onChange={(e) =>
                setAddCategory(e.target.value as ClinicalAlertCategory)
              }
              fullWidth
              size="small"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              autoFocus
              label="שם ההתראה"
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { maxLength: 80 } }}
              placeholder='לדוגמה: "אלרגיה לפניצילין"'
            />
            <TextField
              select
              label="חומרה"
              value={addSeverity}
              onChange={(e) =>
                setAddSeverity(e.target.value as ClinicalAlertSeverity)
              }
              fullWidth
              size="small"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            {addError && (
              <Typography sx={{ fontSize: 13, color: 'error.main' }}>
                {addError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={adding}>
            ביטול
          </Button>
          <Button onClick={handleAdd} variant="contained" disabled={adding}>
            {adding ? 'שומר...' : 'שמירה'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClinicalAlertsCard;
