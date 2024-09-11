from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
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
        next(reader, None)  # Skip header
        existing_programs = set(row[0] for row in reader)

# Adding headers if file doesn't exist 
if not os.path.exists(output_file): 
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Program Name", "University Name"])

def close_popup():
    try:
        # Wait for the popup to appear and find the close button
        close_button = WebDriverWait(browser, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.close-button"))
        )
        close_button.click()
        print("Pop-up closed successfully")
    except (TimeoutException, NoSuchElementException):
        print("No pop-up found or unable to close")

try:
    browser.get("https://www.ouinfo.ca/programs/all/?sort=university&search=")
    time.sleep(5)  # Wait for initial load

    # Close the pop-up if it appears
    close_popup()

    # Function to scroll and wait for new content
    def scroll_and_wait():
        last_height = browser.execute_script("return document.body.scrollHeight")
        while True:
            browser.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(random.uniform(2, 4))  # Random wait between 2-4 seconds
            close_popup()  # Check for pop-up after each scroll
            new_height = browser.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    # Scroll and wait for all content to load
    scroll_and_wait()

    # Explicit wait for elements
    WebDriverWait(browser, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'h2.result-heading a'))
    )

    # Find the elements
    program_elements = browser.find_elements(By.CSS_SELECTOR, 'h2.result-heading a')
    university_elements = browser.find_elements(By.CSS_SELECTOR, 'h3.result-subheading a')
    
    # Extract unique programs
    new_programs = set()
    rows_to_write = [] 

    for program_element, university_element in zip(program_elements, university_elements):
        program = program_element.text.strip()
        university = university_element.text.strip()

        if program and program not in existing_programs:
            new_programs.add(program)
            rows_to_write.append([program, university])

    # Write new programs to file
    with open(output_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for row in rows_to_write:
            writer.writerow(row)

    # Print results
    print(f"Total new programs found: {len(new_programs)}")
    print(f"Total programs in file: {len(existing_programs) + len(new_programs)}")
    print("First 10 new programs:")
    print(list(new_programs)[:10])

finally:
    browser.quit()
