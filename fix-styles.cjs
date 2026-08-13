const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const replacePatterns = [
  // Text colors
  { regex: /text-\[#0F172A\] dark:text-\[#F8FAFC\]/g, replacement: 'text-neo' },
  { regex: /text-\[#0F172A\]/g, replacement: 'text-neo' },
  { regex: /text-\[#64748B\] dark:text-\[#94A3B8\]/g, replacement: 'text-neo opacity-80' },
  { regex: /text-\[#64748B\]/g, replacement: 'text-neo opacity-80' },
  { regex: /text-\[#2563EB\] dark:text-\[#60A5FA\]/g, replacement: 'text-[#2563EB] dark:text-[#60A5FA]' },
  
  // Backgrounds that are just flat surfaces
  { regex: /bg-\[#F8FAFC\] dark:bg-\[#0F172A\]/g, replacement: 'bg-neo' },
  { regex: /bg-\[#F1F5F9\] dark:bg-\[#1E293B\]/g, replacement: 'bg-neo' },
  { regex: /bg-\[#F1F5F9\] dark:bg-\[#0F172A\]/g, replacement: 'bg-neo' },
  { regex: /bg-white dark:bg-\[#020617\]/g, replacement: 'bg-neo' },
  { regex: /bg-\[#F1F5F9\]/g, replacement: 'bg-neo' },
  
  // Borders
  { regex: /border-\[#E2E8F0\] dark:border-\[#1E293B\]/g, replacement: 'border-black/5 dark:border-white/5' },
  { regex: /border-\[#E2E8F0\] dark:border-\[#334155\]/g, replacement: 'border-black/5 dark:border-white/5' },
  { regex: /border border-\[#E2E8F0\]/g, replacement: 'border border-black/5 dark:border-white/5' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of replacePatterns) {
    content = content.replace(regex, replacement);
  }

  // Cleanup potential duplicates like `text-neo text-neo` or `bg-neo bg-neo` just in case
  content = content.replace(/text-neo text-neo/g, 'text-neo');
  content = content.replace(/bg-neo bg-neo/g, 'bg-neo');
  content = content.replace(/bg-neo shadow-neo bg-neo shadow-neo/g, 'bg-neo shadow-neo');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

fs.readdirSync(componentsDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(componentsDir, file));
  }
});

console.log("Styling cleanup complete.");
