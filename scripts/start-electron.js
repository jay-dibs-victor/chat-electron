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
