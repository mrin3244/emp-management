const express = require('express');
//const checkAuth = require('../middleware/auth');
const mongodb = require('mongodb');
const bcrypt = require('bcrypt-nodejs');
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
var sess = "";

module.exports = function(dbs){
    const router = express.Router();
    router.get('/', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            return res.render('pages/home', {eid:sess.eid, utypeid:sess.utypeid});
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });
    router.get('/insertemp', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            return res.render('pages/insert', {eid:sess.eid, utypeid:sess.utypeid});
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    router.post('/insertempvalue', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            // const dataset = {
            //     name: req.body.name,
            //     email: req.body.email,
            //     password: req.body.password,
            //     dob: req.body.dob,
            //     jobtitle: req.body.jobtitle,
            //     phone: req.body.phone,
            //     language: req.body.language,
            //     Address: req.body.Address,
            //     sex: req.body.sex
            // };
             //console.log(req.body);
            const schema = Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
                dob: Joi.date().format('YYYY-MM-DD').raw(),
                jobtitle: Joi.string().required(),
                phone: Joi.number().integer().min(1000000000).max(9999999999),
                language: Joi.array().required(),
                address: Joi.string().required(),
                sex: Joi.string().required(),
                utypeid: Joi.number().integer().required(),
            });
            Joi.validate(req.body, schema, (err, result) => {
                if(err){
                    return res.render('pages/500', {eid:sess.eid, utypeid:sess.utypeid, message: err});
                }
                if(result){
                    //console.log(result);
                    const saltRounds = 10;
                    var salt = bcrypt.genSaltSync(saltRounds);
                    var hash = bcrypt.hashSync(result.password, salt);
                    result.password = hash;
                    dbs.collection('employee').insertOne(result, function(err,result){
                        
                        if(result){
                            return res.redirect('/home');
                            //return res.status(200).json({"message":"update account "+eId});
                        } 
                        if(err){
                            return res.render('pages/500', {eid:sess.eid, utypeid:sess.utypeid, message: "insert error"});
                        }
                    });
                }
            });
            //return res.render('pages/viewone', {eid:sess.eid, utypeid:sess.utypeid});
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });


    router.get('/viewall', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            dbs.collection('employee').find().toArray(function(err, docs){
                if(docs){
                    //console.log(docs);
                    return res.render('pages/viewall', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        employees: docs
                    });
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid, 
                        message: err
                    }); 
                }
                
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });
    router.get('/viewone/:id', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            const id = mongodb.ObjectID(req.params.id);
            dbs.collection('employee').findOne({"_id":id}, function(err, doc){
                if(doc){
                    //console.log(doc);
                    return res.render('pages/viewone', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        employee: doc
                    });
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid, 
                        message: err
                    });
                }
            })
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });


    router.get('/edit/:id', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            const id = mongodb.ObjectID(req.params.id);
            dbs.collection('employee').findOne({"_id":id}, function(err, doc){
                if(doc){
                    //console.log(doc);
                    return res.render('pages/edit', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        employee: doc
                    });
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid, 
                        message: err
                    });
                }
            })
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });
    router.post('/editempvalue', (req, res, next) => {
        if(sess.eid){
            const empId = mongodb.ObjectID(req.body.empId);
            const dataset = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                dob: req.body.dob,
                jobtitle: req.body.jobtitle,
                phone: req.body.phone,
                language: req.body.language,
                address: req.body.address,
                sex: req.body.sex,
                utypeid: req.body.utypeid
            };

            const schema = Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
                dob: Joi.date().format('YYYY-MM-DD').raw(),
                jobtitle: Joi.string().required(),
                phone: Joi.number().integer().min(1000000000).max(9999999999),
                language: Joi.array().required(),
                address: Joi.string().required(),
                sex: Joi.string().required(),
                utypeid: Joi.number().integer().required(),
            });
            
            Joi.validate(dataset, schema, (err, result) => {
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid, 
                        message: err
                    });
                }
                if(result){
                    //console.log(result);
                    dbs.collection('employee').findOneAndUpdate({"_id":empId}, {$set: result}, function(err,result){
                        
                        if(result){
                            return res.redirect('/home');
                            //return res.status(200).json({"message":"update account "+eId});
                        } 
                        if(err){
                            return res.render('pages/500', {
                                eid:sess.eid, 
                                utypeid:sess.utypeid, 
                                message: err
                            });
                        }
                    });
                }
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
        
    });

    router.get('/delete/:empId', (req, res, next) => {
        if(sess.eid){
            const empId = mongodb.ObjectID(req.params.empId);
            //console.log(empId);
            dbs.collection('employee').deleteOne({"_id":empId}, function(err, result){
                if(result){
                    return res.redirect('/home');
                    //res.status(200).json(result);
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid, 
                        message: err
                    });
                }
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
        
        
    });

    router.get('/attendance', (req, res, next) => {
        if(sess.eid){
            var datetime = require('node-datetime');
            var dt = datetime.create();
            var date = dt.format('Y/m/d');
            var time = dt.format('H:M:S');
            // console.log(date);
            // console.log(time);
            res.render('pages/put_attendance', { 
                date: date, 
                time: time, 
                eid:sess.eid, 
                utypeid:sess.utypeid
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
        
        //res.status(200).json({welcome:"welcome"});
    });

    return router;
};