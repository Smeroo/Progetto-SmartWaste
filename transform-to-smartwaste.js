const fs = require('fs');
const path = require('path');

// Definisci le sostituzioni da fare
const replacements = [
  // Nomi e brand
  { from: /WorQ/g, to: 'SmartWaste' },
  { from: /worq/g, to: 'smartwaste' },
  
  // Entità principali
  { from: /\bspaces\b/g, to: 'collectionPoints' },
  { from: /\bspace\b/g, to: 'collectionPoint' },
  { from: /\bSpace\b/g, to: 'CollectionPoint' },
  { from: /\bSpaces\b/g, to: 'CollectionPoints' },
  
  // Agency → Operator
  { from: /\bagencies\b/g, to: 'operators' },
  { from: /\bagency\b/g, to: 'operator' },
  { from: /\bAgency\b/g, to: 'Operator' },
  { from: /\bAgencies\b/g, to: 'Operators' },
  
  // Client → User (cittadino)
  { from: /\bclients\b/g, to: 'users' },
  { from: /\bclient\b/g, to: 'user' },
  { from: /\bClient\b/g, to: 'User' },
  { from: /\bClients\b/g, to: 'Users' },
  
  // Booking → rimosso (non serve per SmartWaste)
  { from: /\bbookings\b/g, to: 'visits' },
  { from: /\bbooking\b/g, to: 'visit' },
  { from: /\bBooking\b/g, to: 'Visit' },
  { from: /\bBookings\b/g, to: 'Visits' },
  
  // URL e percorsi
  { from: /\/spaces\//g, to: '/collection-points/' },
  { from: /\/spaces'/g, to: '/collection-points\'' },
  { from: /\/spaces"/g, to: '/collection-points"' },
  { from: /\/spaces`/g, to: '/collection-points`' },
  { from: /'\/spaces'/g, to: '\'/collection-points\'' },
  { from: /"\/spaces"/g, to: '"/collection-points"' },
  { from: /`\/spaces`/g, to: '`/collection-points`' },
  
  { from: /\/agencies\//g, to: '/operators/' },
  { from: /\/bookings\//g, to: '/reports/' },
  
  // API routes
  { from: /api\/spaces/g, to: 'api/collection-points' },
  { from: /api\/agencies/g, to: 'api/operators' },
  { from: /api\/bookings/g, to: 'api/reports' },
  
  // Testi UI comuni
  { from: /Book a space/g, to: 'Trova punto di raccolta' },
  { from: /Coworking space/g, to: 'Punto di raccolta' },
  { from: /coworking space/g, to: 'punto di raccolta' },
  { from: /Meeting room/g, to: 'Centro di raccolta' },
  { from: /meeting room/g, to: 'centro di raccolta' },
];

// Escludi cartelle e file
const excludeDirs = ['node_modules', '.next', '.git', 'prisma', 'public'];
const excludeFiles = ['package-lock.json', 'transform-to-smartwaste.js'];
const includeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

// Funzione per processare un file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Applica tutte le sostituzioni
    replacements.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    // Salva solo se modificato
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Modified: ${filePath}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Funzione ricorsiva per attraversare le cartelle
function traverseDirectory(dir) {
  let filesModified = 0;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Salta cartelle escluse
      if (!excludeDirs.includes(item)) {
        filesModified += traverseDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      // Processa solo file con estensioni valide
      const ext = path.extname(item);
      if (includeExtensions.includes(ext) && !excludeFiles.includes(item)) {
        filesModified += processFile(fullPath);
      }
    }
  });
  
  return filesModified;
}

// Esegui lo script
console.log('🚀 Starting WorQ → SmartWaste transformation...\n');

const startDir = path.join(__dirname, 'src');
const filesModified = traverseDirectory(startDir);

console.log(`\n🎉 Transformation complete! Modified ${filesModified} files.`);
console.log('\n⚠️  Remember to:');
console.log('   1. Review changes with: git diff');
console.log('   2. Test the application');
console.log('   3. Commit changes if everything works');