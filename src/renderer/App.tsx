import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ChatList } from './components/ChatList';
import { ConnectionIndicator } from './components/ConnectionIndicator';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useAppDispatch } from './store/hooks';
import { setupSync } from './services/SyncService';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9', // Light Blue
        },
        secondary: {
            main: '#ce93d8', // Purple
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#6b6b6b #2b2b2b",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#2b2b2b",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#6b6b6b",
                        minHeight: 24,
                        border: "3px solid #2b2b2b",
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: "#959595",
                    },
                    "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                        backgroundColor: "#959595",
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#959595",
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: "#2b2b2b",
                    },
                },
            },
        },
    },
});

const MainLayout = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const cleanup = setupSync(dispatch);
        return cleanup;
    }, [dispatch]);

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                <ConnectionIndicator />
                <ChatList />
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
                Place holder
            </Box>
        </Box>
    );
};

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <MainLayout />
            </ThemeProvider>
        </Provider>
    );
}

export default App;
