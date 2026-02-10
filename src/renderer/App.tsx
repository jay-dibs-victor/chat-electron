
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';


const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#ce93d8',
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

});

const MainLayout = () => {


    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            In God we trust.
        </Box>
    );
};

function App() {
    return (

        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MainLayout />
        </ThemeProvider>

    );
}

export default App;
