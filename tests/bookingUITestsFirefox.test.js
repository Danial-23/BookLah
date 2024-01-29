const { app } = require('../index');
const { Builder, By, Key, until, Select } = require('selenium-webdriver');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const fs = require('fs').promises;

const firefox = require('selenium-webdriver/firefox'); // Import Firefox module

const firefoxOptions = new firefox.Options(); // Create options for Firefox
firefoxOptions.addArguments('--headless'); // Add headless mode argument if needed

const driver = new Builder() // Build WebDriver with Firefox
    .forBrowser('firefox')
    .setFirefoxOptions(firefoxOptions)
    .build();

var server;
var counter = 0;

before(async function () {
    server = await new Promise((resolve) => {
        server = app.listen(0, 'localhost', () => {
            resolve(server);
        });
    });
});

describe("Testing on Firefox Browser", function () {
    describe('Testing View User Bookings UI', function () {

        it('Should show "No Bookings Found" for user with no bookings', async function () {
            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(100000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('jivaka@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            // Wait for redirection to the users booking page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));

            // Assert that at no booking card is present
            expect(bookingCards.length).to.equal(0);

            // Assert that the text "No Bookings Found." is present
            const noBookings = await driver.findElement(By.id('no-bookings-found'));
            const isDisplayed = await noBookings.isDisplayed();
            expect(isDisplayed).to.be.true;

            const noBookingsText = await noBookings.getText();
            expect(noBookingsText).to.equal('No Bookings Found.')
        });

        it('Should show bookings for user with bookings', async function () {
            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(100000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            await driver.sleep(10000);


            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            // Assert that at least one booking card is present
            expect(bookingCards.length).to.be.greaterThan(0);
        });
    });

    describe('Testing Add Bookings UI', function () {

        const bookingsFilePath = 'utils/bookings.json';
        var orgContent = "";

        beforeEach(async () => {
            orgContent = await fs.readFile(bookingsFilePath, 'utf8');
            orgContent = JSON.parse(orgContent);

        });

        afterEach(async () => {
            await fs.writeFile(bookingsFilePath, JSON.stringify(orgContent), 'utf8');

        });

        it('Should be able to add and display new booking successfully', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Simulate clicking on the facility at index 1
            const facilityContainers = await driver.findElements(By.css('.facility-container'));
            await facilityContainers[1].click();

            // Wait for facility details modal to load
            const facilityModal = await driver.findElement(By.id('proModal'));
            await driver.wait(until.elementIsVisible(facilityModal), 5000);

            // Find the modal title element within the facility details modal
            const modalTitleElement = await facilityModal.findElement(By.css('.modal-title'));

            // Assert that the modal title is equal to "Football Field" because index 1 is "Football Field"
            const modalTitleText = await modalTitleElement.getText();
            expect(modalTitleText).to.equal('Football Field');

            // Find the "Add Booking" button inside the facility details modal
            const addBookingButton = await facilityModal.findElement(By.xpath("//button[contains(text(), 'Add Booking')]"));
            await addBookingButton.click();


            //Wait for Add Booking Modal to load
            const addBookingModal = await driver.findElement(By.id('bookingModal'));
            await driver.wait(until.elementIsVisible(addBookingModal), 5000);

            const facilityName = await addBookingModal.findElement(By.id('facility-name'));
            const facilityNameText = await facilityName.getAttribute('value');
            expect(facilityNameText).to.equal('Football Field');

            const facilityLocation = await addBookingModal.findElement(By.id('facility-location'));
            const facilityLocationText = await facilityLocation.getAttribute('value');
            expect(facilityLocationText).to.equal('119A Kim Tian Rd, Singapore 169263');

            // Get today's date
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
            const day = String(today.getDate()).padStart(2, '0');

            // Formatting the date as YYYY-MM-DD
            const formattedDate = `${year}-${month}-${day}`;
            console.log("formattedDate", formattedDate);
            // Locate and interact with the date field
            const dateInput = await driver.findElement(By.id('bookedDate'));
            await dateInput.click(); // Click on the element
            // Execute JavaScript to set the value of the input field directly
            await driver.executeScript(`arguments[0].value = '${formattedDate}';`, dateInput);


            //Locating the time dropdown
            const timeDropdown = await driver.findElement(By.id('bookedTime'));
            // Create a new Select object
            const selectTime = new Select(timeDropdown);
            // Select an option by visible text
            await selectTime.selectByVisibleText('5pm - 7pm');

            const submitButton = await addBookingModal.findElement(By.id('submitButton'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('Facility Booked Successfully!');
            await alert.accept();

            await driver.sleep(10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            expect(bookingCards.length).to.be.greaterThan(0);

            let foundMatch = false;

            // Loop through each booking card to check its details
            for (const bookingCard of bookingCards) {
                const facilityText = await bookingCard.findElement(By.id('facilityTitle')).getText();
                const locationText = await bookingCard.findElement(By.id('facilityLocation')).getText();
                const dateText = await bookingCard.findElement(By.id('booking-date')).getText();
                const timeText = await bookingCard.findElement(By.id('facilityTime')).getText();

                console.log(facilityText);
                console.log(locationText);
                console.log(dateText);
                console.log(timeText);

                if (
                    facilityText === facilityNameText &&
                    locationText === facilityLocationText &&
                    dateText === formattedDate &&
                    timeText === '5pm - 7pm'
                ) {
                    foundMatch = true;
                    break; // Exit the loop if a match is found
                }
            }

            // Assert that at least one booking card has the expected details
            expect(foundMatch).to.be.true;


        });

        it('Prevent user from booking if time field is empty.', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Simulate clicking on the facility at index 1
            const facilityContainers = await driver.findElements(By.css('.facility-container'));
            await facilityContainers[1].click();

            // Wait for facility details modal to load
            const facilityModal = await driver.findElement(By.id('proModal'));
            await driver.wait(until.elementIsVisible(facilityModal), 5000);

            // Find the modal title element within the facility details modal
            const modalTitleElement = await facilityModal.findElement(By.css('.modal-title'));

            // Assert that the modal title is equal to "Football Field" because index 1 is "Football Field"
            const modalTitleText = await modalTitleElement.getText();
            expect(modalTitleText).to.equal('Football Field');

            // Find the "Add Booking" button inside the facility details modal
            const addBookingButton = await facilityModal.findElement(By.xpath("//button[contains(text(), 'Add Booking')]"));
            await addBookingButton.click();


            //Wait for Add Booking Modal to load
            const addBookingModal = await driver.findElement(By.id('bookingModal'));
            await driver.wait(until.elementIsVisible(addBookingModal), 5000);

            const facilityName = await addBookingModal.findElement(By.id('facility-name'));
            const facilityNameText = await facilityName.getAttribute('value');
            expect(facilityNameText).to.equal('Football Field');

            const facilityLocation = await addBookingModal.findElement(By.id('facility-location'));
            const facilityLocationText = await facilityLocation.getAttribute('value');
            expect(facilityLocationText).to.equal('119A Kim Tian Rd, Singapore 169263');

            // Get today's date
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
            const day = String(today.getDate()).padStart(2, '0');

            // Formatting the date as YYYY-MM-DD
            const formattedDate = `${year}-${month}-${day}`;
            console.log("formattedDate", formattedDate);
            // Locate and interact with the location field
            const dateInput = await driver.findElement(By.id('bookedDate'));
            await dateInput.click(); // Click on the element
            // Execute JavaScript to set the value of the input field directly
            await driver.executeScript(`arguments[0].value = '${formattedDate}';`, dateInput);


            //Locating the time dropdown
            const timeDropdown = await driver.findElement(By.id('bookedTime'));
            // Create a new Select object
            const selectTime = new Select(timeDropdown);
            // Select an option by visible text
            await selectTime.selectByVisibleText('Select Timing');

            const submitButton = await addBookingModal.findElement(By.id('submitButton'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('Please select a date and time before submitting.');
            await alert.accept();

        });

        it('Prevent user from booking if date field is empty.', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Simulate clicking on the facility at index 1
            const facilityContainers = await driver.findElements(By.css('.facility-container'));
            await facilityContainers[1].click();

            // Wait for facility details modal to load
            const facilityModal = await driver.findElement(By.id('proModal'));
            await driver.wait(until.elementIsVisible(facilityModal), 5000);

            // Find the modal title element within the facility details modal
            const modalTitleElement = await facilityModal.findElement(By.css('.modal-title'));

            // Assert that the modal title is equal to "Football Field" because index 1 is "Football Field"
            const modalTitleText = await modalTitleElement.getText();
            expect(modalTitleText).to.equal('Football Field');

            // Find the "Add Booking" button inside the facility details modal
            const addBookingButton = await facilityModal.findElement(By.xpath("//button[contains(text(), 'Add Booking')]"));
            await addBookingButton.click();


            //Wait for Add Booking Modal to load
            const addBookingModal = await driver.findElement(By.id('bookingModal'));
            await driver.wait(until.elementIsVisible(addBookingModal), 5000);

            const facilityName = await addBookingModal.findElement(By.id('facility-name'));
            const facilityNameText = await facilityName.getAttribute('value');
            expect(facilityNameText).to.equal('Football Field');

            const facilityLocation = await addBookingModal.findElement(By.id('facility-location'));
            const facilityLocationText = await facilityLocation.getAttribute('value');
            expect(facilityLocationText).to.equal('119A Kim Tian Rd, Singapore 169263');

            // Locate and interact with the location field
            const dateInput = await driver.findElement(By.id('bookedDate'));
            await dateInput.click(); // Click on the element
            await dateInput.sendKeys("");

            //Locating the time dropdown
            const timeDropdown = await driver.findElement(By.id('bookedTime'));
            // Create a new Select object
            const selectTime = new Select(timeDropdown);
            // Select an option by visible text
            await selectTime.selectByVisibleText('5pm - 7pm');

            const submitButton = await addBookingModal.findElement(By.id('submitButton'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('Please select a date and time before submitting.');
            await alert.accept();
        });

        it('Prevent user from booking with past dates', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Simulate clicking on the facility at index 1
            const facilityContainers = await driver.findElements(By.css('.facility-container'));
            await facilityContainers[1].click();

            // Wait for facility details modal to load
            const facilityModal = await driver.findElement(By.id('proModal'));
            await driver.wait(until.elementIsVisible(facilityModal), 5000);

            // Find the modal title element within the facility details modal
            const modalTitleElement = await facilityModal.findElement(By.css('.modal-title'));

            // Assert that the modal title is equal to "Football Field" because index 1 is "Football Field"
            const modalTitleText = await modalTitleElement.getText();
            expect(modalTitleText).to.equal('Football Field');

            // Find the "Add Booking" button inside the facility details modal
            const addBookingButton = await facilityModal.findElement(By.xpath("//button[contains(text(), 'Add Booking')]"));
            await addBookingButton.click();


            //Wait for Add Booking Modal to load
            const addBookingModal = await driver.findElement(By.id('bookingModal'));
            await driver.wait(until.elementIsVisible(addBookingModal), 5000);

            const facilityName = await addBookingModal.findElement(By.id('facility-name'));
            const facilityNameText = await facilityName.getAttribute('value');
            expect(facilityNameText).to.equal('Football Field');

            // Locate and interact with the location field
            const facilityLocation = await addBookingModal.findElement(By.id('facility-location'));
            const facilityLocationText = await facilityLocation.getAttribute('value');
            expect(facilityLocationText).to.equal('119A Kim Tian Rd, Singapore 169263');

            const dateInput = await driver.findElement(By.id('bookedDate'));
            await dateInput.click(); // Click on the element
            const inputDate = "2024-01-26";
            // Execute JavaScript to set the value of the input field directly
            await driver.executeScript(`arguments[0].value = '${inputDate}';`, dateInput);
            // await dateInput.sendKeys(inputDate); // Setting date that is in the past

            //Locating the time dropdown
            const timeDropdown = await driver.findElement(By.id('bookedTime'));
            // Create a new Select object
            const selectTime = new Select(timeDropdown);
            // Select an option by visible text
            await selectTime.selectByVisibleText('5pm - 7pm');

            const submitButton = await addBookingModal.findElement(By.id('submitButton'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            console.log("alertText", alertText);
            // Check if the text matches
            expect(alertText).to.equal('You cannot book for a past date.');
            await alert.accept();

        });

        it('Prevent users from booking if booked timing and date is already booked by another user for that specific facility', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('jivaka@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Simulate clicking on the facility at index 1
            const facilityContainers = await driver.findElements(By.css('.facility-container'));
            await facilityContainers[1].click();

            // Wait for facility details modal to load
            const facilityModal = await driver.findElement(By.id('proModal'));
            await driver.wait(until.elementIsVisible(facilityModal), 5000);

            // Find the modal title element within the facility details modal
            const modalTitleElement = await facilityModal.findElement(By.css('.modal-title'));

            // Assert that the modal title is equal to "Football Field" because index 1 is "Football Field"
            const modalTitleText = await modalTitleElement.getText();
            expect(modalTitleText).to.equal('Football Field');

            // Find the "Add Booking" button inside the facility details modal
            const addBookingButton = await facilityModal.findElement(By.xpath("//button[contains(text(), 'Add Booking')]"));
            await addBookingButton.click();


            //Wait for Add Booking Modal to load
            const addBookingModal = await driver.findElement(By.id('bookingModal'));
            await driver.wait(until.elementIsVisible(addBookingModal), 5000);

            const facilityName = await addBookingModal.findElement(By.id('facility-name'));
            const facilityNameText = await facilityName.getAttribute('value');
            expect(facilityNameText).to.equal('Football Field');

            // Locate and interact with the location field
            const facilityLocation = await addBookingModal.findElement(By.id('facility-location'));
            const facilityLocationText = await facilityLocation.getAttribute('value');
            expect(facilityLocationText).to.equal('119A Kim Tian Rd, Singapore 169263');

            const dateInput = await driver.findElement(By.id('bookedDate'));
            await dateInput.click(); // Click on the element
            const inputDate = "2024-03-26";
            // Execute JavaScript to set the value of the input field directly
            await driver.executeScript(`arguments[0].value = '${inputDate}';`, dateInput);

            //Locating the time dropdown
            const timeDropdown = await driver.findElement(By.id('bookedTime'));
            // Create a new Select object
            const selectTime = new Select(timeDropdown);
            // Select an option by visible text
            await selectTime.selectByVisibleText('3pm - 5pm');

            const submitButton = await addBookingModal.findElement(By.id('submitButton'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            console.log("alertText", alertText);
            // Check if the text matches
            expect(alertText).to.equal('The chosen time for this facility is already booked by another person. Please choose another timing.');
            await alert.accept();

        });

        it('Prevent users from booking if date format provided is invalid', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('jivaka@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Simulate clicking on the facility at index 1
            const facilityContainers = await driver.findElements(By.css('.facility-container'));
            await facilityContainers[1].click();

            // Wait for facility details modal to load
            const facilityModal = await driver.findElement(By.id('proModal'));
            await driver.wait(until.elementIsVisible(facilityModal), 5000);

            // Find the modal title element within the facility details modal
            const modalTitleElement = await facilityModal.findElement(By.css('.modal-title'));

            // Assert that the modal title is equal to "Football Field" because index 1 is "Football Field"
            const modalTitleText = await modalTitleElement.getText();
            expect(modalTitleText).to.equal('Football Field');

            // Find the "Add Booking" button inside the facility details modal
            const addBookingButton = await facilityModal.findElement(By.xpath("//button[contains(text(), 'Add Booking')]"));
            await addBookingButton.click();


            //Wait for Add Booking Modal to load
            const addBookingModal = await driver.findElement(By.id('bookingModal'));
            await driver.wait(until.elementIsVisible(addBookingModal), 5000);

            const facilityName = await addBookingModal.findElement(By.id('facility-name'));
            const facilityNameText = await facilityName.getAttribute('value');
            expect(facilityNameText).to.equal('Football Field');

            // Locate and interact with the location field
            const facilityLocation = await addBookingModal.findElement(By.id('facility-location'));
            const facilityLocationText = await facilityLocation.getAttribute('value');
            expect(facilityLocationText).to.equal('119A Kim Tian Rd, Singapore 169263');

            const dateInput = await driver.findElement(By.id('bookedDate'));
            await dateInput.click(); // Click on the element
            await dateInput.sendKeys("202444-03-26");

            //Locating the time dropdown
            const timeDropdown = await driver.findElement(By.id('bookedTime'));
            // Create a new Select object
            const selectTime = new Select(timeDropdown);
            // Select an option by visible text
            await selectTime.selectByVisibleText('3pm - 5pm');

            const submitButton = await addBookingModal.findElement(By.id('submitButton'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            console.log("alertText", alertText);
            // Check if the text matches
            expect(alertText).to.equal('Invalid date format. Please provide a valid date.');
            await alert.accept();

        });


    });

    describe("Testing Update Bookings UI", function () {

        const bookingsFilePath = 'utils/bookings.json';
        var orgContent = "";

        beforeEach(async () => {
            orgContent = await fs.readFile(bookingsFilePath, 'utf8');
            orgContent = JSON.parse(orgContent);
        });

        afterEach(async () => {
            await fs.writeFile(bookingsFilePath, JSON.stringify(orgContent), 'utf8');
        });

        it('Should be able to update and display updated booking successfully', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            // Wait for redirection to the users booking page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            // Assert that at least one booking card is present
            expect(bookingCards.length).to.be.greaterThan(0);

            // Find the edit button inside the first booking card
            const editButton = await driver.wait(until.elementIsVisible(bookingCards[0].findElement(By.css('.fa-pen-to-square'))), 5000);
            await editButton.click();

            // Wait for update modal to load
            const updateModal = await driver.findElement(By.id('updateBookingModal'));
            await driver.wait(until.elementIsVisible(updateModal), 5000);

            //facility name in update modal
            const facilityName = await updateModal.findElement(By.id('facility-name-update'));
            const facilityNameText = await facilityName.getAttribute('value');

            //facility name from booking card
            const facilityTitleElement = await bookingCards[0].findElement(By.id('facilityTitle'));
            const facilityNameTextFromElement = await facilityTitleElement.getText();
            expect(facilityNameText).to.equal(facilityNameTextFromElement);

            //facility location in update modal
            const facilityLocation = await updateModal.findElement(By.id('facility-location-update'));
            const facilityLocationText = await facilityLocation.getAttribute('value');

            //facility location from booking card
            const facilityLocationElement = await bookingCards[0].findElement(By.id('facilityLocation'));
            const facilityLocationTextFromElement = await facilityLocationElement.getText();
            expect(facilityLocationText).to.equal(facilityLocationTextFromElement);

            //facility booked date in update modal
            const bookedDate = await updateModal.findElement(By.id('bookedDateUpdate'));
            const bookedDateValue = await bookedDate.getAttribute('value');

            //facility booked date from booking card
            const bookedDateElement = await bookingCards[0].findElement(By.id('booking-date'));
            const bookedDateTextFromElement = await bookedDateElement.getText();
            expect(bookedDateValue).to.equal(bookedDateTextFromElement);

            //facility booked time in update modal
            const bookedTime = await updateModal.findElement(By.id('bookedTimeUpdate'));
            const bookedTimeValue = await bookedTime.getAttribute('value');

            //facility booked time from booking card
            const bookedTimeElement = await bookingCards[0].findElement(By.id('facilityTime'));
            const bookedTimeTextFromElement = await bookedTimeElement.getText();
            expect(bookedTimeValue).to.equal(bookedTimeTextFromElement);

            //Click date input
            await bookedDate.click();
            // Execute JavaScript to set the value of the input field directly
            await driver.executeScript(`arguments[0].value = '2024-03-25';`, bookedDate);

            // Create a new Select object
            const selectTime = new Select(bookedTime);
            // Select an option by visible text
            await selectTime.selectByVisibleText('5pm - 7pm');

            const submitButton = await updateModal.findElement(By.id('submitUpdate'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('Booking Updated Successfully!');
            await alert.accept();

            // Wait for the element to become stale (i.e., removed from the DOM)
            await driver.wait(until.stalenessOf(bookedDateElement), 10000);

            // Wait for the element to reappear (indicating that the page has been reloaded)
            await driver.wait(until.elementLocated(By.id('facilityTime')), 10000);


            // Check if booking cards are present after update
            const bookingCardsAfter = await driver.findElements(By.css('.booking-card'));

            //facility booked date from booking card after updating
            const bookedDateElementAfter = await bookingCardsAfter[0].findElement(By.id('booking-date'));
            const bookedDateTextFromElementAfter = await bookedDateElementAfter.getText();
            console.log("bookedDateAfter", bookedDateTextFromElementAfter);
            //expect booking card to be update to the new values
            expect(bookedDateTextFromElementAfter).to.equal("2024-03-25");

            //facility booked time from booking card after updating
            const bookedTimeElementAfter = await bookingCardsAfter[0].findElement(By.id('facilityTime'));
            const bookedTimeTextFromElementAfter = await bookedTimeElementAfter.getText();
            console.log("bookedTimeAfter", bookedTimeTextFromElementAfter);
            expect(bookedTimeTextFromElementAfter).to.equal("5pm - 7pm");


        });

        it('Prevent users from updating booking if date field is empty', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            // Wait for redirection to the users booking page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            // Assert that at least one booking card is present
            expect(bookingCards.length).to.be.greaterThan(0);

            // Find the edit button inside the second booking card
            const editButton = await driver.wait(until.elementIsVisible(bookingCards[1].findElement(By.css('.fa-pen-to-square'))), 5000);


            await editButton.click();

            // Wait for update modal to load
            const updateModal = await driver.findElement(By.id('updateBookingModal'));
            await driver.wait(until.elementIsVisible(updateModal), 5000);

            //facility name in update modal
            const facilityName = await updateModal.findElement(By.id('facility-name-update'));
            const facilityNameText = await facilityName.getAttribute('value');

            //facility name from booking card
            const facilityTitleElement = await bookingCards[1].findElement(By.id('facilityTitle'));
            const facilityNameTextFromElement = await facilityTitleElement.getText();
            expect(facilityNameText).to.equal(facilityNameTextFromElement);

            //facility location in update modal
            const facilityLocation = await updateModal.findElement(By.id('facility-location-update'));
            const facilityLocationText = await facilityLocation.getAttribute('value');

            //facility location from booking card
            const facilityLocationElement = await bookingCards[1].findElement(By.id('facilityLocation'));
            const facilityLocationTextFromElement = await facilityLocationElement.getText();
            expect(facilityLocationText).to.equal(facilityLocationTextFromElement);

            //facility booked date in update modal
            const bookedDate = await updateModal.findElement(By.id('bookedDateUpdate'));
            await driver.wait(until.elementIsVisible(bookedDate), 5000);
            const bookedDateValue = await bookedDate.getAttribute('value');

            //facility booked date from booking card
            const bookedDateElement = await bookingCards[1].findElement(By.id('booking-date'));
            const bookedDateTextFromElement = await bookedDateElement.getText();
            console.log("bookedDateText", bookedDateTextFromElement);
            expect(bookedDateValue).to.equal(bookedDateTextFromElement);

            //facility booked time in update modal
            const bookedTime = await updateModal.findElement(By.id('bookedTimeUpdate'));
            const bookedTimeValue = await bookedTime.getAttribute('value');

            //facility booked time from booking card
            const bookedTimeElement = await bookingCards[1].findElement(By.id('facilityTime'));
            const bookedTimeTextFromElement = await bookedTimeElement.getText();
            expect(bookedTimeValue).to.equal(bookedTimeTextFromElement);

            //Click date input
            await bookedDate.click();
            await driver.executeScript(`arguments[0].value = '';`, bookedDate);

            // Create a new Select object
            const selectTime = new Select(bookedTime);
            // Select an option by visible text
            await selectTime.selectByVisibleText('5pm - 7pm');

            const submitButton = await updateModal.findElement(By.id('submitUpdate'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('Please select a date and time before submitting.');
            await alert.accept();

        });

        it('Prevent users from updating booking if time field is empty', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            // Wait for redirection to the users booking page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            // Assert that at least one booking card is present
            expect(bookingCards.length).to.be.greaterThan(0);

            // Find the edit button inside the third booking card
            const editButton = await driver.wait(until.elementIsVisible(bookingCards[2].findElement(By.css('.fa-pen-to-square'))), 5000);
            await editButton.click();

            // Wait for update modal to load
            const updateModal = await driver.findElement(By.id('updateBookingModal'));
            await driver.wait(until.elementIsVisible(updateModal), 5000);

            //facility name in update modal
            const facilityName = await updateModal.findElement(By.id('facility-name-update'));
            const facilityNameText = await facilityName.getAttribute('value');

            //facility name from booking card
            const facilityTitleElement = await bookingCards[2].findElement(By.id('facilityTitle'));
            const facilityNameTextFromElement = await facilityTitleElement.getText();
            expect(facilityNameText).to.equal(facilityNameTextFromElement);

            //facility location in update modal
            const facilityLocation = await updateModal.findElement(By.id('facility-location-update'));
            const facilityLocationText = await facilityLocation.getAttribute('value');

            //facility location from booking card
            const facilityLocationElement = await bookingCards[2].findElement(By.id('facilityLocation'));
            const facilityLocationTextFromElement = await facilityLocationElement.getText();
            expect(facilityLocationText).to.equal(facilityLocationTextFromElement);

            //facility booked date in update modal
            const bookedDate = await updateModal.findElement(By.id('bookedDateUpdate'));
            const bookedDateValue = await bookedDate.getAttribute('value');

            //facility booked date from booking card
            const bookedDateElement = await bookingCards[2].findElement(By.id('booking-date'));
            const bookedDateTextFromElement = await bookedDateElement.getText();
            expect(bookedDateValue).to.equal(bookedDateTextFromElement);

            //facility booked time in update modal
            const bookedTime = await updateModal.findElement(By.id('bookedTimeUpdate'));
            const bookedTimeValue = await bookedTime.getAttribute('value');

            //facility booked time from booking card
            const bookedTimeElement = await bookingCards[2].findElement(By.id('facilityTime'));
            const bookedTimeTextFromElement = await bookedTimeElement.getText();
            expect(bookedTimeValue).to.equal(bookedTimeTextFromElement);

            //Click date input
            await bookedDate.click();
            await driver.executeScript(`arguments[0].value = '2024-03-24';`, bookedDate);

            // Create a new Select object
            const selectTime = new Select(bookedTime);
            // Select an option by visible text
            await selectTime.selectByVisibleText('Select Timing');

            const submitButton = await updateModal.findElement(By.id('submitUpdate'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('Please select a date and time before submitting.');
            await alert.accept();

        });

        it('Prevent users from updating booking with past dates', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            // Wait for redirection to the users booking page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            // Assert that at least one booking card is present
            expect(bookingCards.length).to.be.greaterThan(0);

            // Find the edit button inside the third booking card
            const editButton = await driver.wait(until.elementIsVisible(bookingCards[0].findElement(By.css('.fa-pen-to-square'))), 5000);
            await editButton.click();

            // Wait for update modal to load
            const updateModal = await driver.findElement(By.id('updateBookingModal'));
            await driver.wait(until.elementIsVisible(updateModal), 5000);

            //facility name in update modal
            const facilityName = await updateModal.findElement(By.id('facility-name-update'));
            const facilityNameText = await facilityName.getAttribute('value');

            //facility name from booking card
            const facilityTitleElement = await bookingCards[0].findElement(By.id('facilityTitle'));
            const facilityNameTextFromElement = await facilityTitleElement.getText();
            expect(facilityNameText).to.equal(facilityNameTextFromElement);

            //facility location in update modal
            const facilityLocation = await updateModal.findElement(By.id('facility-location-update'));
            const facilityLocationText = await facilityLocation.getAttribute('value');

            //facility location from booking card
            const facilityLocationElement = await bookingCards[0].findElement(By.id('facilityLocation'));
            const facilityLocationTextFromElement = await facilityLocationElement.getText();
            expect(facilityLocationText).to.equal(facilityLocationTextFromElement);

            //facility booked date in update modal
            const bookedDate = await updateModal.findElement(By.id('bookedDateUpdate'));
            const bookedDateValue = await bookedDate.getAttribute('value');

            //facility booked date from booking card
            const bookedDateElement = await bookingCards[0].findElement(By.id('booking-date'));
            const bookedDateTextFromElement = await bookedDateElement.getText();
            expect(bookedDateValue).to.equal(bookedDateTextFromElement);

            //facility booked time in update modal
            const bookedTime = await updateModal.findElement(By.id('bookedTimeUpdate'));
            const bookedTimeValue = await bookedTime.getAttribute('value');

            //facility booked time from booking card
            const bookedTimeElement = await bookingCards[0].findElement(By.id('facilityTime'));
            const bookedTimeTextFromElement = await bookedTimeElement.getText();
            expect(bookedTimeValue).to.equal(bookedTimeTextFromElement);

            //Click date input
            await bookedDate.click();
            await driver.executeScript(`arguments[0].value = '2024-01-01';`, bookedDate);

            // Create a new Select object
            const selectTime = new Select(bookedTime);
            // Select an option by visible text
            await selectTime.selectByVisibleText('1pm - 3pm');

            const submitButton = await updateModal.findElement(By.id('submitUpdate'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('You cannot book for a past date.');
            await alert.accept();

        });

        it('Prevent users from updating booking if another user has booked the same date and time for that specific facility', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            // Wait for redirection to the users booking page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            // Assert that at least one booking card is present
            expect(bookingCards.length).to.be.greaterThan(0);

            // Find the edit button inside the third booking card
            const editButton = await driver.wait(until.elementIsVisible(bookingCards[0].findElement(By.css('.fa-pen-to-square'))), 5000);
            await editButton.click();

            // Wait for update modal to load
            const updateModal = await driver.findElement(By.id('updateBookingModal'));
            await driver.wait(until.elementIsVisible(updateModal), 5000);

            //facility name in update modal
            const facilityName = await updateModal.findElement(By.id('facility-name-update'));
            const facilityNameText = await facilityName.getAttribute('value');

            //facility name from booking card
            const facilityTitleElement = await bookingCards[0].findElement(By.id('facilityTitle'));
            const facilityNameTextFromElement = await facilityTitleElement.getText();
            expect(facilityNameText).to.equal(facilityNameTextFromElement);

            //facility location in update modal
            const facilityLocation = await updateModal.findElement(By.id('facility-location-update'));
            const facilityLocationText = await facilityLocation.getAttribute('value');

            //facility location from booking card
            const facilityLocationElement = await bookingCards[0].findElement(By.id('facilityLocation'));
            const facilityLocationTextFromElement = await facilityLocationElement.getText();
            expect(facilityLocationText).to.equal(facilityLocationTextFromElement);

            //facility booked date in update modal
            const bookedDate = await updateModal.findElement(By.id('bookedDateUpdate'));
            const bookedDateValue = await bookedDate.getAttribute('value');

            //facility booked date from booking card
            const bookedDateElement = await bookingCards[0].findElement(By.id('booking-date'));
            const bookedDateTextFromElement = await bookedDateElement.getText();
            expect(bookedDateValue).to.equal(bookedDateTextFromElement);

            //facility booked time in update modal
            const bookedTime = await updateModal.findElement(By.id('bookedTimeUpdate'));
            const bookedTimeValue = await bookedTime.getAttribute('value');

            //facility booked time from booking card
            const bookedTimeElement = await bookingCards[0].findElement(By.id('facilityTime'));
            const bookedTimeTextFromElement = await bookedTimeElement.getText();
            expect(bookedTimeValue).to.equal(bookedTimeTextFromElement);

            //Click date input
            await bookedDate.click();
            await driver.executeScript(`arguments[0].value = '2024-04-29';`, bookedDate);

            // Create a new Select object
            const selectTime = new Select(bookedTime);
            // Select an option by visible text
            await selectTime.selectByVisibleText('3pm - 5pm');

            const submitButton = await updateModal.findElement(By.id('submitUpdate'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('The chosen time for this facility is already booked by another person. Please choose another timing.');
            await alert.accept();

        });

        it('Prevent users from updating booking if date format provided is invalid', async function () {

            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
            this.timeout(200000);
            await driver.get(baseUrl);

            // Enter email and password and click login button
            await driver.findElement(By.id('email')).sendKeys('john@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

            // Click on the h1 booking tab to navigate to booking.html
            await driver.findElement(By.css('a[href="booking.html"] h1')).click();

            // Wait for redirection to the users booking page
            await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);

            // Check if booking cards are present
            const bookingCards = await driver.findElements(By.css('.booking-card'));
            // Assert that at least one booking card is present
            expect(bookingCards.length).to.be.greaterThan(0);

            // Find the edit button inside the third booking card
            const editButton = await driver.wait(until.elementIsVisible(bookingCards[0].findElement(By.css('.fa-pen-to-square'))), 5000);
            await editButton.click();

            // Wait for update modal to load
            const updateModal = await driver.findElement(By.id('updateBookingModal'));
            await driver.wait(until.elementIsVisible(updateModal), 5000);

            //facility name in update modal
            const facilityName = await updateModal.findElement(By.id('facility-name-update'));
            const facilityNameText = await facilityName.getAttribute('value');

            //facility name from booking card
            const facilityTitleElement = await bookingCards[0].findElement(By.id('facilityTitle'));
            const facilityNameTextFromElement = await facilityTitleElement.getText();
            expect(facilityNameText).to.equal(facilityNameTextFromElement);

            //facility location in update modal
            const facilityLocation = await updateModal.findElement(By.id('facility-location-update'));
            const facilityLocationText = await facilityLocation.getAttribute('value');

            //facility location from booking card
            const facilityLocationElement = await bookingCards[0].findElement(By.id('facilityLocation'));
            const facilityLocationTextFromElement = await facilityLocationElement.getText();
            expect(facilityLocationText).to.equal(facilityLocationTextFromElement);

            //facility booked date in update modal
            const bookedDate = await updateModal.findElement(By.id('bookedDateUpdate'));
            const bookedDateValue = await bookedDate.getAttribute('value');

            //facility booked date from booking card
            const bookedDateElement = await bookingCards[0].findElement(By.id('booking-date'));
            const bookedDateTextFromElement = await bookedDateElement.getText();
            expect(bookedDateValue).to.equal(bookedDateTextFromElement);

            //facility booked time in update modal
            const bookedTime = await updateModal.findElement(By.id('bookedTimeUpdate'));
            const bookedTimeValue = await bookedTime.getAttribute('value');

            //facility booked time from booking card
            const bookedTimeElement = await bookingCards[0].findElement(By.id('facilityTime'));
            const bookedTimeTextFromElement = await bookedTimeElement.getText();
            expect(bookedTimeValue).to.equal(bookedTimeTextFromElement);

            //Click date input
            await bookedDate.click();
            await driver.executeScript(`arguments[0].value = '202444-04-29';`, bookedDate);

            // Create a new Select object
            const selectTime = new Select(bookedTime);
            // Select an option by visible text
            await selectTime.selectByVisibleText('3pm - 5pm');

            const submitButton = await updateModal.findElement(By.id('submitUpdate'));
            // Click on the submit button
            await submitButton.click();

            // Wait for the alert to be displayed
            const alert = await driver.wait(until.alertIsPresent(), 5000);
            // Get the text of the alert
            const alertText = await alert.getText();
            // Check if the text matches
            expect(alertText).to.equal('Invalid date format. Please provide a valid date.');
            await alert.accept();

        });


    });
});

afterEach(async function () {
    await driver.executeScript('return window.__coverage__;').then(async (coverageData) => {
        if (coverageData) {
            // Save coverage data to a file
            await fs.writeFile('coverage-frontend/coverageFirefox' + counter++ + '.json',
                JSON.stringify(coverageData), (err) => {
                    if (err) {
                        console.error('Error writing coverage data:', err);
                    } else {
                        console.log('Coverage data written to coverage.json');
                    }
                });
        }
    });
});

after(async function () {
    await driver.quit();
    await server.close();
});