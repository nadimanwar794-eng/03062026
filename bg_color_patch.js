const fs = require('fs');
let code = fs.readFileSync('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'utf8');

const bgStr = `        BACKGROUND: isAdmin ? (
            <ColorRow label="App Background" sub="Puri app ki main background (Admin only)" value={theme.bgColor} onChange={setColor('bgColor')} accent={theme.btnStart} />
        ) : (`;

const newBgStr = `        BACKGROUND: (
            <>
                {isAdmin && <ColorRow label="Legacy Admin App Bg" sub="Old bgColor format (Admin only)" value={theme.bgColor} onChange={setColor('bgColor')} accent={theme.btnStart} />}
                <ColorRow label="App Background" sub="Behind tabs & dashboard" value={theme.appBgColor} onChange={setColor('appBgColor')} accent={theme.btnStart} />
                <ColorRow label="Page Background" sub="Behind cards & content" value={theme.pageBgColor} onChange={setColor('pageBgColor')} accent={theme.btnStart} />
            </>
        ),
        LEGACY_BACKGROUND: isAdmin ? (
`;

if (code.includes(bgStr)) {
  code = code.replace(bgStr, newBgStr);
  console.log('Patched BACKGROUND UI');
} else {
  console.log('Could not find BACKGROUND section UI');
}

fs.writeFileSync('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', code);
