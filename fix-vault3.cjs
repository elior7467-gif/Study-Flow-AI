const fs = require('fs');
let code = fs.readFileSync('src/components/VaultView.tsx', 'utf8');

const lastPartIndex = code.lastIndexOf('      </div>\n          </div>\n    </div>\n  );\n};');

if (lastPartIndex !== -1) {
  code = code.slice(0, lastPartIndex) + '      </div>\n      </div>\n    </div>\n  );\n};';
} else {
  // let's try to just use a regex for the end
  code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*};/g, '</div>\n      </div>\n    </div>\n  </div>\n  );\n};');
}

fs.writeFileSync('src/components/VaultView.tsx', code);
