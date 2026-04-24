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
    if (content.includes('http://localhost:5000')) {
      if (filePath.endsWith('config.js')) return;
      
      const relativePath = path.relative(path.dirname(filePath), path.join(dir, 'config.js')).replace(/\\/g, '/');
      const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      
      if (!content.includes('API_BASE')) {
        content = `import API_BASE from '${importPath}';\n` + content;
      }
      
      content = content.replace(/'http:\/\/localhost:5000\/api/g, '`${API_BASE}/api');
      content = content.replace(/'http:\/\/localhost:5000'/g, 'API_BASE');
      content = content.replace(/`http:\/\/localhost:5000\/api/g, '`${API_BASE}/api');
      
      fs.writeFileSync(filePath, content);
      console.log('Updated:', filePath);
    }
  }
});
