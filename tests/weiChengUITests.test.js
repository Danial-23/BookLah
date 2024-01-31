const { app } = require('../index');
const { Builder, By, Key, until } = require('selenium-webdriver');
const { describe, it } = require('mocha');
const fs = require('fs').promises;

const { expect } = require('chai');
const chrome = require('selenium-webdriver/chrome');
const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless');
const driver = new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
var server;
counter = 0
// '/instrumented'+
before(async function () {
    server = await new Promise((resolve) => {
        server = app.listen(0, 'localhost', () => {
            resolve(server);
        });
    })
});

describe('Testing Home UI', function () {
    it('Should have the correct title', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/index.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);
        const title = await driver.getTitle();
        expect(title).to.equal('BookLah');
    });
});

describe('Testing clicking Login UI', function () {
    it('Should have the correct title', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/index.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);
        // Find and click the "Login" button
        const loginButton = await driver.findElement(By.className('login-btn'));
        await loginButton.click();
        await driver.wait(until.titleIs('DVOPS - Resource Management Web App'), 10000);
        const title = await driver.getTitle();
        expect(title).to.equal('DVOPS - Resource Management Web App');
    });
});

describe('Testing Login UI', function () {
    it('Should have the correct title', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);
        const title = await driver.getTitle();
        expect(title).to.equal('DVOPS - Resource Management Web App');
    });
    it('Should show error message - All fields required', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
        await driver.get(baseUrl);
        // Locate and interact with the email field
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('john@gmail.com');

        const loginButton = await driver.findElement(By.xpath('//button[text()="Login"]'));
        await loginButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        expect(errorMessage).to.equal('All fields are required!');
    });
    it('Should show error message - Invalid credentials for password', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('john@gmail.com');
        const passwordElement = await driver.findElement(By.id('password'));
        await passwordElement.click(); // Click on the element
        await passwordElement.sendKeys('abcdef');
        const loginButton = await driver.findElement(By.xpath('//button[text()="Login"]'));
        await loginButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        const errorStyle = await driver.findElement(By.id('error')).getAttribute('class');

        expect(errorMessage).to.equal('Invalid credentials!');
        expect(errorStyle).to.equal('text-danger');
    });
    it('Should show error message - Invalid credentials for email', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('johngmail.com');
        const passwordElement = await driver.findElement(By.id('password'));
        await passwordElement.click(); // Click on the element
        await passwordElement.sendKeys('123456');
        const loginButton = await driver.findElement(By.xpath('//button[text()="Login"]'));
        await loginButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        const errorStyle = await driver.findElement(By.id('error')).getAttribute('class');
        expect(errorMessage).to.equal('Invalid credentials!');
        expect(errorStyle).to.equal('text-danger');
    });
    it('Should show error message for unsuccessful login', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
        await driver.get(baseUrl);

        const loginButton = await driver.findElement(By.xpath('//button[text()="Login"]'));
        await loginButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        const errorStyle = await driver.findElement(By.id('error')).getAttribute('class');
        expect(errorMessage).to.equal('All fields are required!');
        expect(errorStyle).to.equal('text-danger');
    });
});

describe('Testing clicking Register UI', function () {
    it('Should have the correct title', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/index.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);
        const registerButton = await driver.findElement(By.className('register-btn'));
        await registerButton.click();
        await driver.wait(until.titleIs('DVOPS - Resource Management Web App'), 10000);
        const title = await driver.getTitle();
        expect(title).to.equal('DVOPS - Resource Management Web App');
    });
});

describe('Testing Register UI', function () {
    it('Should have the correct title', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/register.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);
        const title = await driver.getTitle();
        expect(title).to.equal('DVOPS - Resource Management Web App');
    });
    it('Should show error message - All fields required', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/register.html';
        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('john@gmail.com');
        const loginButton = await driver.findElement(By.xpath('//button[text()="Register"]'));
        await loginButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        expect(errorMessage).to.equal('All fields are required!');
    });
    it('Should show error message - Password does not match', async function () {
        this.timeout(100000);
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/register.html';
        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('paul@gmail.com');

        const usernameElement = await driver.findElement(By.id('username'));
        await usernameElement.click(); // Click on the element
        await usernameElement.sendKeys('sparky');

        const passwordElement = await driver.findElement(By.id('password'));
        await emailElement.click(); // Click on the element
        await passwordElement.sendKeys('123456');
        const confirmPasswordElement = await driver.findElement(By.id('confirmPassword'));
        await confirmPasswordElement.click(); // Click on the element
        await confirmPasswordElement.sendKeys('1234');
        const registerButton = await driver.findElement(By.xpath('//button[text()="Register"]'));
        await registerButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        const errorStyle = await driver.findElement(By.id('error')).getAttribute('class');
        expect(errorMessage).to.equal('Password does not match!');
        expect(errorStyle).to.equal('text-danger');
    });
    it('Should clear textboxes when Reset is clicked', async function () {
        this.timeout(100000);
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/register.html';
        await driver.get(baseUrl);
        // Locate and interact with the email field
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('paul@gmail.com');
        const passwordElement = await driver.findElement(By.id('password'));
        await emailElement.click(); // Click on the element
        await passwordElement.sendKeys('123456');
        const confirmPasswordElement = await driver.findElement(By.id('confirmPassword'));
        await confirmPasswordElement.click(); // Click on the element
        await confirmPasswordElement.sendKeys('1234');
        const resetButton = await driver.findElement(By.xpath('//button[text()="Reset"]'));
        await resetButton.click();
        const emailText = await emailElement.getText();
        const passwordText = await passwordElement.getText();
        const confirmPasswordText = await confirmPasswordElement.getText();
        expect(emailText).to.equal('');
        expect(passwordText).to.equal('');
        expect(confirmPasswordText).to.equal('');
    });
    it('Should show error message - Username length is less than 6', async function () {
        this.timeout(100000);
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/register.html';
        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('paul@gmail.com');

        const usernameElement = await driver.findElement(By.id('username'));
        await usernameElement.click(); // Click on the element
        await usernameElement.sendKeys('spark');


        // Locate and interact with the password field
        const passwordElement = await driver.findElement(By.id('password'));
        await emailElement.click(); // Click on the element
        await passwordElement.sendKeys('123456');
        // Locate and interact with the confirm password field
        const confirmPasswordElement = await driver.findElement(By.id('confirmPassword'));
        await confirmPasswordElement.click(); // Click on the element
        await confirmPasswordElement.sendKeys('123456');
        // Locate and interact with the Register button
        const registerButton = await driver.findElement(By.xpath('//button[text()="Register"]'));
        await registerButton.click();
        // Locate the error element and retrieve its text
        const errorMessage = await driver.findElement(By.id('error')).getText();
        const errorStyle = await driver.findElement(By.id('error')).getAttribute('class');
        // Assert that the error message contains the expected text and style
        expect(errorMessage).to.equal('Username must be at least 6 characters long!');
        expect(errorStyle).to.equal('text-danger');
    });
    it('Should show error message - Password length is less than 6', async function () {
        this.timeout(100000);
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/register.html';
        await driver.get(baseUrl);
        // Locate and interact with the email field
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('paul@gmail.com');

        const usernameElement = await driver.findElement(By.id('username'));
        await usernameElement.click(); // Click on the element
        await usernameElement.sendKeys('sparky');


        // Locate and interact with the password field
        const passwordElement = await driver.findElement(By.id('password'));
        await emailElement.click(); // Click on the element
        await passwordElement.sendKeys('12345');
        // Locate and interact with the confirm password field
        const confirmPasswordElement = await driver.findElement(By.id('confirmPassword'));
        await confirmPasswordElement.click(); // Click on the element
        await confirmPasswordElement.sendKeys('12345');
        // Locate and interact with the Register button
        const registerButton = await driver.findElement(By.xpath('//button[text()="Register"]'));
        await registerButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        const errorStyle = await driver.findElement(By.id('error')).getAttribute('class');

        expect(errorMessage).to.equal('Password length should not be less than 6!');
        expect(errorStyle).to.equal('text-danger');
    });
    it('Should show error message - Authentication failed!', async function () {
        this.timeout(100000);
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/register.html';
        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click();
        await emailElement.sendKeys('paulgmail.com');

        const usernameElement = await driver.findElement(By.id('username'));
        await usernameElement.click();
        await usernameElement.sendKeys('sparky');

        const passwordElement = await driver.findElement(By.id('password'));
        await emailElement.click(); // Click on the element
        await passwordElement.sendKeys('123456');
        const confirmPasswordElement = await driver.findElement(By.id('confirmPassword'));
        await confirmPasswordElement.click();
        await confirmPasswordElement.sendKeys('123456');
        const registerButton = await driver.findElement(By.xpath('//button[text()="Register"]'));
        await registerButton.click();
        const errorMessage = await driver.findElement(By.id('error')).getText();
        const errorStyle = await driver.findElement(By.id('error')).getAttribute('class');
        expect(errorMessage).to.equal('Authentication failed!');
        expect(errorStyle).to.equal('text-danger');
    });
});

describe('Testing Resource UI', function () {
    it('Should be able to display bookings', async function () {
        this.timeout(100000);
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';
        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click(); // Click on the element
        await emailElement.sendKeys('john@gmail.com');
        const passwordElement = await driver.findElement(By.id('password'));
        await passwordElement.click(); // Click on the element
        await passwordElement.sendKeys('123456');
        const loginButton = await driver.findElement(By.xpath('//button[text()="Login"]'));
        await loginButton.click();
        await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

        const bookingLink = await driver.findElement(By.linkText('Booking'));
        await bookingLink.click();
        await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/booking.html'), 10000);
        const currentUrlAfterBookingClick = await driver.getCurrentUrl();
        expect(currentUrlAfterBookingClick).to.equal('http://localhost:' + server.address().port + '/instrumented' + '/booking.html')

    });
});

describe('Testing Facility UI', function () {
    it('Should perform some test', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/home.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);
        const title = await driver.getTitle();
        expect(title).to.equal('DVOPS - Resource Management Web App');
    });
});

describe('Testing Facility UI', function () {
    it('Should display facilities and show details correctly', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/home.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);
        await driver.wait(until.elementLocated(By.className('facility-container')), 10000);

        const facilityContainers = await driver.findElements(By.className('facility-container'));
        const numberOfFacilities = facilityContainers.length;

        expect(numberOfFacilities).to.be.at.least(1);

        const firstFacilityContainer = facilityContainers[0];
        await firstFacilityContainer.click();
        console.log(await firstFacilityContainer.getAttribute('class'));
        //console.log(await firstFacilityContainer.getText());

        await driver.wait(until.elementLocated(By.id('name')), 10000);


        await driver.wait(until.elementLocated(By.id('name')), 10000);
        await driver.wait(until.elementIsVisible(driver.findElement(By.id('name'))), 10000);

        // Log facility details
        const facilityNameElement = await driver.findElement(By.id('name'));
        const facilityName = await facilityNameElement.getText();
        //console.log('Facility Name:', facilityName);

        const facilityImageElement = await driver.findElement(By.id('image'));
        const facilityImage = await facilityImageElement.getAttribute('src');
        //console.log('Facility Image:', facilityImage);

        const facilityAddressElement = await driver.findElement(By.id('address'));
        const facilityAddress = await facilityAddressElement.getText();
        //console.log('Facility Address:', facilityAddress);
        expect(facilityName).to.equal('Badminton Court');
        expect(facilityImage).to.equal('https://contents.mediadecathlon.com/s912305/k$bb31dac8bfd1f9cc2a58ec1e6c6efa1f/1920x0/1281pt854/2560xcr1629/default.jpeg?format=auto');
        expect(facilityAddress).to.equal('Tampines Walk, Level 3, Singapore 528523');

    });
});

describe('Testing Logout UI', function () {
    it('Should log out successfully and redirect to index.html', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/home.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);

        // Set a test username and email in sessionStorage
        await driver.executeScript("sessionStorage.setItem('username', 'testUser');");
        await driver.executeScript("sessionStorage.setItem('email', 'email@gmail.com');");

        const logoutButton = await driver.findElement(By.className('logout-btn'));

        await driver.executeScript("arguments[0].click();", logoutButton);

        await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/index.html'), 10000);

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.equal('http://localhost:' + server.address().port + '/instrumented' + '/index.html');

        const storedEmailAfterLogout = await driver.executeScript("return sessionStorage.getItem('email');");
        const storedUsernameAfterLogout = await driver.executeScript("return sessionStorage.getItem('username');");
        expect(storedEmailAfterLogout).to.be.null;
        expect(storedUsernameAfterLogout).to.be.null;
    });
});


describe('Testing Facility UI and Logout Functionality', function () {
    it('Should handle facility data not found for item and logout successfully', async function () {
        this.timeout(100000);
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/login.html';

        await driver.get(baseUrl);
        const emailElement = await driver.findElement(By.id('email'));
        await emailElement.click();
        await emailElement.sendKeys('john@gmail.com');
        const passwordElement = await driver.findElement(By.id('password'));
        await passwordElement.click();
        await passwordElement.sendKeys('123456');
        const loginButton = await driver.findElement(By.xpath('//button[text()="Login"]'));
        await loginButton.click();

        await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/home.html'), 10000);

        const logoutButton = await driver.findElement(By.className('logout-btn'));
        await driver.executeScript("arguments[0].click();", logoutButton);

        await driver.wait(until.urlIs('http://localhost:' + server.address().port + '/instrumented' + '/index.html'), 10000);

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.equal('http://localhost:' + server.address().port + '/instrumented' + '/index.html');

        const storedEmailAfterLogout = await driver.executeScript("return sessionStorage.getItem('email');");
        const storedUsernameAfterLogout = await driver.executeScript("return sessionStorage.getItem('username');");
        expect(storedEmailAfterLogout).to.be.null;
        expect(storedUsernameAfterLogout).to.be.null;
    });
});

describe('Testing sessionStorage for email', function () {
    it('Should set sessionStorage for email to "johnny"', async function () {
        const baseUrl = 'http://localhost:' + server.address().port + '/instrumented' + '/home.html';
        this.timeout(100000); // Set timeout as 10 seconds
        await driver.get(baseUrl);

        // Set sessionStorage for email to "johnny"
        await driver.executeScript("sessionStorage.setItem('email', 'john@gmail.com');");

        // Retrieve sessionStorage for email
        const storedEmail = await driver.executeScript("return sessionStorage.getItem('email');");

        // Assert that sessionStorage for email is "johnny"
        expect(storedEmail).to.equal('john@gmail.com');
    });
});

afterEach(async function () {
    await driver.executeScript('return window.__coverage__;').then(async (coverageData) => {
        if (coverageData) {
            // Save coverage data to a file
            await fs.writeFile('coverage-frontend/coverageLogin' + counter++ + '.json',
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

// after(async function () {
//     await driver.quit();
//     await server.close();
//     process.exit(0);
// });
