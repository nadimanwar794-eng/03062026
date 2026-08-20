const fs = require('fs');
const content = fs.readFileSync('artifacts/iic-study-app/src/types.ts', 'utf8');
const lines = content.split('\n');
const startIndex = lines.findIndex(line => line.includes('export interface UserCustomTheme {'));
const endIndex = lines.findIndex((line, index) => index > startIndex && line === '}');
for (let i = startIndex; i <= endIndex; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
