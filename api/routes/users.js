const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const process = require('../../nodemon.json');

//For testing purpose
router.get('/', (req, res, next) => {
    User.find()
        .then( users => {
            console.log(users);
            res.status(200).json({
                count: users.length,
                users: users
            })
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({
                message: 'Cannot get the user requested',
                error: err
            });
        });
});
//Sign up route
router.post('/signup', (req, res, next) => {
    const email = req.body.email;
    const passtheword = req.body.passtheword;
    User.find({ email: email })
        .exec()
        .then(user => {
            if(user.length >= 1) {
                res.status(409).json({
                    message: 'Mail exists'
                })
            } else {
                bcrypt.hash(req.body.passtheword, 10, (err, hash) => {
                    if(err) {
                        res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            passtheword: hash
                        });
                        user.save()
                            .then( result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created',
                                    email: result.email,
                                    _id: result._id
                                });
                            })
                            .catch( err => {
                                console.log(err);
                                res.status(415).json({
                                    message: 'Cannot add the user',
                                    error: err
                                });
                            });
                    }
                });
            }
        });
});
//Sign in route
router.get('/:userId', (req, res, next) => {
    const userId = req.params.userId;
    User.findById(userId)
        .exec()
        .then( user => {
            console.log(user);
            res.status(200).json({
                message: 'Got the user',
                request: {
                    type: "GET",
                    user: user
                }
            });
        })
        .catch( err => {
            res.status(404).json({
                message: 'Cannot get the user',
                error: err
            })
        });
});

router.post("/login", (req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.passtheword, user[0].passtheword, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                  expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

router.delete('/:userId', (req, res, next) => {
    const userId = req.params.userId;
    User.deleteOne({ _id: userId})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'User deleted',
                result: result
            })
        })
        .catch(err => {
            res.status(404).json({
                message: 'Cannot delete the user',
                error: err
            });
        });
});

/* 

401 unauthorised
415 unsupported media type(resource not created)

*/
module.exports = router;
