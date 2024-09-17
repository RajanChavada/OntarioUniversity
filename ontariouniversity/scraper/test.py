import csv

# File path
csv_file = 'ontario_university_programs.csv'

# Function to read and display the first few rows
def display_first_rows(num_rows=5):
    with open(csv_file, 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        print(f"Displaying the first {num_rows} programs:")
        
        for i, row in enumerate(reader, 1):
            if i > num_rows:
                break
            
            print(f"\nProgram {i}:")
            print(f"Program Name: {row['Program Name']}")
            print(f"University: {row['University Name']}")
            print(f"Degree: {row['Degree']}")
            print(f"Program Code: {row['Program Code']}")
            print(f"Grade Range: {row['Grade Range']}")
            print(f"Prerequisites: {row['Prerequisites']}")
        
        print(f"\nTotal number of programs displayed: {min(i, num_rows)}")

# Main execution
if __name__ == "__main__":
    try:
        display_first_rows()
    except FileNotFoundError:
        print(f"Error: The file '{csv_file}' was not found.")
    except KeyError as e:
        print(f"Error: Column {e} not found. Make sure the column names in the CSV file match the expected names.")
    except Exception as e:
        print(f"An error occurred: {e}")