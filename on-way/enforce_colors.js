import fs from 'fs';
import path from 'path';

const PRIMARY_COLOR = '#2FCA71';
const SECONDARY_COLOR = '#001820';

// Regex to find things like text-[#XXXXXX] or bg-[#XXXXXX] where XXX is SECONDARY_COLOR,
// but only within <h1, <h2, <h3 or <button tags.
// Since parsing JSX via Regex is brittle, we'll look for general text/bg utilities on titles and buttons.

// Wait, the previous script changed ALL yellow to PRIMARY (#2FCA71) and ALL darks to SECONDARY (#001820).
// What if a button was originally yellow? It became #2FCA71. Good.
// What if a button was originally dark? It became #001820. But the user says "buttons and titles color should be #2FCA71. it should be primary color."
// So we need to ensure ALL buttons and titles use #2FCA71.

function enforcePrimaryOnElements(content) {
    let modified = false;

    // A simple regex to find <h[1-3] ... > and <button ... >, then replace any text-[SECONDARY_COLOR] with text-[PRIMARY_COLOR]
    // or bg-[SECONDARY_COLOR] with bg-[PRIMARY_COLOR].

    // Match tags: <h1 ... > or <button ... >
    const tagRegex = /<(h[1-6]|button|Link)([^>]*?)>/gi;

    content = content.replace(tagRegex, (match, tag, attrs) => {
        let newAttrs = attrs;
        
        // If it was a dark color (now SECONDARY_COLOR #001820), make it PRIMARY_COLOR #2FCA71
        if (newAttrs.includes(SECONDARY_COLOR)) {
            newAttrs = newAttrs.split(SECONDARY_COLOR).join(PRIMARY_COLOR);
            modified = true;
        }

        return `<${tag}${newAttrs}>`;
    });

    return { content, modified };
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const { content: newContent, modified } = enforcePrimaryOnElements(content);

    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Enforced primary on: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) { traverseDir(fullPath); } 
        else if (file.endsWith('.js') || file.endsWith('.jsx')) { processFile(fullPath); }
    }
}

const targetDir = path.join(process.cwd(), 'src');
if (fs.existsSync(targetDir)) {
    traverseDir(targetDir);
}
