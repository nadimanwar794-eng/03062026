const fs = require('fs');
const content = fs.readFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('_appBg')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    if (i > 0) console.log(`Line ${i}: ${lines[i - 1]}`);
    if (i < lines.length - 1) console.log(`Line ${i + 2}: ${lines[i + 1]}`);
    console.log('---');
  }
}
