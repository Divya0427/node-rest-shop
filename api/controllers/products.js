const mongoose = require('mongoose');
const Product = require('../models/product');

exports.products_get_all = (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then( docs => {
            //console.log(fullUrl);
            const result = {
                count: docs.length,
                products: docs.map( doc => {
                    var requestedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        productImage: doc.productImage,
                        request: {
                            "type": "GET",
                            "url": `${requestedUrl}/${doc._id}`
                        }
                    }
                })
            }
            res.status(200).json(result);
        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        });
};

exports.products_create_product = (req, res, next) => {
    //To create a new product
    /*  
        - Body:: form-data: name, price, productImage
        - Headers:: Content-type: multipart/form-data; boundary=<calculated when request is sent>
        - Authorization:: Bearer Token: <token> we receive from localhost:3000/user/login POST request
        
        request:
            localhost:3000/user/login POST
        response:
        {
            "message": "Auth successful",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQHRlc3QuY29tIiwidXNlcklkIjoiNjFmNzhmZGI4YjA4ZDE3ZWU1MWUwOTI1IiwiaWF0IjoxNjQzNzIwMDEzLCJleHAiOjE2NDM3MjM2MTN9.ZpFZqGC_Hy4CVpKB5OI98gxNACt6jpr2Z7o4OSW7JDU"
        }
    
    */
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then(result => {
        console.log(result);
        var requestedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.status(201).json({
            message: 'New product is created successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'POST',
                    url: `${requestedUrl}/${result._id}`
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.products_get_product = (req, res, next) => {
    const id = req.params.productId;
    console.log(req.body);
    console.log(id);
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then( doc => {
            var requestedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            console.log(doc);
            if(doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: requestedUrl
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                });
            }
        })
        .catch( err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;    
    const updateOps = {};    
    if(req.body.name) {
        updateOps['name'] = req.body.name;
    }
    if(req.body.price) {
        updateOps['price'] = req.body.price;
    }
    if(req.file.path) {
        updateOps['productImage'] = req.file.path;
    }
    /* for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    } */
    /*
    Body:: form-data  name, price, productImage
    Headers:: Content-Type: multipart/form-data 
    Authorization:: Bearer token: <token>
    Headers:: Content-type: application/json
    
    */
    //Product.updateOne({ _id: id }, {$set: {name: req.body.newName, price: req.body.price}});
    //TODO:: Find the requested product, if exists, update that otherwise return 'didn't find the requested product'
    Product.updateOne({ _id: id }, {$set: updateOps})
        .exec()
        .then( result => {
            var requestedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.status(200).json({ 
                message: "Product is updated",
                request: {
                    type: 'GET',
                    url: `${requestedUrl}/${result._id}`
                }
            });
        })
        .catch( err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.products_delete = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .then( result => {
            var requestedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: requestedUrl,
                    body: {
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch( err => {
            res.status(500).json({
                error: err
            });
        });
};
