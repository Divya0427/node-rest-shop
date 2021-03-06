//Handling requests
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const process = require('./nodemon.json');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

//Use encodeURIComponent when the pwd has special characters
mongoose.connect(
    "mongodb+srv://" + process.env.MONGO_ATLAS_USERNAME + ":" + encodeURIComponent(process.env.MONGO_ATLAS_PW) + "@cluster0.irrxv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
.then(() => {
    console.log('MongoDB connected');
})
.catch((err) => {
    console.log(process.env.MONGO_ATLAS_PW);
    console.log(err);
    console.log('Error while connecting to MongoDB');
});

//mongoose.Promise = global.Promise;
//have to tell express to funnel all the requests through this morgan middleware

//middleware; can be a fn, 
/* app.use((req, res, next) => {
    res.status(200).json({
        message: 'It works!'
    });//send the json response by setting the right headers; automatically be stringified
    res.send({})
}); */

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Add CORS related headers before adding the routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});


app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found!!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

//Routes which should handle requests


module.exports = app;
