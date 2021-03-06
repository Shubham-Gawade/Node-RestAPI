const express = require("express");
const app = express();
const morgan = require('morgan');   
const bodyparser = require('body-parser'); 
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

mongoose.connect("mongodb+srv://shubhamg_7292:"+process.env.MONGO_ATLAS_PW+"@cluster0-cr1db.mongodb.net/Shop-Data?retryWrites=true&w=majority", { useNewUrlParser: true , useUnifiedTopology: true});

//Default nodejs promice implementaion instead of mongoose
mongoose.Promise = global.Promise;

//Morgan is used to handle errors on server side
app.use(morgan('dev'));

//bodyparser is used to get body from response
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//Headres apended in incoming request
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

//Routes which should handle requeste
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status= 404;
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

module.exports = app;