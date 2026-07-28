export const stepActionsStackSx = {
  mt: 0.5,
  gap: 2,
};

export const stepActionsBackButtonSx = (color: string) => ({
  py: 1,
  fontSize: 15,
  borderColor: color,
  color,
  '&:hover': { borderColor: color },
});

export const stepActionsSubmitButtonSx = (color: string) => ({
  py: 1,
  fontSize: 15,
  bgcolor: color,
  '&:hover': { bgcolor: color, filter: 'brightness(0.9)' },
});
