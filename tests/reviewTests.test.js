const { expect } = require('chai');
const { describe, it } = require('mocha');
const {  viewReviewByFacility, viewUserReviews, addReview, editReview } = require('../utils/reviewsUtil');
const sinon = require('sinon');
const fs = require('fs').promises;

describe('Testing viewReviewByFacility Function', () => {
    it('Should return all reviews by facility', async () => {
        const req = { params: { facilityId: '1' } };
        const res = {
            status: function(code) { expect(code).to.equal(200); return this; },
            json: function(data) { expect(data).to.be.an('array').that.is.not.empty; }
        };

        await viewReviewByFacility(req, res);
    });

    it('Should return "No review" for facilities with no review', async () => {
        const req = { params: { facilityId: '2' } };
        const res = {
            status: function(code) { expect(code).to.equal(200); return this; },
            json: function(data) { expect(data).to.be.an('array').that.is.empty; }
        };

        await viewReviewByFacility(req, res);
    });

    it('Should return an error for a facility ID that does not exist', async () => {
        const req = { params: { facilityId: 'non-existent-id' } };
        const res = {
            status: function(code) { expect(code).to.equal(404); return this; },
            json: function(data) { expect(data).to.have.property('message', 'Facility not found.'); }
        };

        await viewReviewByFacility(req, res);
    });
});

describe('Testing viewUserReviews Function', () => {
    it('Should return all reviews by specified user', async () => {
        const req = { params: { username: 'FirstTo' } };
        const res = {
            status: function(code) { expect(code).to.equal(200); return this; },
            json: function(data) { expect(data).to.be.an('array').that.is.not.empty; }
        };

        await viewUserReviews(req, res);
    });

    it('Should return "No Review" by users with no reviews', async () => {
        const req = { params: { username: 'johnny' } };
        const res = {
            status: function(code) { expect(code).to.equal(200); return this; },
            json: function(data) { expect(data).to.be.an('array').that.is.empty; }
        };

        await viewUserReviews(req, res);
    });

    it('Should return an error for a username that does not exist', async () => {
        const req = { params: { username: 'non-existent-user' } };
        const res = {
            status: function(code) { expect(code).to.equal(404); return this; },
            json: function(data) { expect(data).to.have.property('message', 'User not found.'); }
        };

        await viewUserReviews(req, res);
    });
});


describe('Testing Add Review Function', () => {

    const reviewFilePath = 'utils/reviews.json';
    var orgContent = "";

    beforeEach(async () => {
        orgContent = await fs.readFile(reviewFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });

    afterEach(async () => {
        await fs.writeFile(reviewFilePath, JSON.stringify(orgContent), 'utf8');
    });

    it('Should add a new review successfully', async () => {
        const req = {
            body: {
                "facilityId": 1,
                "username": "johnny",
                "review": "This is a sample review for the facility. The experience was great!"
            },
        };

        const res = {
            status: function (code) {
                expect(code).to.equal(201);
                return this;
            },
            json: function (data) {
                expect(data).to.have.lengthOf(orgContent.length + 1);
                expect(data[orgContent.length].facilityId).to.equal(req.body.facilityId);
                expect(data[orgContent.length].username).to.equal(req.body.username);
                expect(data[orgContent.length].review).to.equal(req.body.review);
            },
        };

        await addReview(req, res);
    });

    it('Should not add review due to incomplete input', async () => {
        const req = {
            body: {
                "facilityId": 1,
                "username": "johnny",
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.not.equal(undefined);
            },
        };
        await addReview(req, res);
    });

    it('Should not to add review if user already had done a review', async () => {
        const req = {
            // a review that is in the JSON file
            body: {
                "facilityId": 1,
                "username": "FirstTo",
                "review": "This is a sample review for the facility. The experience was great!"
            },
        };

        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('User has already made a review for this facility.');
            },
        };

        await addReview(req, res);
    });

    it('Should handle server errors when adding a review', async () => {
        const req = {
            body: {
                facilityId: 1,
                username: "johnny",
                review: "A server error is going to occur"
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal("An error occurred while adding the review.");
            },
        };
    
        // Simulate a server error by forcing readJSON to throw an error
        sinon.stub(fs, 'readFile').throws(new Error('Simulated file read error'));
    
        await addReview(req, res);
    
        // Restore the original function to avoid side effects
        sinon.restore();
    });
});

describe('Testing Edit Review Function', () => {
    const reviewFilePath = 'utils/reviews.json';
    var originalContent = "";

    beforeEach(async () => {
        originalContent = await fs.readFile(reviewFilePath, 'utf8');
        originalContent = JSON.parse(originalContent);
    });

    afterEach(async () => {
        await fs.writeFile(reviewFilePath, JSON.stringify(originalContent), 'utf8');
    });

    it('Should edit a review successfully', async () => {
        const req = {
            body: {
                facilityId: 1,
                username: 'FirstTo',
                review: 'Updated review text goes here'
            },
        };

        const res = {
            status: function (code) {
                expect(code).to.equal(200);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Review modified successfully!');
            },
        };

        await editReview(req, res);
    });

    it('Should not edit a review due to empty review body', async () => {
        const req = {
            body: {
                facilityId: 1,
                username: 'FirstTo',
                review: ''
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Review text cannot be empty.'); // Match this message to the actual one
            },
        };

        await editReview(req, res);
    });

    it('Should not allow editing a review that was not made by the user', async () => {
        const req = {
            body: {
                facilityId: 1, // Assuming facilityId 1 does not have a review by 'johnny'
                username: 'johnny', // A username that didn't make the review
                review: 'Attempt to edit someone else\'s review'
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(404); // The actual status code should be 404 if the review is not found
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Review does not exist.'); // This should match the actual message returned by the function
            },
        };
    
        await editReview(req, res);
    });
    
    it('Should handle server errors when editing a review', async () => {
        const req = {
            body: {
                facilityId: 1,
                username: "FirstTo",
                review: "A server error is going to occur"
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal("An error occurred while attempting to edit the review.");
            },
        };
    
        // Simulate a server error by forcing readJSON to throw an error
        sinon.stub(fs, 'readFile').throws(new Error('Simulated file read error'));
    
        await editReview(req, res);
    
        // Restore the original function to avoid side effects
        sinon.restore();
    });
});

