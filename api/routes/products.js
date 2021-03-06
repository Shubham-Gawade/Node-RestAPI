const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,'./uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
});

const upload = multer({storage: storage});

const Product = require("../models/products")

router.get('/', (req, res, next) => {
    Product.find()
    .select('name price _id')  //specific data to retrive
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request : {
                            type: 'GET',
                            url: 'http://localhost:3000/products/'+ doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(200).json({error: err});
    });
});

router.post('/', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        price: req.body.price
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created product succesfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request : {
                    type: 'POST',
                    url: 'http://localhost:3000/products/'+ result._id
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
    //send post request like this
    // {
    //     "name": "NetFlix",
    //     "price":"25"
    // }
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id')
    .exec()
    .then(doc => {
        console.log(doc);
        if(doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+ doc._id
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

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    //Product.update({_id: id},{ $set: { name: req.body.newName ,price: req.body.newPrice}})
    Product.update({_id: id},{ $set: updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Product Updated',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/products/'+ id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(200).json({error: err});
    });

    // send patch request like this
    //[
    //     {
    //         "propName": "name",
    //         "value": "Harry Potter 6"
    //     }
    // ]
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Product Deleted',
            request: {
                type: 'DELETE',
                url: 'http://localhost:3000/products',
                data: {name: 'String', price: 'Number'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(200).json({error: err});
    });
});

module.exports = router;