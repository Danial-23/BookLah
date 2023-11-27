const { describe, it } = require('mocha');
const { expect } = require('chai');
const fs = require('fs').promises;
const { register, login,getAllUsers } = require('../utils/userUtil')
describe('Testing Register Function', () => {
    const usersFilePath = 'utils/users.json';
    var orgContent = "";
    beforeEach(async () => {
        orgContent = await fs.readFile(usersFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });
    afterEach(async () => {
        await fs.writeFile(usersFilePath, JSON.stringify(orgContent), 'utf8');
    });
    it('Should register a new user successfully', async () => {
        const req = {
            body: {
                email: 'mary@gmail.com',
                username: 'johnson',
                password: '123456',
            },
        };
        const res = {
            status: function (code) {
            expect(code).to.equal(201);
            return this;
            },
            json: function (data) {
                expect(data).to.have.lengthOf(orgContent.length + 1);
                expect(data[orgContent.length].email).to.equal(req.body.email);
                expect(data[orgContent.length].username).to.equal(req.body.username);
                expect(data[orgContent.length].password).to.equal(req.body.password);
            },
        };
        await register(req, res);
    });
    it('Should shows validation error due to email', async () => {
        const req = {
            body: {
                email: 'simon#gmail.com',
                username: 'johnson',
                password: '123456',
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Validation error');
            },
        };
        await register(req, res);
    });
    it('Should shows validation error due to username', async () => {
        const req = {
            body: {
                email: 'simon@gmail.com',
                username: 'john',
                password: '123456',
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Username must be at least 6 characters long');
            },
        };
        await register(req, res);
    });
    it('Should shows validation error due to password length', async () => {
        const req = {
            body: {
                email: 'simon@gmail.com',
                username: 'johnson',
                password: '123',
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Validation error');
            },
        };
        await register(req, res);
    });
});
describe('Testing Login Function', () => {
    const usersFilePath = 'utils/users.json';
    var orgContent = "";
    beforeEach(async () => {
        orgContent = await fs.readFile(usersFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });
    it('Should login successfully',async()=>{
        const req={
            body: {
                email: orgContent[0].email,
                password: orgContent[0].password,
            }
        };
        const res={
            status: function(code){
                expect(code).to.equal(201);
                return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Login successful!');
            },
        };
        await login(req,res);
    })
    it('Should shows invalid credentials', async () => {
        const req = {
            body: {
                email: orgContent[0].email,
                password: 'abcdefg',
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
            return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Invalid credentials!');
            },
        };
        await login(req, res);
    });
    it('Should shows invalid credentials', async () => {
        const req = {
            body: {
                email: "haha@gmail.com",
                password: orgContent[0].password,
            },
        };
        const res = {
            status: function (code) {
                expect(code).to.equal(500);
            return this;
            },
            json: function (data) {
                expect(data.message).to.equal('Invalid credentials!');
            },
        };
        await login(req, res);
    });
});
describe('Testing get all user', () => {
    const facilitiesFilePath = 'utils/users.json';
    var orgContent = "";

    beforeEach(async () => {
        orgContent = await fs.readFile(facilitiesFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });
    it('Should return an array when viewing users', async () => {
        const req = {};
        const res = {
            status: function (code) {
            expect(code).to.equal(201);
            return this;
            },
            json: function (data) {
                expect(Array.isArray(data)).to.be.true;
            },
        };
        await getAllUsers(req, res);
    });
});