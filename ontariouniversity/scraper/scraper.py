from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Initialize the Chrome browser
browser = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()))
browser.implicitly_wait(10)  # Set implicit wait

program_list = []

try:
    browser.get("https://www.ouinfo.ca/programs/all/?sort=university&search=")

    # Scroll to bottom of the page to ensure all content loads
    browser.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(5)  # Allow some time for lazy loading

    # Explicit wait for elements
    WebDriverWait(browser, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'h3.result-subheading a'))
    )

    # Find the elements
    program_elements = browser.find_elements(By.CSS_SELECTOR, 'h3.result-subheading a')

    # Extract the text of each element
    program_list = [element.text.strip() for element in program_elements if element.text.strip()]

    # Print results
    print(program_list)

finally:
    browser.quit()
