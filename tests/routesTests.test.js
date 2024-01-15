const { describe, it } = require('mocha');
const { expect } = require('chai');
const { app, server } = require('../index');
const fs = require('fs').promises;
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
describe('Testing API Routes', () => {
    const usersFilePath = 'utils/users.json';
    var orgContent = "";
    const resourcesFilePath = 'utils/facilities.json';
    var orgResources = "";

    beforeEach(async () => {
        orgContent = await fs.readFile(usersFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);

        orgResources = await fs.readFile(resourcesFilePath, 'utf8');
    orgResources = JSON.parse(orgResources);
    });
    afterEach(async () => {
        await fs.writeFile(usersFilePath, JSON.stringify(orgContent), 'utf8');
        await fs.writeFile(resourcesFilePath, JSON.stringify(orgResources), 'utf8');
    });

    it('Should register a new user successfully', (done) => {
        chai.request(app)
            .post('/register')
            .send({ email: 'james@gmail.com',username: 'helloThere', password: 'testpassword' })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                done();
                server.close();
            });
    }); 
    it('Should log in an existing user successfully', (done) => {
        chai.request(app)
            .post('/login')
            .send({ email: orgContent[0].email, password: orgContent[0].password, })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res.body.message).to.equal('Login successful!');
                done();
                server.close();
            });
    });
    
    it('Should retrieve resource successfully', (done) => {
        chai.request(app)
        .get('/view-facility')
        .send()
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body).to.have.lengthOf(orgResources.length);
            done();
            server.close();
        });
    });
        
});