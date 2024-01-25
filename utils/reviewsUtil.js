const { Reviews } = require('../models/Reviews');
const fs = require('fs').promises;
const { readJSON, writeJSON } = require('./userUtil');

async function viewUserReviews(req, res) {
    try {
        const username = req.params.username; // Ensure the param name matches your route definition

        // Check if the user exists
        const users = await readJSON('utils/users.json');
        const userExists = users.some(user => user.username === username);

        if (!userExists) {
            // If the user doesn't exist, return a 404 Not Found
            return res.status(404).json({ message: 'User not found.' });
        }

        const allReviews = await readJSON('utils/reviews.json');
        const reviewsByUser = allReviews.filter(review => review.username === username);

        // If there are no reviews for the user, return an empty array with a 200 OK status
        return res.status(200).json(reviewsByUser);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "An error occurred while retrieving the user's reviews." });
    }
}


async function viewReviewByFacility(req, res) {
    try {
        const facilityId = parseInt(req.params.facilityId); // Convert to integer

        // Check if the facility exists
        const facilities = await readJSON('utils/facilities.json');
        const facilityExists = facilities.some(facility => facility.facilityId === facilityId);

        if (!facilityExists) {
            // If the facility doesn't exist, return a 404 Not Found
            return res.status(404).json({ message: 'Facility not found.' });
        }

        const allReviews = await readJSON('utils/reviews.json');
        const reviewsForFacility = allReviews.filter(review => review.facilityId === facilityId);

        // If there are no reviews for the facility, return an empty array with a 200 OK status
        return res.status(200).json(reviewsForFacility);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: error.message });
    }
}

async function addReview(req, res) {
    try {
        // Retrieve review data from request body
        const facilityId = parseInt(req.body.facilityId);
        const { username, review: reviewBody } = req.body;

        // Check for required fields
        if (!facilityId || !username || typeof reviewBody !== 'string') {
            return res.status(400).json({ message: "All fields must be provided." });
        }

        // Check if the review text is empty and return an error
        if (!reviewBody.trim()) {
            return res.status(400).json({ message: 'Review text cannot be empty.' });
        }

        // Check for valid user
        const users = await readJSON('utils/users.json');
        const userExists = users.some(user => user.username === username);
        if (!userExists) {
            return res.status(400).json({ message: "Invalid user. Review could not be added." });
        }

        if (!facilityId || !username || !reviewBody) {
            return res.status(400).json({ message: "All fields must be provided." });
        }

        // Check for a valid facility
        const facilities = await readJSON('utils/facilities.json');
        const facilityExists = facilities.some(facility => facility.facilityId === facilityId); // Corrected property name
        if (!facilityExists) {
            return res.status(400).json({ message: "Invalid facility. Review could not be added." });
        }

        // Read the existing reviews
        const reviews = await readJSON('utils/reviews.json');

        // Check if the user has already made a review for the facility
        const existingReview = reviews.find(review => review.username === username && review.facilityId === facilityId);
        if (existingReview) {
            return res.status(400).json({ message: "User has already made a review for this facility." });
        }

        const currentDate = new Date().toISOString();
        const datePosted = currentDate.split('T')[0];

        const newReview = new Reviews(facilityId, username, reviewBody, datePosted);

        // Create a new review instance and add it to the array
        reviews.push(newReview);

        // Save the updated reviews back to the JSON file
        const updatedReview = await writeJSON(newReview, 'utils/reviews.json');

        // Return the new review as the response

        return res.status(201).json(updatedReview);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "An error occurred while adding the review." });
    }
}

async function editReview(req, res) {
    try {
        const facilityId = req.body.facilityId;
        const username = req.body.username;
        const reviewBody = req.body.review;

        // Check if the review text is empty and return an error if so
        if (!reviewBody.trim()) {
            return res.status(400).json({ message: 'Review text cannot be empty.' });
        }

        const allReviews = await readJSON('utils/reviews.json');

        const reviewIndex = allReviews.findIndex(review =>
            review.facilityId === facilityId && review.username === username
        );

        if (reviewIndex === -1) {
            // Check if a review by the user for the facility does not exist
            return res.status(404).json({ message: 'Review does not exist.' });
        }

        // Update the review properties
        allReviews[reviewIndex].review = reviewBody;
        allReviews[reviewIndex].datePosted = new Date().toISOString().substring(0, 10);

        await fs.writeFile('utils/reviews.json', JSON.stringify(allReviews), 'utf8');
        return res.status(200).json({ message: 'Review modified successfully!' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'An error occurred while attempting to edit the review.' });
    }
}


module.exports = { addReview, viewReviewByFacility, viewUserReviews, editReview };