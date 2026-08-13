const fs = require('fs');
let code = fs.readFileSync('src/components/VaultView.tsx', 'utf8');

code = code.replace(/  \);\n};/, '    </div>\n  );\n};');

fs.writeFileSync('src/components/VaultView.tsx', code);
