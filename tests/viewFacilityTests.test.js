const { describe, it } = require('mocha');
const { expect } = require('chai');
const fs = require('fs').promises;
const { viewFacility} = require('../utils/facilityUtil')


describe('Testing viewFacility Function', () => {
    const facilitiesFilePath = 'utils/facilities.json';
    var orgContent = "";

    beforeEach(async () => {
        orgContent = await fs.readFile(facilitiesFilePath, 'utf8');
        orgContent = JSON.parse(orgContent);
    });
    it('Should return an array when viewing facility', async () => {
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
        await viewFacility(req, res);
    });
});