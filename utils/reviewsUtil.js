const { Reviews } = require('../models/Reviews');
const fs = require('fs').promises;
const { readJSON, writeJSON } = require('./userUtil');

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

async function viewReviewByFacility(req, res) {
    try {

        const facilityId = parseInt(req.params.id); // Convert to integer
        const allReviews = await readJSON('utils/reviews.json');

        const reviewsForFacility = allReviews.filter(review => review.facilityId == facilityId);

        return res.status(200).json(reviewsForFacility);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: error.message });
    }
}

async function viewReviews(req, res) {
    try {
        // Assuming readJSON is a function that reads the file and parses the JSON
        const allReviews = await readJSON('utils/reviews.json');
        return res.status(200).json(allReviews); // Use 200 OK for successful GET requests
    } catch (error) {
        console.error(error); // Log the error for server-side debugging
        return res.status(500).json({ message: "An error occurred while retrieving the reviews." });
    }
}

async function editReview(req, res) {
    try {
        const id = req.params.id;
        const facilityId = req.body.facilityId;
        const username = req.body.username;
        const reviewText = req.body.review;

        const allReviews = await readJSON('utils/reviews.json');
        let modified = false;
        for (let i = 0; i < allReviews.length; i++) {
            const currentReview = allReviews[i];

            if (currentReview.id == id) {
                // Update the review properties
                currentReview.facilityId = facilityId;
                currentReview.username = username;
                currentReview.review = reviewText;

                modified = true;
                break;
            }
        }

        if (modified) {
            await fs.writeFile('utils/reviews.json', JSON.stringify(allReviews), 'utf8');
            return res.status(201).json({ message: 'Review modified successfully!' });
        } else {
            return res.status(500).json({ message: 'Error occurred, unable to modify the review!' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { addReview, viewReviewByFacility, viewReviews, editReview };