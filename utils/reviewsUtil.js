const { Reviews } = require('../models/Reviews');
const fs = require('fs').promises;
const { readJSON, writeJSON } = require('./UserUtil');

async function addReview(req, res) {
    try {
        // Retrieve review data from request body
        const facilityId = req.body.facilityId;
        const username = req.body.username;
        const reviewBody = req.body.review;

        // Create a new review instance
        const newReview = new Reviews(facilityId, username, reviewBody);

        // Read the existing reviews
        const reviews = await readJSON('utils/reviews.json');

        // Add the new review to the array
        reviews.push(newReview);

        // Save the updated reviews back to the JSON file
        const updatedReview = await writeJSON(newReview, 'utils/reviews.json');

        // Return the new review as the response
        return res.status(201).json(updatedReview);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


module.exports = {addReview}; 