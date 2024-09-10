from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time
import random
import csv
import os

# Initialize the Chrome browser
options = webdriver.ChromeOptions()
options.add_argument("--window-size=1920,1080")
browser = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
browser.implicitly_wait(10)  # Set implicit wait

# File to store programs
output_file = 'ontario_university_programs.csv'

# Load existing programs if file exists
existing_programs = set()
if os.path.exists(output_file):
    with open(output_file, 'r', newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        existing_programs = set(row[0] for row in reader)

try:
    browser.get("https://www.ouinfo.ca/programs/all/?sort=university&search=")
    time.sleep(5)  # Wait for initial load

    # Function to scroll and wait for new content
    def scroll_and_wait():
        last_height = browser.execute_script("return document.body.scrollHeight")
        for _ in range(10):  # Scroll up to 10 times
            actions = ActionChains(browser)
            actions.move_to_element(browser.find_element(By.TAG_NAME, "body")).perform()
            actions.send_keys_to_element(browser.find_element(By.TAG_NAME, "body"), "\ue015").perform()
            time.sleep(random.uniform(1, 3))  # Random wait between 1-3 seconds
            new_height = browser.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    # Scroll and wait for all content to load
    scroll_and_wait()

    # Explicit wait for elements
    WebDriverWait(browser, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'h3.result-subheading a'))
    )

    # Find the elements
    program_elements = browser.find_elements(By.CSS_SELECTOR, 'h3.result-subheading a')

    # Extract unique programs
    new_programs = set()
    for element in program_elements:
        program = element.text.strip()
        if program and program not in existing_programs:
            new_programs.add(program)

    # Write new programs to file
    with open(output_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for program in new_programs:
            writer.writerow([program])

    # Print results
    print(f"Total new programs found: {len(new_programs)}")
    print(f"Total programs in file: {len(existing_programs) + len(new_programs)}")
    print("First 10 new programs:")
    print(list(new_programs)[:10])

finally:
    browser.quit()
