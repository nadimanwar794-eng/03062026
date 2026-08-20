import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # By-pass auth
        page.goto('http://localhost:5173/')
        page.evaluate("""
            localStorage.setItem('iic_user', JSON.stringify({uid: 'test_user'}));
            localStorage.setItem('has_seen_onboarding', 'true');
            localStorage.setItem('app_ready', 'true');
        """)

        # Load dashboard
        page.goto('http://localhost:5173/')

        # Wait for splash screen to disappear
        time.sleep(10)

        page.screenshot(path="dashboard_loaded2.png")

        # Try to click Revision tab
        try:
            page.locator('button').filter(has_text="Revision").click(timeout=5000)
            time.sleep(2)
            page.screenshot(path="revision_tab_click2.png")
        except Exception as e:
            print("Could not click Revision:", e)

        try:
            # Open Profile tab
            page.locator('button').filter(has_text="Profile").click(timeout=5000)
            time.sleep(2)
            page.screenshot(path="profile_tab2.png")

            # Click Theme Studio button inside Profile
            page.locator('button').filter(has_text="Theme").click(timeout=5000)
            time.sleep(2)
            page.screenshot(path="theme_studio_open.png")

            # Click Wallpapers tab
            page.locator('button').filter(has_text="Wallpapers").click(timeout=3000)
            time.sleep(1)
            page.screenshot(path="theme_studio_wallpapers.png")

            # Click Navigation tab (if named Navigation or Tab colors)
            page.locator('button').filter(has_text="Navigation").click(timeout=3000)
            time.sleep(1)
            page.screenshot(path="theme_studio_nav.png")
        except Exception as e:
            print("Could not navigate in Profile:", e)

        browser.close()

verify()
