const fs = require('fs');
const data = fs.readFileSync('public/logo.jpg');
const b64 = data.toString('base64');
fs.writeFileSync('src/lib/logoBase64.js', 'export const logoBase64 = "data:image/jpeg;base64,' + b64 + '";\n');
console.log('Logo updated successfully.');
