const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsView.tsx', 'utf8');

code = code.replace(
  '{/* Global Ranking Card */}',
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n      {/* Global Ranking Card */}'
);

code = code.replace(
  '{/* Cohort Analysis Table */}',
  '</div>\n      {/* Cohort Analysis Table */}'
);

fs.writeFileSync('src/components/AnalyticsView.tsx', code);
