// Imports
// =============================================================================
const fs = require('fs');

// Main
// =============================================================================

// TODO ?

const file = fs.readFileSync('./dist/index.js').toString();
const resultFile = `<h1>Loading...</h1><meta charset='utf-8'/><script>${file}</script>`;
fs.writeFileSync('./dist/entry.html', resultFile);

const resultFileInBase64 = Buffer.from(resultFile).toString('base64');
const prefix = '+WeGit+/+0+0+1+/';
const link = `data:text/html;base64,${prefix}${resultFileInBase64}`;

const linkFile = `<a style="text-decoration: none;border-bottom: 1px dotted currentColor;" href="${link}">You should go to WeGit here!</a>`;
fs.writeFileSync('./dist/link.html', linkFile);
