export const userFormDialogTitleSx = { fontWeight: 700 };
export const userFormDialogStackSx = { mt: 1 };

export const userFormCalendarButtonSx = (hasValue: boolean) => ({
  color: hasValue ? '#3b5bdb' : '#adb5bd',
  p: 0.5,
});

export const userFormDateInputSx = {
  '& input': { cursor: 'pointer' },
  '& input::-webkit-calendar-picker-indicator': { display: 'none' },
};

export const userFormCalendarIconSx = { fontSize: 16 };

export const userFormValidationTextSx = {
  fontSize: 12,
  color: 'error.main',
};

export const userFormDialogActionsSx = {
  px: 3,
  pb: 2,
};
