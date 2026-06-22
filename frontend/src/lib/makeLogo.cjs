const fs = require('fs');
const bytes = fs.readFileSync('C:\\Users\\shekar\\.gemini\\antigravity-ide\\brain\\71e8151a-4730-4870-9a16-16a03984d50e\\ganga_maxx_logo_1781159550969.png');
const b64 = bytes.toString('base64');
fs.writeFileSync('C:\\Users\\shekar\\OneDrive\\Documents\\ganga maxx\\client\\src\\lib\\logoBase64.js', 'export const logoBase64 = "data:image/png;base64,' + b64 + '";\n');
console.log("Done");
