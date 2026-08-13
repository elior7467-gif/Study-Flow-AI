const fs = require('fs');
let code = fs.readFileSync('src/components/VaultView.tsx', 'utf8');

code = code.replace(
  '{/* Interactive 3D Flip Flashcard / Question Card */}',
  '<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">\n        <div className="space-y-6">\n      {/* Interactive 3D Flip Flashcard / Question Card */}'
);

code = code.replace(
  '{/* Interactive Physics Diagram & Vector Simulator */}',
  '</div>\n        <div className="space-y-6">\n      {/* Interactive Physics Diagram & Vector Simulator */}'
);

const idx = code.lastIndexOf('</div>\n  );\n};');
if (idx !== -1) {
  code = code.slice(0, idx) + '      </div>\n    </div>\n  );\n};';
} else {
  console.log("Could not find end of VaultView");
}

fs.writeFileSync('src/components/VaultView.tsx', code);
