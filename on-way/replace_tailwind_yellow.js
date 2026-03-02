import fs from 'fs';
import path from 'path';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regex matches prefixes like bg, text, border, ring, from, to, via, fill, stroke
    // followed by -yellow- and 2 or 3 digits (e.g. 50, 100, 400, 900)
    const regex = /(text|bg|border|ring|from|to|via|fill|stroke|divide|hover:text|hover:bg|focus:ring|focus:border)-yellow-\d{2,3}/g;
    
    const newContent = content.replace(regex, '$1-primary');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated Tailwind Yellow classes in: ${filePath}`);
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

const targetDir = path.join(process.cwd(), 'src');
if (fs.existsSync(targetDir)) {
    console.log(`Starting scan on: ${targetDir}`);
    traverseDir(targetDir);
    console.log('Update complete.');
} else {
    console.error(`Directory not found: ${targetDir}`);
}
