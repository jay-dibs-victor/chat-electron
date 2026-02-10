const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Attempt to load cleanup, ignore if missing
let cleanup = () => { };
try {
    cleanup = require('./cleanup');
} catch (e) {
    console.warn('[Start] functional cleanup module not found, skipping cleanup.');
}

/**
 * Robustly synchronizes and enhances the process PATH variable across different OS.
 * This ensures that installed toolchains (Python, Go, Dotnet, PHP) are always accessible.
 */
function syncEnvironment() {
    const platform = os.platform();
    let paths = [];

    if (platform === 'win32') {
        try {
            const { execSync } = require('child_process');
            const sys32 = 'C:\\Windows\\System32';
            const wbem = 'C:\\Windows\\System32\\Wbem';
            const powershell = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\';
            const priorityToolPaths = [
                // Python (User & System)
                path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python313'),
                path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python313', 'Scripts'),
                path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Python313'),
                // Go
                'C:\\Program Files\\Go\\bin',
                // .NET
                'C:\\Program Files\\dotnet',
                // PHP / Composer
                'C:\\Program Files\\php',
                'C:\\ProgramData\\ComposerSetup\\bin',
                path.join(process.env.APPDATA || '', 'Composer', 'vendor', 'bin'),
                // Node
                'C:\\Program Files\\nodejs'
            ];

            paths.push(sys32, wbem, powershell, ...priorityToolPaths);
            const machinePath = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'Path\', \'Machine\')"').toString().trim();
            const userPath = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'Path\', \'User\')"').toString().trim();
            const regPaths = [...machinePath.split(';'), ...userPath.split(';')];
            const filteredRegPaths = regPaths.filter(p => !p.toLowerCase().includes('microsoft\\windowsapps'));

            paths.push(...filteredRegPaths);
            const windowsApps = regPaths.find(p => p.toLowerCase().includes('microsoft\\windowsapps'));
            if (windowsApps) paths.push(windowsApps);

        } catch (e) {
            console.warn('[Start] Registry sync failed, falling back to process.env.PATH.');
            paths.push(...(process.env.PATH || '').split(';'));
        }
    } else {
        // macOS / Linux - standard Unix hierarchy
        const unixPaths = [
            '/usr/local/bin',
            '/usr/bin',
            '/bin',
            '/usr/sbin',
            '/sbin',
            '/opt/homebrew/bin',
            '/usr/local/go/bin',
            path.join(os.homedir(), '.local', 'bin'),
            path.join(os.homedir(), 'go', 'bin'),
            path.join(os.homedir(), '.dotnet', 'tools'),
        ];
        paths.push(...(process.env.PATH || '').split(':'), ...unixPaths);
    }

    const sep = platform === 'win32' ? ';' : ':';
    const uniquePaths = [...new Set(paths)]
        .map(p => p.trim())
        .filter(p => {
            try { return p && fs.existsSync(p); } catch (e) { return false; }
        });

    process.env.PATH = uniquePaths.join(sep);
}

syncEnvironment();
console.log('[Start] Environment PATH synchronized and tool-aware across platforms.');
if (process.env.ELECTRON_RUN_AS_NODE) {
    delete process.env.ELECTRON_RUN_AS_NODE;
    console.log('[Start] Reset ELECTRON_RUN_AS_NODE mode.');
}
cleanup();
console.log('[Start] Launching Electron App...');
const child = spawn('npx', ['electron-vite', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: process.env // Explicitly pass the modified environment
});

child.on('exit', (code) => {
    console.log(`[Start] Electron App exited with code ${code}`);
    process.exit(code);
});
