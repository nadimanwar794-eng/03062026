import fs from 'fs';
const content = fs.readFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'utf8');

const regex = /ChunkedNotesReader[\s\S]*?\/>/g;
let match;
while ((match = regex.exec(content)) !== null) {
  if (match[0].includes('onStarToggle') || match[0].includes('onMark2Toggle')) {
     console.log(`Found around index ${match.index}`);
  }
}
