import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(err))
        page.on("console", lambda msg: errors.append(msg) if msg.type == "error" else None)

        # By-pass auth properly by directly navigating
        page.goto('http://localhost:5173/')
        page.evaluate("""
            localStorage.setItem('iic_user', JSON.stringify({
                uid: 'test_user',
                email: 'test@example.com',
                displayName: 'Test User'
            }));
            localStorage.setItem('has_seen_onboarding', 'true');
            localStorage.setItem('app_ready', 'true');
        """)

        # Reload to apply mock
        page.reload()
        time.sleep(5)

        if errors:
            print("Errors detected:")
            for err in errors:
                print(err)
        else:
            print("No errors detected.")

        page.screenshot(path="crash_check.png")

        browser.close()

verify()
