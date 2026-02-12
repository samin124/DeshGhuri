const fs = require('fs');
const path = require('path');

// Files to fix
const fixes = [
  // Fix unused error/err in catch blocks
  {
    file: 'apps/web/src/routes/verify-email.tsx',
    find: /catch \(err\)/g,
    replace: 'catch (_err)',
  },
  {
    file: 'packages/db/src/create-admin.ts',
    pattern: 'userRole',
    action: 'comment-out-line',
    line: 19,
  },
];

// Apply fixes
fixes.forEach((fix) => {
  try {
    const filePath = path.join(process.cwd(), fix.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skip: ${fix.file} (not found)`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    if (fix.find && fix.replace) {
      const before = content;
      content = content.replace(fix.find, fix.replace);
      if (content !== before) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed: ${fix.file}`);
      } else {
        console.log(`⏭️  Skip: ${fix.file} (pattern not found)`);
      }
    }
  } catch (error) {
    console.log(`❌ Error fixing ${fix.file}: ${error.message}`);
  }
});

console.log('\n✨ Batch fixes complete!');
