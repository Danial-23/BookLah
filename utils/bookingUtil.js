const fs = require('fs').promises;
const { Booking } = require('../models/Booking');
const { readJSON, writeJSON } = require('./userUtil')

// Helper function to validate date format
function isValidDateFormat(date) {

    // Regular expression for "YYYY-MM-DD" format
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    //check if the provided date string matches the pattern defined by the regular expression dateFormatRegex.
    return dateFormatRegex.test(date);
}

// Helper function to validate time format
function isValidTimeFormat(time) {
    // You can use a more sophisticated time validation logic if needed
    // For simplicity, this example checks if the time has a valid format
    return typeof time === 'string' && time.trim() !== '';
}

async function viewUserBookings(req, res) {

    const requestedUsername = req.params.name; // Getting name from the route parameter

    try {
        const allBookings = await readJSON('utils/bookings.json');

        // Filter bookings based on the requested username
        const userBookings = allBookings.filter(booking => booking.name === requestedUsername);

        if (userBookings.length === 0) {
            // If no bookings were found for the specified username
            return res.status(404).json({ message: "No bookings found for the specified user." });
        }

        return res.status(200).json(userBookings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function addBooking(req, res) {
    try {
        const allBookings = await readJSON('utils/bookings.json');

        const name = req.body.name;
        const facility = req.body.facility;
        const date = req.body.date;
        const time = req.body.time;

        // Validate date format
        if (!isValidDateFormat(date)) {
            return res.status(400).json({ message: 'Invalid date format. Please provide a valid date.' });
        }

        // Validate time format
        if (!isValidTimeFormat(time)) {
            return res.status(400).json({ message: 'Invalid time format. Please provide a valid time range.' });
        }


        // Check if the proposed booking already exists in the JSON file
        const bookingExists = allBookings.some(
            (booking) =>
                booking.facility === facility &&
                booking.date === date &&
                booking.time === time
        );

        if (bookingExists) {
            return res.status(400).json({
                message:
                    'The chosen time for this facility is already booked by another person. Please choose another timing.',
            });
        }

        const newBooking = new Booking(name, facility, date, time);

        const updatedBookings = await writeJSON(newBooking, 'utils/bookings.json');

        return res.status(201).json(updatedBookings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function updateBooking(req, res) {
    try {
        const id = req.params.id;
        const facility = req.body.facility;
        const date = req.body.date;
        const time = req.body.time;

         // Validate date format
         if (!isValidDateFormat(date)) {
            return res.status(400).json({ message: 'Invalid date format. Please provide a valid date.' });
        }

        // Validate time format
        if (!isValidTimeFormat(time)) {
            return res.status(400).json({ message: 'Invalid time format. Please provide a valid time range.' });
        }
        
        const allBookings = await readJSON('utils/bookings.json');
        var modified = false;

        // Check if the proposed changes are already booked
        const isBookingConflict = allBookings.some(
            (booking) =>
                booking.id !== id && // Exclude the current booking being updated
                booking.facility === facility &&
                booking.date === date &&
                booking.time === time
        );

        if (isBookingConflict) {
            return res.status(400).json({
                message:
                    'The chosen time for this facility is already booked by another person. Please choose another timing.',
            });
        }

        for (var i = 0; i < allBookings.length; i++) {
            var currentBooking = allBookings[i];
            if (currentBooking.id == id) {
                allBookings[i].facility = facility;
                allBookings[i].date = date;
                allBookings[i].time = time;
                modified = true;
            }
        }

        if (modified) {
            await fs.writeFile('utils/bookings.json', JSON.stringify(allBookings), 'utf8');
            return res.status(201).json({ message: 'Booking Updated Successfully!' });
        } else {
            return res.status(500).json({ message: 'Error occurred, unable to Update!' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


module.exports = { viewUserBookings, addBooking, updateBooking }
