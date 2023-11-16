const { readJSON, writeJSON } = require('./UserUtil')
const {Location} = require('../models/Facility');

async function viewLocation(req, res) {
    try {
      const allResources = await readJSON('utils/facilities.json');
      return res.status(201).json(allResources);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }


module.exports={viewLocation}