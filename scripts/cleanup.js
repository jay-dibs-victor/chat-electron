const { exec } = require('child_process');
const os = require('os');

function cleanup() {
    console.log('Cleaning up existing Electron and Node processes...');

    if (os.platform() === 'win32') {
        // Windows cleanup
        exec('taskkill /F /IM electron.exe /T', (err) => {
            // Ignore error
        });
        console.log('Cleanup complete (Windows - Skip Node Kill to protect agent).');
    } else {
        // Unix cleanup (macOS/Linux)
        exec('pkill -f electron', (err) => {
            // Ignore error
            console.log('Cleanup complete (Unix).');
        });
    }
}

// Only run if this is the main module
if (require.main === module) {
    cleanup();
}

module.exports = cleanup;
