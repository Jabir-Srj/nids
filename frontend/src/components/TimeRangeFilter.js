import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, ButtonGroup, } from '@mui/material';
const TimeRangeFilter = ({ selectedRange, onRangeChange }) => {
    const ranges = [
        { label: '24h', value: '24h' },
        { label: '7d', value: '7d' },
        { label: '30d', value: '30d' },
    ];
    return (_jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: '0.9em', color: '#666', marginRight: 4 }, children: "Time Range:" }), _jsx(ButtonGroup, { size: "small", variant: "outlined", children: ranges.map((range) => (_jsx(Button, { onClick: () => onRangeChange(range.value), variant: selectedRange === range.value ? 'contained' : 'outlined', children: range.label }, range.value))) })] }));
};
export default TimeRangeFilter;
//# sourceMappingURL=TimeRangeFilter.js.map