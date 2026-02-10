import React from 'react';
import { useAppSelector } from '../store/hooks';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { simulateDrop } from '../services/SyncService';
import CircleIcon from '@mui/icons-material/Circle';

export const ConnectionIndicator = () => {
    const status = useAppSelector((state) => state.connection.status);

    const getStatusColor = () => {
        switch (status) {
            case 'Connected': return '#4caf50';
            case 'Reconnecting': return '#ff9800';
            case 'Offline': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    return (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 12, color: getStatusColor() }} />
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {status}
                </Typography>
            </Box>
            <Tooltip title="Simulate a network failure">
                <Button variant="outlined" size="small" onClick={simulateDrop} color="error" sx={{ fontSize: '0.7rem' }}>
                    Drop Connection
                </Button>
            </Tooltip>
        </Box>
    );
};
