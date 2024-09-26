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

# Define column titles
column_titles = ["Program Name", "University Name", "Degree", "Program Code", "Grade Range", "Prerequisites"]

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
        writer.writerow(column_titles)

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

def scrape_requirements():
    try: 
        # Switch to the Overview tab if not already active
        overview_tab = WebDriverWait(browser, 10).until(
            EC.element_to_be_clickable((By.LINK_TEXT, 'Overview'))
        ) 
        if "is-active" not in overview_tab.get_attribute("class"):
            overview_tab.click()
            time.sleep(3)  # Wait for the tab to load
        
        # Scrape overview information
        degree = browser.find_element(By.XPATH, "//dt[text()='Degree']/following-sibling::dd").text.strip()
        program_code = browser.find_element(By.XPATH, "//dt[text()='OUAC Program Code']/following-sibling::dd").text.strip()
        grade_range = browser.find_element(By.XPATH, "//dt[text()='Grade Range']/following-sibling::dd").text.strip()

        # Switch to the Requirements tab
        requirements_tab = WebDriverWait(browser, 10).until(
            EC.element_to_be_clickable((By.LINK_TEXT, 'Requirements'))
        ) 
        if "is-active" not in requirements_tab.get_attribute("class"):
            requirements_tab.click()
            time.sleep(3)  # Wait for the tab to load 

        # Scrape prerequisites (correct selector for list inside tabbed section)
        prereq_list = browser.find_elements(By.CSS_SELECTOR, ".tabbed-subsection ul li")
        prereq = ", ".join([li.text.strip() for li in prereq_list])

        return degree, program_code, grade_range, prereq
    
    except Exception as e: 
        print(f"Failed to extract program information: {e}")
        return [""] * 4

def write_to_csv(rows):
    with open(output_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(rows)

def scrape_page():
    # Find the elements
    program_elements = browser.find_elements(By.CSS_SELECTOR, 'h2.result-heading a')
    university_elements = browser.find_elements(By.CSS_SELECTOR, 'h3.result-subheading a')
    
    print(f"Found {len(program_elements)} programs on this page")
    
    new_programs = set()
    rows_to_write = [] 

    for index, (program_element, university_element) in enumerate(zip(program_elements, university_elements)):
        program = program_element.text.strip()
        university = university_element.text.strip()

        print(f"Processing program {index + 1}: {program} at {university}")

        if program and program not in existing_programs:
            print(f"New program found: {program}")
            # Store the current window handle
            main_window = browser.current_window_handle

            # Get the program link
            program_link = program_element.get_attribute('href')
            print(f"Opening link: {program_link}")

            # Open the program link in a new tab
            browser.execute_script("window.open(arguments[0], '_blank');", program_link)
            
            # Wait for the new tab to open and switch to it
            WebDriverWait(browser, 10).until(EC.number_of_windows_to_be(2))
            browser.switch_to.window(browser.window_handles[-1])
            print("Switched to program page")

            # Scrape all the details from the overview and requirements tabs
            degree, program_code, grade_range, prereq = scrape_requirements()

            print(f"Scraped details: Degree: {degree}, Code: {program_code}, Grade Range: {grade_range}, prereq: {prereq}")

            # Add new programs and associated information to the list
            new_programs.add(program)
            rows_to_write.append([program, university, degree, program_code, grade_range, prereq])

            # Write the new data to the CSV file
            if rows_to_write:
                write_to_csv(rows_to_write)

            # Close the tab and switch back to the main window
            browser.close()
            browser.switch_to.window(main_window)
            print("Closed program page and switched back to main page")
        else:
            print(f"Program already exists or is empty, skipping: {program}")

    return new_programs

try:
    browser.get("https://www.ouinfo.ca/programs/all/?sort=university&search=")
    time.sleep(5)  # Wait for initial load

    # Close the pop-up if it appears
    close_popup()

    all_new_programs = set()
    page_number = 1
    while True:
        print(f"\nProcessing page {page_number}")
        # Scroll and wait for all content to load on the current page
        scroll_and_wait()

        # Scrape the current page
        new_programs = scrape_page()
        all_new_programs.update(new_programs)

        # Check if there's a next page
        try:
            next_button = browser.find_element(By.CSS_SELECTOR, 'a.next-page')
            next_button.click()
            print(f"Clicked next page button. Moving to page {page_number + 1}")
            time.sleep(5)  # Wait for the next page to load
            close_popup()  # Close any popups that might appear after page change
            page_number += 1
        except NoSuchElementException:
            print("No more pages to scrape")
            break

    # Print results
    print(f"Total new programs found: {len(all_new_programs)}")
    print(f"Total programs in file: {len(existing_programs) + len(all_new_programs)}")
    print("First 10 new programs:")
    print(list(all_new_programs)[:10])

finally:
    browser.quit()
