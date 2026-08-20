const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 3. Update useEffect loading initial state
content = content.replace(
  /            setTheme\(\{ \.\.\.DEFAULT_THEME, \.\.\.user.personalTheme \}\);/,
  `            setTheme({ ...DEFAULT_THEME, ...user.personalTheme });`
);

// We need to inject UI tabs/sections for Nav Colors and Wallpapers
// Let's find a good spot to insert these new groups in the JSX.
// First, add the File upload logic helper
const fileUploadLogic = `
    const handleFileUpload = (field: keyof ThemeState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 700 * 1024) {
            toast.error('File size must be under 700KB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setTheme(prev => ({ ...prev, [field]: reader.result as string }));
            setHasUnsavedChanges(true);
        };
        reader.readAsDataURL(file);
    };
`;

content = content.replace(
  /    const handleColorChange = \(field: keyof ThemeState\) => \(e: React.ChangeEvent<HTMLInputElement>\) => \{/,
  fileUploadLogic + '\n    const handleColorChange = (field: keyof ThemeState) => (e: React.ChangeEvent<HTMLInputElement>) => {'
);

fs.writeFileSync(filepath, content);
console.log("ThemeCustomizer phase 2 updated.");
