const fs = require('fs').promises;
const { Booking } = require('../models/Booking');
const { readJSON, writeJSON } = require('./UserUtil')

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
        const name = req.body.name;
        const facility = req.body.facility;
        const date = req.body.date;
        const time = req.body.time;

        const newBooking = new Booking(name, facility, date, time);
        const updatedBookings = await writeJSON(newBooking, 'utils/bookings.json');
        return res.status(201).json(updatedBookings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


module.exports = { viewUserBookings, addBooking }
