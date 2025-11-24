const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Correggi "use user" in "use client"
    if (content.includes('"use user"') || content.includes("'use user'")) {
      content = content.replace(/['"]use user['"]/g, '"use client"');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error: ${filePath}`, error.message);
    return 0;
  }
}

function traverseDirectory(dir) {
  let fixed = 0;
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(item)) {
      fixed += traverseDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      fixed += fixFile(fullPath);
    }
  });
  
  return fixed;
}

console.log('🔧 Fixing "use user" → "use client"...\n');
const fixed = traverseDirectory(path.join(__dirname, 'src'));
console.log(`\n✅ Fixed ${fixed} files!`);