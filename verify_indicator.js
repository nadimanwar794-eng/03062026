const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(filepath, 'utf8');
if (content.includes("tabs.find(t => t.isActive)?.activeColor")) {
    console.log("Sliding indicator updated successfully.");
} else {
    console.log("Sliding indicator update FAILED.");
    // try to find it
    const match = content.match(/<div[^>]*boxShadow:[^>]*tierTheme\.navGlow[^>]*>/);
    if (match) console.log(match[0]);
}
