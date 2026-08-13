const fs = require('fs');

let chatView = fs.readFileSync('src/components/ChatView.tsx', 'utf8');
chatView = chatView.replace(
  'soundEnabled?: boolean;\n}',
  'soundEnabled?: boolean;\n  onNotify: (msg: string, type: "success" | "warning" | "error") => void;\n}'
);
chatView = chatView.replace(
  '  soundEnabled = true,\n}) => {',
  '  soundEnabled = true,\n  onNotify,\n}) => {'
);
chatView = chatView.replace(
  /if \(!response\.ok\) \{[\s\S]*?throw new Error\('Failed to generate solver-critic response'\);\n\s*\}/,
  `if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate solver-critic response');
      }`
);
chatView = chatView.replace(
  'console.error(\'Error generating solver resolution:\', err);',
  'console.error(\'Error generating solver resolution:\', err);\n      onNotify(err.message || "Failed to connect to AI server", "error");'
);
fs.writeFileSync('src/components/ChatView.tsx', chatView);


let hubView = fs.readFileSync('src/components/HubView.tsx', 'utf8');
hubView = hubView.replace(
  'soundEnabled?: boolean;\n}',
  'soundEnabled?: boolean;\n  onNotify: (msg: string, type: "success" | "warning" | "error") => void;\n}'
);
hubView = hubView.replace(
  '  soundEnabled = true,\n}) => {',
  '  soundEnabled = true,\n  onNotify,\n}) => {'
);
hubView = hubView.replace(
  /if \(!res\.ok\) throw new Error\('Audit failed'\);/,
  `if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Audit failed');
      }`
);
hubView = hubView.replace(
  'console.error(\'Audit failed:\', err);',
  'console.error(\'Audit failed:\', err);\n      onNotify(err.message || "Failed to connect to AI server", "error");'
);
fs.writeFileSync('src/components/HubView.tsx', hubView);


let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  'soundEnabled={soundEnabled}\n              />',
  'soundEnabled={soundEnabled}\n                onNotify={handleNotify}\n              />'
);
app = app.replace(
  'soundEnabled={soundEnabled}\n              />\n            )}',
  'soundEnabled={soundEnabled}\n                onNotify={handleNotify}\n              />\n            )}'
);
fs.writeFileSync('src/App.tsx', app);
