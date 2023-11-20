const fs = require('fs').promises;
const { readJSON, writeJSON } = require('./UserUtil')

async function viewUserBookings(req, res) {

    const requestedUsername = req.params.name; // Assuming the username is part of the request parameters

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


module.exports = { viewUserBookings }
