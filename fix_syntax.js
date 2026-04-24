const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'frontend/src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk(dir, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix mismatched quotes: `${API_BASE}/api/something' -> `${API_BASE}/api/something`
    content = content.replace(/(`\$\{API_BASE\}\/api\/[^']*)'/g, '$1`');
    
    // Fix mismatched quotes for test/sessions: `${API_BASE}/api/test/sessions?userId=${uid}'
    content = content.replace(/(`\$\{API_BASE\}[^']*)'/g, '$1`');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed syntax in:', filePath);
    }
  }
});
