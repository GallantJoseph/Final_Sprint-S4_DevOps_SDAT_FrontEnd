# User Stories / Manual Testing Scenarios – Frontend

**Manual Testing Date:** December 17, 2025

The following user stories represent manual frontend testing scenarios written from the perspective of public users and admin staff. Testing was performed by walking through the application with existing data already present in the database.

---

## Public User (No Login Required)

### View arrivals and departures on the home page
- Open the application  
- Arrivals and Departures buttons are visible  
- A flight table is displayed showing:
  - Flight number
  - Departing airport
  - Arriving airport
  - Airline
  - Date
  - Time
  - Status  

**Result:**  
Flights display correctly and support multiple airports in the database.

---

### Switch between Arrivals and Departures
- On the home page, click the Arrivals and Departures buttons  

**Result:**  
The table updates correctly to show arrival or departure times and refreshes consistently.

---

### View detailed flight information for an airport
- Click an airport card  
- Navigates to the airport’s flight information page  
- View airline, flight number, departure information, and arrival information  
- Return to the home page and select a different airport card  

**Result:**  
Flight information always matches the selected airport.

---

### Search for flights
- Use the search flight option  
- Search by:
  - Flight number
  - Airport
  - Airline
  - Date
  - Status  

**Result:**  
Flights are filtered correctly based on the selected search criteria.

---

### Refresh flight data
- Click the Refresh button  

**Result:**  
The page refreshes and flight data updates successfully.

---

### Navigate informational pages
- From the header, click About Us  
- Navigate through:
  - Who Are We?
  - What We Stand For
  - Our History
  - Sustainability and Responsibility  

**Result:**  
Each section displays clear and readable information.

---

### Submit customer feedback
- Navigate to Customer Feedback  
- Enter name, email, and message  
- Attempt to submit with missing fields  
- Enter all required fields and submit  

**Result:**  
Form validation prevents incomplete submissions and displays a confirmation message on success.

---

### Access staff login
- Click the Admin / Staff Access option  

**Result:**  
User is taken to the Staff Access login page.

---

## Admin / Staff User

### Log in securely
- Enter an incorrect password  
- Enter the correct password  

**Result:**  
Invalid credentials are rejected. Valid credentials allow login and display the Admin Dashboard option in the header.

---

### Access the admin dashboard
- After login, navigate to the Admin Dashboard  

**Result:**  
Sidebar displays tabs for:
- Cities
- Airports
- Gates
- Airlines
- Aircraft
- Flights
- Passengers

All tabs are accessible.

---

### Manage cities
- Create a new city  
- View the city in the list  
- Edit the city and save changes  
- Attempt to delete a city that is still referenced by other entities  

**Result:**  
City supports full CRUD. Deletion is blocked when related airports or passengers exist.

---

### Manage airports
- Create an airport using:
  - Name
  - Three-letter airport code
  - City selected from dropdown  
- View, edit, or delete the airport  

**Result:**  
Airport CRUD works correctly with city relationships.

---

### Manage gates
- Create a gate by entering:
  - Gate number
  - Status
  - Airport  
- View, edit, or delete the gate  

**Result:**  
Gate CRUD works correctly with airport relationships.

---

### Manage airlines
- Create an airline with:
  - Airline name
  - Airline code
  - City  
- View, edit, or delete the airline  

**Result:**  
Airline CRUD works correctly with city relationships.

---

### Manage aircraft
- Create an aircraft with:
  - Aircraft name
  - Passenger capacity
  - Airline  
- View, edit, or delete the aircraft  

**Result:**  
Aircraft CRUD works correctly with airline relationships.

---

### Manage flights
- Create required related entities as needed (cities, airports, gates)  
- Select departure airport and corresponding gate  
- Select arrival airport and corresponding gate  
- Select airline and aircraft  
- Enter flight status, departure date, and arrival date  
- Create flight  

**Result:**  
Flight creation enforces correct relationships and displays complete flight information.

---

### Manage passengers
- Create a passenger  
- Select a flight from the dropdown  
- Book the passenger onto the flight  

**Result:**  
Passenger booking works correctly and references the selected flight.

---

### Verify relational constraints
- Attempt to delete entities that are still referenced by others  

**Result:**  
Deletion is prevented until dependent entities are removed, preserving data integrity.

---

### View newly created flights as a public user
- Log out  
- Return to the home page  

**Result:**  
Newly created flights appear correctly in the arrivals and departures table.

---

### Log out of admin dashboard
- Click Logout  

**Result:**  
User is redirected to the home page and admin functionality is no longer accessible.

---

## Overall Result

All tested functionality works as expected.  
The application is easy to navigate, enforces validation and relationships correctly, and updates data consistently across public and admin views.
