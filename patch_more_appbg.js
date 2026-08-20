const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const regex = /style=\{\{\s*background:\s*_appBg\s*\}\}/g;
const replace = `style={{ background: activeWallpaper ? \`url(\${activeWallpaper}) center/cover no-repeat fixed\` : _appBg }}`;
content = content.replace(regex, replace);

fs.writeFileSync(filepath, content);
console.log("Updated more _appBg usages.");
