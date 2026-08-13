const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  "throw new Error('GEMINI_API_KEY environment variable is missing');",
  "throw new Error('Missing Gemini API Key. Please attach your API key in the environment to use AI features.');"
);
fs.writeFileSync('server.ts', serverCode);
