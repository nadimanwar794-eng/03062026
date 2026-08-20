import time
import json
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # By-pass auth properly by directly navigating
        page.goto('http://localhost:5173/')
        # Set user in localStorage and force reload
        page.evaluate("""
            localStorage.setItem('iic_user', JSON.stringify({
                uid: 'test_user',
                email: 'test@example.com',
                displayName: 'Test User'
            }));
            localStorage.setItem('has_seen_onboarding', 'true');
            localStorage.setItem('app_ready', 'true');
            window.location.reload();
        """)

        # Wait for reload
        time.sleep(5)

        page.screenshot(path="dashboard_loaded3.png")

        browser.close()

verify()
