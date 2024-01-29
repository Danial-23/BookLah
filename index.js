var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const logger = require('./logger');

const PORT = process.env.PORT || 5050
var startPage = "index.html";

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("./public"));


const statusMonitor = require('express-status-monitor');
app.use(statusMonitor());

const { register, login,getAllUsers } = require('./utils/userUtil')
app.post('/register', register);
app.post('/login', login);

app.get('/all-user',getAllUsers)

const{viewFacility}=require('./utils/facilityUtil')
app.get('/view-facility',viewFacility)

const { viewUserBookings, addBooking, updateBooking } = require('./utils/bookingUtil')
app.get('/view-user-booking/:name', viewUserBookings)
app.post('/add-booking', addBooking);
app.put('/update-booking/:id', updateBooking);

const { addReview, viewReviewByFacility, viewUserReviews, editReview} = require('./utils/reviewsUtil');
app.post('/add-review', addReview);
app.get('/view-review-facility/:facilityId', viewReviewByFacility);
app.get('/view-reviews-user/:username', viewUserReviews);
app.put('/edit-review', editReview);

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" +startPage);

})

const server=app.listen(PORT, function () {
    console.log(`Demo project at: ${PORT}`);
    logger.info(`Demo project at: ${PORT}!`);
    logger.error(`Example or error log`)
});

module.exports={app,server}