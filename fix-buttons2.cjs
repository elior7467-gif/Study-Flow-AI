const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Match <button down to className="
  // Then append inside the className string
  const regex = /<button([\s\S]*?)className=["']([^"']*)["']/g;
  
  content = content.replace(regex, (match, before, classes) => {
    let newClasses = classes;
    if (!newClasses.includes('cursor-pointer')) {
      newClasses += ' cursor-pointer';
    }
    if (!newClasses.includes('active:scale-') && !newClasses.includes('scale-')) {
      newClasses += ' active:scale-95 transition-all';
    }
    if (newClasses !== classes) {
      changed = true;
      return `<button${before}className="${newClasses}"`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated buttons in ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

walkDir('./src');
