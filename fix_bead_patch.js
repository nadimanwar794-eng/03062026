const fs = require('fs');
let code = fs.readFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'utf8');

const beadStr = `<div
          ref={beadRef}
          className="absolute top-[-14px] left-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none"
          style={{
             backgroundColor: activeColor,
             willChange: 'transform'
          }}
       >`;

const newBeadStr = `<div
          ref={beadRef}
          className="absolute top-[-14px] left-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none"
          style={{
             backgroundColor: activeColor,
             boxShadow: \`0 -4px 16px \${glowColor || activeColor}80, inset 0 2px 4px rgba(255,255,255,0.4)\`,
             willChange: 'transform'
          }}
       >`;

if (code.includes(beadStr)) {
  code = code.replace(beadStr, newBeadStr);
  console.log('Patched bead rendering!');
} else {
  console.log('Could not find beadStr');
}

fs.writeFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', code);
