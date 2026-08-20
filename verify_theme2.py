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
        """)

        # Load dashboard
        page.goto('http://localhost:5173/')
        time.sleep(3)

        page.screenshot(path="dashboard_loaded.png")

        # Instead of getting by role button, we click using the DOM selectors since roles can be ambiguous.
        # We can look for the icons or bottom nav structure. We'll search for 'Revision' text
        try:
            page.get_by_text("Revision", exact=True).click(timeout=3000)
            time.sleep(2)
            page.screenshot(path="revision_tab_click.png")
        except Exception as e:
            print("Could not click Revision:", e)

        try:
            # Open Theme Customizer
            page.get_by_test_id("profile-tab-button").click(timeout=3000)
            time.sleep(1)
        except Exception as e:
            # Fallback
            page.evaluate("document.querySelector('button[aria-label=\"Profile\"]').click()")
            time.sleep(1)

        page.screenshot(path="profile_tab.png")

        browser.close()

verify()
