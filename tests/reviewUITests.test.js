const { Builder, By, Key, until } = require('selenium-webdriver');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const { app } = require('../index.js');
const fs = require('fs').promises;

const chrome = require('selenium-webdriver/chrome');
const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless');
const driver = new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
const timeout = 100000;
var server;
var counter = 0;

before(async function () {
    server = await new Promise((resolve) => {
        server = app.listen(0, 'localhost', () => {
            resolve(server);
        });
    })
});

describe('View Review Functionality', function () {
    this.timeout(timeout); // Timeout setting as in the original code

    it('should login, open a facility modal, and display reviews correctly', async function () {
        try {
            // Navigate to the local server URL
            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented';
            await driver.get(baseUrl + '/login.html');

            // Navigate to the login page and perform login
            await driver.findElement(By.id('email')).sendKeys('danialPersonal@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);

            // Load facility resources
            await driver.executeScript("viewResources()");
            await driver.executeScript("viewUser()");

            // Wait for facilities to load (assuming they have a specific class or attribute that can be waited on)
            await driver.wait(until.elementLocated(By.className('facility-container')), timeout);

            // Wait for facilities to load and open the first facility's modal
            const facilities = await driver.findElements(By.className('facility-container'));
            if (facilities.length > 0) {
                await facilities[0].click();
            } else {
                throw new Error("No facilities found");
            }

            // Wait for the "Reviews" button to be clickable and then click it
            const reviewsButton = await driver.wait(until.elementIsVisible(driver.findElement(By.id('reviewsButton'))), timeout);
            await reviewsButton.click();

            // Verify if the reviews container is displayed
            const reviewsContainer = await driver.findElement(By.id('reviewsContainer'));
            const isDisplayed = await reviewsContainer.isDisplayed();
            expect(isDisplayed).to.be.true;

            // Click the "Reviews" button again to hide reviews
            await driver.wait(until.elementIsVisible(driver.findElement(By.id('reviewsButton'))), timeout);
            await reviewsButton.click();

            // Check if the reviews container is hidden
            const isHidden = !(await reviewsContainer.isDisplayed());
            expect(isHidden).to.be.true;

        } catch (error) {
            console.error("Test failed:", error);
            throw error;
        }
    });

    it('should login, open a facility modal, and hide reviews correctly', async function () {
        try {
            // Navigate to the local server URL
            const baseUrl = 'http://localhost:' + server.address().port + '/instrumented';
            await driver.get(baseUrl + '/login.html');

            // Navigate to the login page and perform login
            await driver.findElement(By.id('email')).sendKeys('danialPersonal@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[onclick="login()"]')).click();

            // Wait for redirection to the home page
            await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);

            // Load facility resources
            await driver.executeScript("viewResources()");
            await driver.executeScript("viewUser()");

            // Wait for facilities to load (assuming they have a specific class or attribute that can be waited on)
            await driver.wait(until.elementLocated(By.className('facility-container')), timeout);

            // Wait for facilities to load and open the first facility's modal
            const facilities = await driver.findElements(By.className('facility-container'));
            if (facilities.length > 0) {
                await facilities[0].click();
            } else {
                throw new Error("No facilities found");
            }

            // Wait for the "Reviews" button to be clickable and then click it
            const reviewsButton = await driver.wait(until.elementIsVisible(driver.findElement(By.id('reviewsButton'))), timeout);
            await reviewsButton.click();
               // Verify if the reviews container is displayed
               const reviewsContainer = await driver.findElement(By.id('reviewsContainer'));
               const isDisplayed = await reviewsContainer.isDisplayed();
               expect(isDisplayed).to.be.true;
            // Click the "Reviews" button again to hide reviews
            await driver.wait(until.elementIsVisible(driver.findElement(By.id('reviewsButton'))), timeout);
            await reviewsButton.click();
            console.log('1')
            // Check if the reviews container is hidden
            const isHidden = !(await reviewsContainer.isDisplayed());
            expect(isHidden).to.be.true;

        } catch (error) {
            console.error("Test failed:", error);
            throw error;
        }
    });

});

describe('Add Review Functionality', function () {
    this.timeout(timeout);
    const reviewFilePath = 'utils/reviews.json';
    var orgContent = '';

    beforeEach(async () => {
        orgContent = await fs.readFile(reviewFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });

    afterEach(async () => {
        await fs.writeFile(reviewFilePath, JSON.stringify(orgContent), 'utf8');
    });

    it('Should login, open add review modal, and verify username field is correct and uneditable', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented';
        await driver.get(baseUrl + '/login.html');

        //Fill login sections
        await driver.findElement(By.id('email')).sendKeys('danialPersonal@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.css('button[onclick="login()"]')).click();

        // Wait for redirection to the home page
        await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);

        // Load facility resources
        await driver.executeScript("viewResources()");
        await driver.executeScript("viewUser()");

        // Open the first facility's modal
        const facilities = await driver.wait(until.elementsLocated(By.className('facility-container')), timeout);
        if (facilities.length > 0) {
            await facilities[0].click();
        } else {
            throw new Error("No facilities found");
        }

        // Click the "Reviews" button
        const reviewsButton = await driver.wait(until.elementLocated(By.id('reviewsButton')), timeout);
        await driver.wait(until.elementIsVisible(reviewsButton), timeout);
        await reviewsButton.click();

        // Open the Add Review modal
        const addReviewButton = await driver.findElement(By.id('addReviewButton'));
        await addReviewButton.click();

        // Find the username input field within the modal
        const usernameInput = await driver.findElement(By.id('username'));

        // Get the value of the username input field
        const usernameValue = await usernameInput.getAttribute('value');

        // Verify that the username is as expected
        expect(usernameValue).to.equal('tengku'); // Replace with the expected username

        // Check if the username input field is read-only
        const isReadOnly = await usernameInput.getAttribute('readonly');
        expect(isReadOnly).to.be.ok;

    });

    it('should login, add a review correctly', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented';
        await driver.get(baseUrl + '/login.html');

        //Fill login sections
        await driver.findElement(By.id('email')).sendKeys('danialPersonal@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.css('button[onclick="login()"]')).click();

        // Wait for redirection to the home page
        await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);

        // Load facility resources
        await driver.executeScript("viewResources()");
        await driver.executeScript("viewUser()");

        // Open the first facility's modal
        const facilities = await driver.wait(until.elementsLocated(By.className('facility-container')), timeout);
        if (facilities.length > 0) {
            await facilities[0].click();
        } else {
            throw new Error("No facilities found");
        }

        // Click the "Reviews" button
        const reviewsButton = await driver.wait(until.elementLocated(By.id('reviewsButton')), timeout);
        await driver.wait(until.elementIsVisible(reviewsButton), timeout);
        await reviewsButton.click();

        // Open the Add Review modal
        const addReviewButton = await driver.findElement(By.id('addReviewButton'));
        await addReviewButton.click();

        // Wait for the modal to be visible
        await driver.findElement(By.id('addReviewModal'));

        // Wait for the reviewTextarea to be visible
        const reviewTextarea = await driver.wait(until.elementLocated(By.id('reviewBody')), timeout);
        await driver.wait(until.elementIsVisible(reviewTextarea), timeout);
        await reviewTextarea.sendKeys('This is a test review.');
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Submit the review
        const submitButton = await driver.findElement(By.css('button[onclick="submitReview()"]'), timeout);
        await submitButton.click();

        // Click the "Reviews" button again to open the review
        await new Promise(resolve => setTimeout(resolve, 1000))
        const finalReviewButton = await driver.findElement(By.xpath('//button[text()="Reviews"]'),);
        await finalReviewButton.click();


        // Verify the review was added
        await new Promise(resolve => setTimeout(resolve, 1000))
        const reviewText = await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'This is a test review.')]")), 100000);
        const isReviewDisplayed = await reviewText.isDisplayed();
        expect(isReviewDisplayed).to.be.true;
    });

    it('should login, try to submit empty review but should not work', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented'
        await driver.get(baseUrl + '/login.html');

        //Fill login sections
        await driver.findElement(By.id('email')).sendKeys('danialPersonal@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.css('button[onclick="login()"]')).click();

        // Wait for redirection to the home page
        await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);

        // Load facility resources
        await driver.executeScript("viewResources()");
        await driver.executeScript("viewUser()");

        // Open the first facility's modal
        const facilities = await driver.wait(until.elementsLocated(By.className('facility-container')), timeout);
        if (facilities.length > 0) {
            await facilities[0].click();
        } else {
            throw new Error("No facilities found");
        }

        // Click the "Reviews" button
        const reviewsButton = await driver.wait(until.elementLocated(By.id('reviewsButton')), timeout);
        await driver.wait(until.elementIsVisible(reviewsButton), timeout);
        await reviewsButton.click();

        // Open the Add Review modal
        const addReviewButton = await driver.findElement(By.id('addReviewButton'), timeout);
        await addReviewButton.click();

        // Wait for the modal to be visible
        await driver.findElement(By.id('addReviewModal'), timeout);

        // Attempt to submit the review without entering any text
        await new Promise(resolve => setTimeout(resolve, 1000))
        const submitButton = await driver.findElement(By.xpath('//button[text()="Submit Review"]'), timeout);
        await submitButton.click();

        // Wait for the error message to be visible
        const errorMessage = await driver.wait(until.elementLocated(By.id('reviewError')), timeout);
        await driver.wait(until.elementIsVisible(errorMessage), timeout);
        const errorText = await errorMessage.getText();

        // Check that the error message is the expected text
        expect(errorText).to.equal('Review body should not be blank');
    });

});

describe('Edit Review Functionality', function () {
    this.timeout(timeout);
    const reviewFilePath = 'utils/reviews.json';
    var orgContent = '';

    beforeEach(async () => {
        orgContent = await fs.readFile(reviewFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });

    afterEach(async () => {
        await fs.writeFile(reviewFilePath, JSON.stringify(orgContent), 'utf8');
    });

    it('Should login, open edit review modal, and verify username field is correct and uneditable', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented';
        await driver.get(baseUrl + '/login.html');
    
        // Log in
        await driver.findElement(By.id('email')).sendKeys('weicheng@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.css('button[onclick="login()"]')).click();
    
        // Wait for redirection to the home page
        await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);
    
        // Load facility resources
        await driver.executeScript("viewResources()");
        await driver.executeScript("viewUser()");
    
        // Open the first facility's modal
        const facilities = await driver.wait(until.elementsLocated(By.className('facility-container')), timeout);
        if (facilities.length > 0) {
            await facilities[0].click();
        } else {
            throw new Error("No facilities found");
        }
    
        // Click the "Reviews" button
        const reviewsButton = await driver.wait(until.elementLocated(By.id('reviewsButton')), timeout);
        await driver.wait(until.elementIsVisible(reviewsButton), timeout);
        await reviewsButton.click();
    
        // Click the "Edit" button, assuming only one is visible for the user's review
        await new Promise(resolve => setTimeout(resolve, 1000));
        const editButton = await driver.findElement(By.css('.edit-btn'));
        await editButton.click();
    
        // Wait for the edit modal to be visible
        await driver.wait(until.elementLocated(By.id('editReviewModal')), timeout);
        const editReviewModal = await driver.findElement(By.id('editReviewModal'));
        await driver.wait(until.elementIsVisible(editReviewModal), timeout);
    
        // Find the username input field within the modal
        const usernameInput = await driver.findElement(By.id('editUsername'));
    
        // Get the value of the username input field
        const usernameValue = await usernameInput.getAttribute('value');
    
        // Verify that the username is as expected
        expect(usernameValue).to.equal('weicheng');
    
        // Check if the username input field is read-only
        const isReadOnly = await usernameInput.getAttribute('readonly');
        expect(isReadOnly).to.be.ok;
    
    });
    
    it('should login and successfully edit a review', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented';
        await driver.get(baseUrl + '/login.html');

        // Log in
        await driver.findElement(By.id('email')).sendKeys('weicheng@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.css('button[onclick="login()"]')).click();

        // Wait for redirection to the home page
        await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);

        // Load facility resources
        await driver.executeScript("viewResources()");
        await driver.executeScript("viewUser()");

        // Open the first facility's modal
        const facilities = await driver.wait(until.elementsLocated(By.className('facility-container')), timeout);
        if (facilities.length > 0) {
            await facilities[0].click();
        } else {
            throw new Error("No facilities found");
        }

        // Click the "Reviews" button
        const reviewsButton = await driver.wait(until.elementLocated(By.id('reviewsButton')), timeout);
        await driver.wait(until.elementIsVisible(reviewsButton), timeout);
        await reviewsButton.click();

        await new Promise(resolve => setTimeout(resolve, 1000))
        // Click the "Edit" button, assuming only one is visible for the user's review
        const editButton = await driver.findElement(By.css('.edit-btn'));
        await editButton.click();

        await new Promise(resolve => setTimeout(resolve, 1000))
        // Wait for the edit modal to be visible
        await driver.wait(until.elementLocated(By.id('editReviewModal')), timeout);
        const editReviewModal = await driver.findElement(By.id('editReviewModal'));
        await driver.wait(until.elementIsVisible(editReviewModal), timeout);

        // Fill the review textarea
        const editReviewTextarea = await driver.findElement(By.id('editReviewBody'));
        await editReviewTextarea.clear();
        await editReviewTextarea.sendKeys('Edited review content.');
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Submit the edit
        const saveChangesButton = await driver.findElement(By.css('button[onclick="submitEditReview()"]'));
        await saveChangesButton.click();

        // Verification step would go here - depending on application behavior
    });

    it('should login, try to edit a review with an empty body and fail', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented';
        await driver.get(baseUrl + '/login.html');

        // Log in
        await driver.findElement(By.id('email')).sendKeys('weicheng@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.css('button[onclick="login()"]')).click();

        // Wait for redirection to the home page
        await driver.wait(until.urlIs(baseUrl + '/home.html'), timeout);

        // Load facility resources
        await driver.executeScript("viewResources()");
        await driver.executeScript("viewUser()");

        // Open the first facility's modal
        const facilities = await driver.wait(until.elementsLocated(By.className('facility-container')), timeout);
        if (facilities.length > 0) {
            await facilities[0].click();
        } else {
            throw new Error("No facilities found");
        }

        // Click the "Reviews" button
        const reviewsButton = await driver.wait(until.elementLocated(By.id('reviewsButton')), timeout);
        await driver.wait(until.elementIsVisible(reviewsButton), timeout);
        await reviewsButton.click();
        // Click the "Edit" button, assuming only one is visible for the user's review
        const editButton = await driver.findElement(By.css('.edit-btn'));
        await editButton.click();

        // Wait for the edit modal to be visible
        await driver.wait(until.elementLocated(By.id('editReviewModal')), timeout);
        const editReviewModal = await driver.findElement(By.id('editReviewModal'));
        await driver.wait(until.elementIsVisible(editReviewModal), timeout);

        // Clear the review textarea to simulate the user deleting the review content
        const editReviewTextarea = await driver.findElement(By.id('editReviewBody'));
        await editReviewTextarea.clear();

        // Attempt to submit the edit
        const saveChangesButton = await driver.findElement(By.css('button[onclick="submitEditReview()"]'));
        await saveChangesButton.click();

        // Wait for the error message to be visible
        const errorMessage = await driver.wait(until.elementLocated(By.id('reviewError')), timeout);
        await driver.wait(until.elementIsVisible(errorMessage), timeout);
        const errorText = await errorMessage.getText();

        // Check that the error message is the expected text
        expect(errorText).to.equal('Review body should not be blank');
    });

});

afterEach(async function () {
    await driver.executeScript('return window.__coverage__;').then(async (coverageData) => {
        if (coverageData) {
            // Save coverage data to a file
            await fs.writeFile('coverage-frontend/coverageReview' + counter++ + '.json',
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
    process.exit(0);
});