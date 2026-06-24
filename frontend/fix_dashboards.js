import fs from 'fs';
import path from 'path';

const dirs = [
  'C:/Users/shekar/OneDrive/Documents/ganga maxx/frontend/src/pages',
  'C:/Users/shekar/OneDrive/Documents/ganga maxx/frontend/src/pages/dashboards'
];

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    let newContent = content.replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"](\.\.\/?\.\.\/data\/mockData|(\.\.\/)*data\/mockData)['"];?/, (match, imports, reqPath) => {
      const parts = imports.split(',').map(s => s.trim());
      const filtered = parts.filter(p => p !== 'collectionActions');
      if (filtered.length === 0) return '';
      return `import { ${filtered.join(', ')} } from '${reqPath}';`;
    });
    
    if (newContent !== content) {
      // Add const collectionActions
      if (newContent.includes('const activities =')) {
        newContent = newContent.replace(/const activities = ([^;]+);/, 'const activities = $1;\n  const collectionActions = data.collectionActions?.length ? data.collectionActions : [];');
      }
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${file}`);
    }
  }
}
