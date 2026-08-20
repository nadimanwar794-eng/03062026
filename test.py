import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    text = f.read()

print("Syntax error or not?")

import subprocess
import os

try:
    output = subprocess.check_output(
        ["pnpm", "-F", "@workspace/iic-study-app", "run", "typecheck"],
        stderr=subprocess.STDOUT
    )
    print("TypeScript compiles successfully.")
except subprocess.CalledProcessError as e:
    print("TypeScript error:")
    print(e.output.decode('utf-8'))
