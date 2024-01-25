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
                <p>${facility}</p>
                <p>Date</p>
                <p>Time <i class="fa-solid fa-pen-to-square" style = "transform: translateX(30px)"></i></p>
            </div>
            
            <div class="booking-details" style="display: flex; justify-content: space-between">
                <p>${location}</p>
                <p id="booking-date" style = "transform: translateX(-75px);">${date}</p>
                <p>${time}</p>
            </div>
        </div>
    </div>
    `
        table.insertAdjacentHTML('beforeend', cell);


    }
}