const fs = require('fs');
let code = fs.readFileSync('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'utf8');

const str = `        LEGACY_BACKGROUND: isAdmin ? (

            <div className="py-4 px-2 text-center">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-white/70 text-xs font-semibold">Background Locked</p>
                <p className="text-white/40 text-[10px] mt-1">White mode mein background hamesha white rahta hai. Sirf admin is setting ko change kar sakta hai.</p>
            </div>
        ),`;

code = code.replace(str, '');
fs.writeFileSync('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', code);
console.log('Fixed legacy background UI bug');
