const { describe, it } = require('mocha');
const { expect } = require('chai');
const fs = require('fs').promises;
const { viewUserBookings, addBooking, updateBooking } = require('../utils/bookingUtil')

describe('Testing viewUserBookings Function', () => {
    const bookingsFilePath = 'utils/bookings.json';
    var orgContent = "";

    beforeEach(async () => {
        orgContent = await fs.readFile(bookingsFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });

    it('Should return bookings for the specified user', async () => {
        const req = {
            params: { name: 'johnny' },
        };

        const res = {
            status: function (code) {
                expect(code).to.equal(200);
                return this;
            },
            json: function (data) {
                expect(Array.isArray(data)).to.be.true;
                expect(data).to.have.lengthOf.at.least(1);
                expect(data[0].name).to.equal(req.params.name);
            },
        };

        await viewUserBookings(req, res);
    });

    it('Should return "No bookings found for the specified user." for users with no bookings', async () => {
        const req = {
            params: { name: 'NonExistentUser' },
        };

        const res = {
            status: function (code) {
                expect(code).to.equal(404);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('No bookings found for the specified user.');
            },
        };

        await viewUserBookings(req, res);
    });

});

describe('Testing addBookings Function', () => {
    const bookingsFilePath = 'utils/bookings.json';
    var orgContent = "";

    beforeEach(async () => {
        orgContent = await fs.readFile(bookingsFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });

    afterEach(async () => {
        await fs.writeFile(bookingsFilePath, JSON.stringify(orgContent), 'utf8');
    });

    it('Should add a new booking successfully', async () => {
        const req = {
            body: {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '28/11/23',
                time: '9am - 11pm',
            },
        };

        const res = {
            status: function (code) {
                expect(code).to.equal(201);
                return this;
            },
            json: function (data) {
                expect(data).to.have.lengthOf(orgContent.length + 1);
                expect(data[orgContent.length].name).to.equal(req.body.name);
                expect(data[orgContent.length].facility).to.equal(req.body.facility);
                expect(data[orgContent.length].date).to.equal(req.body.date);
                expect(data[orgContent.length].time).to.equal(req.body.time);
            },
        };

        await addBooking(req, res);
    });

    it('Should not be able to add booking due to invalid date format or missing date', async () => {
        const req = {
            body: {
                name: "johnny",
                facility: 'Badminton Court',
                date: '28/11',
                time: '1pm - 3pm',
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Invalid date format. Please provide a valid date.');
            },
        };
        await addBooking(req, res);
    });

    it('Should not be able to add booking due to invalid time format or missing time', async () => {
        const req = {
            body: {
                name: "johnny",
                facility: 'Badminton Court',
                date: '28/11/23',
                
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Invalid time format. Please provide a valid time range.');
            },
        };
        await addBooking(req, res);
    });

    it('Should not be able to add booking for facility if timing is already booked', async () => {
        const req = {
            // a booking that is in the bookings JSON file
            body: {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '25/11/23',
                time: '9pm - 11pm',
            },
        };

        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('The chosen time for this facility is already booked by another person. Please choose another timing.');
            },
        };

        await addBooking(req, res);
    });

});

describe('Testing updateBookings Function', () => {
    const bookingsFilePath = 'utils/bookings.json';
    var orgContent = "";

    beforeEach(async () => {
        orgContent = await fs.readFile(bookingsFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });

    afterEach(async () => {
        await fs.writeFile(bookingsFilePath, JSON.stringify(orgContent), 'utf8');
    });

    it('Should update booking successfully', async () => {
        const req = {
            body: {
                facility: "Badminton Court",
                date: "29/11/23",
                time: "9am - 11am",
            },
            params: {
                id: orgContent[0].id
            }
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(201);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Booking Updated Successfully!');
            },
        };
        await updateBooking(req, res);
    });

    it('Should not be able to update booking due to invalid date format or missing date', async () => {
        const req = {
            body: {
                name: "danial",
                facility: 'Badminton Court',
                time: '1pm - 3pm',
            },

            params: {
                id: orgContent[0].id
            }
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Invalid date format. Please provide a valid date.');
            },
        };
        await updateBooking(req, res);
    });

    it('Should not be able to update booking due to invalid time format or missing time', async () => {
        const req = {
            body: {
                name: "danial",
                facility: 'Badminton Court',
                date: '28/11/23',
            },

            params: {
                id: orgContent[0].id
            }
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Invalid time format. Please provide a valid time range.');
            },
        };
        await updateBooking(req, res);
    });

    it('Should not be able to update booking due to conflict with another booking', async () => {
        const req = {
            //using index 2 of bookings JSON array to test
            body: {
                facility: "Badminton Court",
                date: "26/11/23",
                time: "3pm - 5pm",
            },
            params: {
                id: orgContent[0].id
            }
        };
    
        const res = {
          status: function (code) {
            expect(code).to.equal(400);
            return this;
          },
          json: function (data) {
            expect(data.message).to.equal(
              'The chosen time for this facility is already booked by another person. Please choose another timing.'
            );
          },
        };
    
        await updateBooking(req, res);
      });
    
      
      it('Should not be able to update booking due to invalid id', async () => {
        const req = {
            
            body: {
                facility: "Badminton Court",
                date: "30/11/23",
                time: "9am - 11am"
                
            },
            params: {
                id: "1234567"
            }
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Error occurred, unable to Update!');
            },
        };
        await updateBooking(req, res);
    });
});