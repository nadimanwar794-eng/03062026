const fs = require('fs');
const filePath = 'artifacts/iic-study-app/src/components/AdminDashboard.tsx';

let content = fs.readFileSync(filePath, 'utf8');

const syncMatches = content.match(/syncClassNotesMcqsToRevisionHub/g);
console.log('Number of sync calls:', syncMatches ? syncMatches.length : 0);

const syncFunc = content.match(/const syncClassNotesMcqsToRevisionHub =[\s\S]*?catch[\s\S]*?}/);
if (syncFunc) {
  console.log('Sync function:');
  console.log(syncFunc[0]);
}
