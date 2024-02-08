const { describe, it } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs').promises;
const { viewUserBookings, addBooking, updateBooking } = require('../utils/bookingUtil');
const { json } = require('body-parser');

describe('Testing viewUserBookings Function', () => {

    it('Should return bookings for the specified user', async () => {
        const req = {
            params: { name: 'johnny' },
        };

        // Spy on the res.json method
        const jsonSpy = sinon.spy();

        const res = {
            status: function (code) {
                expect(code).to.equal(200);
                return this;
            },
            json: jsonSpy,
        };

        await viewUserBookings(req, res);

        // Output the value of jsonSpy.firstCall.args[0] to the console for reference
        // console.log('jsonSpy.firstCall.args[]:', jsonSpy.firstCall.args[0]);

        // Assert that the spy was called with an array
        expect(jsonSpy.calledOnce).to.be.true;
        expect(jsonSpy.firstCall.args[0]).to.be.an('array');

        // Assert that the spy was called with every element with the correct name
        expect(jsonSpy.firstCall.args[0].every(booking => booking.name === req.params.name)).to.be.true;

    });

    it('Should return "No bookings found for the specified user." for users with no bookings', async () => {
        const req = {
            params: { name: 'NonExistentUser' },
        };

        // Create spy for res.json
        const jsonSpy = sinon.spy();

        const res = {
            status: function (code) {
                expect(code).to.equal(404);
                return this;
            },
            json: jsonSpy,
        };

        await viewUserBookings(req, res);

        // Assert that json was called with the expected message
        expect(jsonSpy.calledWith({ message: 'No bookings found for the specified user.' })).to.be.true;
        
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
                date: '2023-11-28',
                time: '9am - 11pm',
            },
        };

        const res = {
            status: sinon.stub().returnsThis(),  // Creates a stub that returns itself when called. Useful for chaining.
            json: sinon.stub(), //Creates a stub without any specific behavior.
        };

        await addBooking(req, res);

        // Assert that status was called with the expected code
        sinon.assert.calledWith(res.status, 201);

        // Assert that json was called with at least one element in the array that matches the expected properties
        sinon.assert.calledWithMatch(res.json, sinon.match.some(sinon.match({
            name: req.body.name,
            facility: req.body.facility,
            date: req.body.date,
            time: req.body.time,
        })));

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

        const jsonSpy = sinon.spy();

        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: jsonSpy,
        };
        await addBooking(req, res);

        expect(jsonSpy.calledWith({ message: 'Invalid date format. Please provide a valid date.' })).to.be.true;
    });

    it('Should not be able to add booking due to invalid time format or missing time', async () => {
        const req = {
            body: {
                name: "johnny",
                facility: 'Badminton Court',
                date: '2023-11-28',

            },
        };

        const jsonSpy = sinon.spy();

        const res = {
            status: function (code) {
                expect(code).to.equal(400);
                return this;
            },
            json: jsonSpy,
        };
        await addBooking(req, res);

        expect(jsonSpy.calledWith({ message: 'Invalid time format. Please provide a valid time range.' })).to.be.true;
    });

    it('Should not be able to add booking for facility if timing is already booked', async () => {
        const req = {

            //a request that is not in bookings.JSON, so we need to use stub to test the scenario
            body: {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '2023-12-25',
                time: '5pm - 7pm',
            },
        };

        // Create a stub for fs.readFile to return predefined bookings
        //allows me to control the behavior of fs.readFile during the test, 
        //ensuring that it returns specific data I've defined rather than reading from an actual file.
        const readFileStub = sinon.stub(fs, 'readFile');
        readFileStub.withArgs(bookingsFilePath, 'utf8').resolves(JSON.stringify([
            {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '2023-12-25',
                time: '5pm - 7pm',
            }

        ]));

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

        // Restore the original function after the test
        readFileStub.restore();
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
                date: "2023-12-25",
                time: "7pm - 9pm",
            },
            params: {
                id: '12345678'
            }
        };

        // Create a stub for fs.readFile to return predefined bookings
        const readFileStub = sinon.stub(fs, 'readFile');
        readFileStub.withArgs(bookingsFilePath, 'utf8').resolves(JSON.stringify([
            {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '2023-12-25',
                time: '5pm - 7pm',
                id: '12345678',
            }

        ]));

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

        // Restore the original function after the test
        readFileStub.restore();

    });

    it('Should not be able to update booking due to invalid date format or missing date', async () => {
        const req = {
            body: {
                name: "johnny",
                facility: 'Badminton Court',
                time: '1pm - 3pm',
            },

            params: {
                id: '123456789'
            }
        };

        // Create a stub for fs.readFile to return predefined bookings
        const readFileStub = sinon.stub(fs, 'readFile');
        readFileStub.withArgs(bookingsFilePath, 'utf8').resolves(JSON.stringify([
            {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '2023-12-25',
                time: '5pm - 7pm',
                id: '123456789',
            }

        ]));

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

        // Restore the original function after the test
        readFileStub.restore();
    });

    it('Should not be able to update booking due to invalid time format or missing time', async () => {
        const req = {
            body: {
                name: "johnny",
                facility: 'Badminton Court',
                date: '2023-11-28',
            },

            params: {
                id: '123456789'
            }
        };

        // Create a stub for fs.readFile to return predefined bookings
        const readFileStub = sinon.stub(fs, 'readFile');
        readFileStub.withArgs(bookingsFilePath, 'utf8').resolves(JSON.stringify([
            {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '2023-12-25',
                time: '5pm - 7pm',
                id: '123456789',
            }

        ]));

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

        // Restore the original function after the test
        readFileStub.restore();

    });

    it('Should not be able to update booking due to conflict with another booking', async () => {
        const req = {
            body: {
                facility: "Badminton Court",
                date: "2023-12-27",
                time: "5pm - 7pm",
            },
            params: {
                id: '123456789'
            }
        };

        // Create a mock for fs module
        const fsMock = sinon.mock(fs);

        // Expect readFile to be called with specific arguments and resolve with predefined bookings
        //I expect the readFile function to be called with specific arguments, and when it is called, 
        //it should resolve with a predefined array of bookings.
        fsMock.expects('readFile')
            .withArgs(bookingsFilePath, 'utf8')
            .resolves(JSON.stringify([
                {
                    name: 'johnny',
                    facility: 'Badminton Court',
                    date: '2023-12-25',
                    time: '5pm - 7pm',
                    id: '123456789',
                },
                {
                    name: 'danial',
                    facility: 'Badminton Court',
                    date: '2023-12-27',
                    time: '5pm - 7pm',
                    id: '12345678910',
                }
            ]));

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

        // Verify that expectations are met
        fsMock.verify();

        // Restore the original function after the test
        fsMock.restore();
    });


    it('Should not be able to update booking due to invalid id', async () => {
        const req = {

            body: {
                facility: "Badminton Court",
                date: "2023-11-30",
                time: "9am - 11am"

            },
            params: {
                id: "1234567"
            }
        };

        // Create a stub for fs.readFile to return predefined bookings
        const readFileStub = sinon.stub(fs, 'readFile');
        readFileStub.withArgs(bookingsFilePath, 'utf8').resolves(JSON.stringify([
            {
                name: 'johnny',
                facility: 'Badminton Court',
                date: '2023-12-25',
                time: '5pm - 7pm',
                id: '123456789',
            },

            {
                name: 'danial',
                facility: 'Badminton Court',
                date: '2023-12-27',
                time: '5pm - 7pm',
                id: '12345678910',
            }

        ]));

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

        // Restore the original function after the test
        readFileStub.restore();

    });
});