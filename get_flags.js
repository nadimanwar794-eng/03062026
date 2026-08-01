import fs from 'fs';
const content = fs.readFileSync('artifacts/iic-study-app/src/components/ChunkedNotesReader.tsx', 'utf8');

const regex = /isMultiSelectMode[\s\S]*?\{/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`Found around index ${match.index}:`);
  console.log(content.substring(match.index, match.index + 200));
}
