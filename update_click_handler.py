import re

file_path = "artifacts/iic-study-app/src/components/StudentDashboard.tsx"
with open(file_path, "r") as f:
    content = f.read()

search_pattern = r"""                      onClick=\{\(\) => \{ lucentInitialTabRef\.current = \{ tab: 'NOTES', viewMode: 'chunk' \}; tryOpenLucentNote\(plEntry, idx\); \}\}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 active:scale-\[0\.98\] transition-all" """

replacement = """                      onClick={() => { lucentInitialTabRef.current = { tab: 'NOTES', viewMode: 'chunk' }; tryOpenLucentNote(plEntry, idx, { force: true }); }}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-all" """

content = re.sub(search_pattern, replacement, content)

with open(file_path, "w") as f:
    f.write(content)
