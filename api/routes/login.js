const express = require('express');
const bcrypt = require('bcrypt-nodejs');
//const jwt = require('jsonwebtoken');
var sess = "";


module.exports = function(dbs){
    const router = express.Router();
    router.post('/', (req, res, next) => {
        sess = req.session;
        //res.status(200).json({"message": "welcome login"})
        dbs.collection('employee').find({"email":req.body.email}).toArray(function(err, docs){
            if(err){
                return res.redirect('/err?message='+err);
            }
            if(docs.length < 1){
                return res.redirect('/err?message=Auth failed');
            }
            bcrypt.compare(req.body.password, docs[0].password, (err, result) => {
                if(err){
                    return res.redirect('/err?message='+err);  
                }
                if(result){
                    sess.eid=docs[0]._id;
                    sess.utypeid=docs[0].utypeid;
                    res.redirect('/home');
                }
            });
        
        });
    });


    return router;
};