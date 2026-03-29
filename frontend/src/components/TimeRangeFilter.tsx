import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
} from '@mui/material';

interface TimeRangeFilterProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <span style={{ fontSize: '0.9em', color: '#666', marginRight: 4 }}>Time Range:</span>
      <ButtonGroup size="small" variant="outlined">
        {ranges.map((range) => (
          <Button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            variant={selectedRange === range.value ? 'contained' : 'outlined'}
          >
            {range.label}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default TimeRangeFilter;
