function getBookingsData() {

    var booking_array = [];

    var get_book_url = "/view-user-booking" + "/" + sessionStorage.getItem("username");
    var getBook = new XMLHttpRequest();

    getBook.open("GET", get_book_url, true);
    getBook.setRequestHeader("Content-Type", "application/json");
    getBook.onload = function () {

        booking_array = JSON.parse(getBook.responseText);
        console.log(booking_array);
        displayUserBookings(booking_array);
    }

    getBook.send();
}

function displayUserBookings(booking_array) {

    var table = document.getElementById('bookingsTable');

    table.innerHTML = "";

    // Check if the booking array is empty
    if (booking_array.message === 'No bookings found for the specified user.') {

        table.innerHTML = "<h1 style='margin-top: 50px; margin-left: 30%; color: red'; >No Bookings Found.</h1>";
        return; // Exit the function
    }

    var totalBookings = booking_array.length;

    for (var count = 0; count < totalBookings; count++) {

        var facility = booking_array[count].facility;

        let location;
        if (facility === 'Badminton Court') {
            location = 'Tampines Walk, Level 3, Singapore 528523'
        } else if (facility === 'Football Field') {
            location = '119A Kim Tian Rd, Singapore 169263'
        } else if (facility === 'ActiveSG Pasir Ris Sport Centre Swimming Pool') {
            location = '120 Pasir Ris Central, Singapore 519640'
        }

        var date = booking_array[count].date;
        var time = booking_array[count].time;

        var cell = `<div class="booking-card" style="width: 100%; height: 120px; border: 1px solid black; border-radius: 5px; padding-left: 30px; padding-right: 30px; margin-bottom: 20px; margin-top: 20px; background-color: white">
        <div class="card-body">
        
            <div class="top-headers" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-weight: bold;">
                <p style="width: 400px;">${facility}</p>
                <p id="date-title">Date</p>
                <p>Time <i class="fa-solid fa-pen-to-square" style = "transform: translateX(30px)"></i></p>
            </div>
            
            <div class="booking-details" style="display: flex; justify-content: space-between">
                <p style="width: 425px;">${location}</p>
                <p id="booking-date" style = "">${date}</p>
                <p>${time}</p>
            </div>
        </div>
    </div>
    `
        table.insertAdjacentHTML('beforeend', cell);


    }
}

// Function to open the booking modal and pass facility name and location
function openBookingModal() {
    // Retrieve the facility name and location from the first modal
    var facilityName = document.getElementById('name').textContent;
    var location = document.getElementById('address').textContent;

    // Set the retrieved values as the values of the input fields in the booking modal
    document.getElementById('facility-name').value = facilityName;
    document.getElementById('facility-location').value = location;

    // Open the booking modal
    $('#bookingModal').modal('show');
}

// Function to extract the starting hour from the time slot
function getTimeFromSlot(timeSlot) {
    const timeRange = timeSlot.split(" ")[0].split("-");
    const startTime = parseInt(timeRange[0]);
    return startTime;
}

function addBooking() {
    const username = sessionStorage.getItem('username');

    // Get selected date and time
    const selectedDate = document.getElementById("bookedDate").value;
    const selectedTime = document.getElementById("bookedTime").value;

    // Check if date and time are selected
    if (!selectedDate || selectedTime === 'Select Timing') {
        // Display alert if date or time is not selected
        alert("Please select a date and time before submitting.");
        return;
    }

    // Convert the selected date to a Date object
    const dateObject = new Date(selectedDate);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for proper comparison

    // Check if the selected date is in the past
    if (dateObject < today) {
        alert("You cannot book for a past date.");
        return;
    }

    // Get current time
    const currentTime = new Date().getHours();

    const checkToday = new Date(dateObject);
    checkToday.setHours(0, 0, 0, 0);

    // Check if the selected date is today
    const isToday = checkToday.getDate() === today.getDate();

    // Check if the selected time is before the current time
    if (isToday && getTimeFromSlot(selectedTime) < currentTime) {
        alert("The selected time slot is not available for booking. Please choose another time slot.");
        return;
    }

    // Convert the selected date to the desired format "DD/MM/YY"
    const formattedDate = `${dateObject.getDate()}/${dateObject.getMonth() + 1}/${dateObject.getFullYear().toString().slice(-2)}`;

    // Create JSON data for the request
    const jsonData = {
        name: username,
        facility: document.getElementById("facility-name").value,
        date: formattedDate,
        time: selectedTime
    };

    // Create and send the request
    const request = new XMLHttpRequest();
    request.open("POST", "/add-booking", true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function () {
        const response = JSON.parse(request.responseText);
        console.log(response);

        if (response.message === "The chosen time for this facility is already booked by another person. Please choose another timing.") {
            alert("The chosen time for this facility is already booked by another person. Please choose another timing.")
        } else {
            $('#bookingModal').modal('hide'); // Close the modal
            $('#proModal').modal('hide'); // Close the modal
            alert("Facility Booked Successfully!")
            document.getElementById("bookedDate").value = '';
            document.getElementById("bookedTime").value = 'Select Timing';
        }
    };
    request.send(JSON.stringify(jsonData));
}