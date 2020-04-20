const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require("../models/orders");
const Product = require("../models/products");

router.get('/', (req, res, next) => {
    Order.find()
    .select('product quantity _id')  //specific data to retrive
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request : {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/'+doc._id
                        }
                    }
                })    
            });    
        })
        .catch(err => {
            console.log(err);
            res.status(200).json({error: err});
        });    
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if(!product) {
            res.status(404).json({
                message: 'Product not found'
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity
        });
        return order.save();
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order Store succesfully',
            createdOrder: {
                _id: result.id,
                product: result.product,
                quantity: result.quantity,
                request : {
                    type: 'POST',
                    url: 'http://localhost:3000/orders/'+ result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(201).json({
            error: err
        });
    });
    //send post request as
    // {
    // 	"productId": "5e9d7e6a72a97f3730b0f810", //id of any product
    // 	"quantity": "2"
    // }
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
    .exec()
    .then(doc => {
        console.log(doc);
        if(doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/'+ doc._id
                }
            });
        } else {
            res.status(200).json({message: "No Valid entry found for provided Id"});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(200).json({error: err});
    });
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({_id: id})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Product Deleted',
            request: {
                type: 'DELETE',
                url: 'http://localhost:3000/orders',
                data: {productId: 'ID', quantity: 'Number'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(200).json({error: err});
    });
});

module.exports = router;