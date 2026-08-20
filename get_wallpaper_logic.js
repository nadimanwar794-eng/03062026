const fs = require('fs');
const content = fs.readFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'utf8');
const lines = content.split('\n');
const start = 800;
const end = 850;
for (let i = start; i < end; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
