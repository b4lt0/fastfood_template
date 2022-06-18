//require needed packages
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/connectDatabase');
const dotenv = require('dotenv');
const cors = require('cors');
const {logger} = require('./middlewares/logEvents');
const errorHandler = require('./middlewares/errorHandler');
const registerController = require("./controllers/registerController");
const jwt = require('jsonwebtoken');
const path = require("path");
const cookieParser = require("cookie-parser");
const verifyJWT = require("./middlewares/verifyJWT");
const bodyParser = require('body-parser');

//create express object
const app = express();

//config .env file
dotenv.config();

//declare server port
const SERVER_PORT = process.env.PORT || 3500;

//use custom logger for debugging
app.use(logger);

// allow cross origin requests
//TODO add whitelist and cors options
//TODO uncomment (need for testing with postman)
//app.use(cors())

//--------------------
app.use(cookieParser());

//--------------------
//TODO bodyparser is deprecated, try express.json()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//serve static files
//app.use('/', express.static(path.join(__dirname, '/public')));

// -------------------
app.use(express.json());

// routes
// app.use('/', require('./routes/root'));
app.use('/register', require('./routes/signup'));
app.use('/auth', require('./routes/authentication'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/signout'));

app.use(verifyJWT);
app.use('/users', require('./routes/api/users'));
app.use('/products', require('./routes/api/products'));
app.use('/cart', require('./routes/api/cart'));
app.use('/transaction', require('./routes/api/transaction'));
app.use('/order', require('./routes/api/order'));

// default 404 route at the end of the routes cascade
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({"error": "404 Not Found"});
    } else {
        res.type('txt').send("404 Not Found");
    }
});

//use custom error handler (see errorHandler)
app.use(errorHandler);

//connect to MongoDB
connectDB();

//check if db is connected
const db = mongoose.connection;
db.once("open", () => {
    console.log('Successfully connected to MongoDB using Mongoose!');
});

//activate server listener
try {
    const server = app.listen(SERVER_PORT, () =>
        console.log(`Server is running on port : ${SERVER_PORT}`));
} catch (e) {
    console.error(e);
}


