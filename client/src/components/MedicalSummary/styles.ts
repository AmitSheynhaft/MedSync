export const medicalSummaryItemRowSx = {
  display: 'flex',
  gap: 1,
  alignItems: 'flex-start',
  fontSize: 14,
  color: '#495057',
  lineHeight: 1.7,
};

export const medicalSummaryItemMarkerSx = {
  fontWeight: 700,
  color: '#3b5bdb',
  flexShrink: 0,
  minWidth: 22,
};

export const medicalSummaryItemTextSx = {
  fontSize: 14,
  lineHeight: 1.7,
};

export const medicalSummaryItemLabelSx = {
  fontWeight: 700,
  color: '#1a1a2e',
};

export const medicalSummaryFallbackTextSx = {
  fontSize: 14,
  color: '#495057',
  lineHeight: 1.7,
};

export const medicalSummaryRootSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.25,
};

export const medicalSummaryHeadingSx = (isFirst: boolean) => ({
  fontSize: 14,
  fontWeight: 700,
  color: '#1a1a2e',
  mt: isFirst ? 0 : 1.25,
});

export const medicalSummaryItemsBlockSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
};

export const medicalSummaryParagraphSx = {
  fontSize: 14,
  color: '#495057',
  lineHeight: 1.7,
};
