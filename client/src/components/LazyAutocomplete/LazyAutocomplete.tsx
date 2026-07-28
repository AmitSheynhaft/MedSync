import React from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';
import type { Paginated } from '../../api/slots';
import { useLazyOptions } from '../../hooks/useLazyOptions';
import { lazyAutocompleteSx } from './LazyAutocomplete.styles';

const SCROLL_THRESHOLD_PX = 32;

interface LazyAutocompleteProps<T> {
  label: string;
  placeholder?: string;
  value: T | null;
  onChange: (value: T | null) => void;
  fetchPage: (search: string, page: number) => Promise<Paginated<T>>;
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue: (a: T, b: T) => boolean;
  renderOptionContent?: (option: T) => React.ReactNode;
  noOptionsText?: string;
  loadingText?: string;
}

export function LazyAutocomplete<T>({
  label,
  placeholder,
  value,
  onChange,
  fetchPage,
  getOptionLabel,
  isOptionEqualToValue,
  renderOptionContent,
  noOptionsText = 'לא נמצאו תוצאות',
  loadingText = 'טוען...',
}: LazyAutocompleteProps<T>) {
  const { options, isLoading, hasMorePages, search, loadNextPage, ensureLoaded } =
    useLazyOptions(fetchPage);

  return (
    <Autocomplete
      fullWidth
      size="small"
      value={value}
      options={options}
      loading={isLoading}
      filterOptions={x => x}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      noOptionsText={noOptionsText}
      loadingText={loadingText}
      onOpen={ensureLoaded}
      onChange={(_, next) => onChange(next)}
      onInputChange={(_, input, reason) => {
        if (reason === 'input') search(input);
        else if (reason === 'clear') search('');
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {renderOptionContent ? renderOptionContent(option) : getOptionLabel(option)}
        </Box>
      )}
      slotProps={{
        listbox: {
          onScroll: (event: React.UIEvent<HTMLUListElement>) => {
            const node = event.currentTarget;
            const reachedBottom =
              node.scrollTop + node.clientHeight >= node.scrollHeight - SCROLL_THRESHOLD_PX;
            if (reachedBottom && hasMorePages && !isLoading) loadNextPage();
          },
        },
      }}
      sx={lazyAutocompleteSx}
      renderInput={params => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
    />
  );
}

export default LazyAutocomplete;
