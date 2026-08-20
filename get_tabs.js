const fs = require('fs');
const content = fs.readFileSync('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'utf8');
const lines = content.split('\n');
const startIndex = lines.findIndex(line => line.includes('type TabType = '));
if (startIndex !== -1) {
    for (let i = startIndex; i < startIndex + 15; i++) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}
