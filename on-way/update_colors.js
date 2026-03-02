import fs from 'fs';
import path from 'path';

// Hex codes mapping to the new colors
const PRIMARY_COLOR = '#2FCA71';
const SECONDARY_COLOR = '#001820';

// Old colors to replace
const primaryOldColors = [
    '#FFD600', '#FFF200', '#FDC800', '#FFD700', '#facc15', '#ef269f', '#ff5a1f', '#2563eb'
];

const secondaryOldColors = [
    '#011421', '#111827', '#1A3760', '#303841', '#1a1a1a', '#111', '#222', '#2a2a2a'
];

// Helper to escape special characters for regex
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Create master regex
const primaryRegex = new RegExp(`(${primaryOldColors.map(escapeRegExp).join('|')})`, 'gi');
const secondaryRegex = new RegExp(`(${secondaryOldColors.map(escapeRegExp).join('|')})`, 'gi');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace Primary Old Colors
    if (primaryRegex.test(content)) {
        content = content.replace(primaryRegex, PRIMARY_COLOR);
        modified = true;
    }

    // Replace Secondary Old Colors
    if (secondaryRegex.test(content)) {
        content = content.replace(secondaryRegex, SECONDARY_COLOR);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        if (file === 'node_modules' || file === '.next') continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
            processFile(fullPath);
        }
    }
}

// Start processing the src directory
const targetDir = path.join(process.cwd(), 'src');
if (fs.existsSync(targetDir)) {
    console.log(`Starting scan on: ${targetDir}`);
    traverseDir(targetDir);
    console.log('Update complete.');
} else {
    console.error(`Directory not found: ${targetDir}`);
}
