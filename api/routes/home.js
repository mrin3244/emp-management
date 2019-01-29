const express = require('express');
const mongodb = require('mongodb');
const bcrypt = require('bcrypt-nodejs');
const BaseJoi = require('joi');
// validate date
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
var sess = "";

module.exports = function(dbs){
    const router = express.Router();
    router.get('/', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            // count the total number of employee
          dbs.collection('employee').find().count(function(err, totalemp){
            if(err){
                return res.render('pages/500', {
                    eid:sess.eid, 
                    utypeid:sess.utypeid,
                    ename: sess.empdata[0].name, 
                    message: err
                });
            }
            // count todays attendance
            var start = new Date();
            start.setHours(0,0,0,0);
            var end = new Date();
            end.setHours(23,59,59,999);
            dbs.collection('attendance').find({"checkin": {$gte: start, $lt: end}}).count(function( err, empinoffice){
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name, 
                        message: err
                    });
                }
                var attendanceRate = (empinoffice * 100)/totalemp;
                return res.render('pages/home', {
                    eid:sess.eid, 
                    utypeid:sess.utypeid,
                    ename: sess.empdata[0].name,
                    totalemp: totalemp,
                    attendanceRate: attendanceRate
                });
            });
              
          });
            
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });
    // for insert new employee view page
    router.get('/insertemp', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            return res.render('pages/insert', {
                eid:sess.eid, 
                utypeid:sess.utypeid,
                ename: sess.empdata[0].name
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    // get data from insert view page and insert to the 'employee' collection
    router.post('/insertempvalue', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
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
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name, 
                        message: err
                    });
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
                            return res.render('pages/500', {
                                eid:sess.eid, 
                                utypeid:sess.utypeid,
                                ename: sess.empdata[0].name, 
                                message: "insert error"
                            });
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

    // view all employee details
    router.get('/viewall', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            dbs.collection('employee').find().toArray(function(err, docs){
                if(docs){
                    //console.log(docs);
                    return res.render('pages/viewall', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        employees: docs
                    });
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name, 
                        message: err
                    }); 
                }
                
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    //view particuler one employee details
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
                        ename: sess.empdata[0].name,
                        employee: doc
                    });
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name, 
                        message: err
                    });
                }
            })
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    // edit the employee details view page
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
                        ename: sess.empdata[0].name,
                        employee: doc
                    });
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name, 
                        message: err
                    });
                }
            })
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    // get the edited value and update the database
    router.post('/editempvalue', (req, res, next) => {
        if(sess.eid){
            const empId = mongodb.ObjectID(req.body.empId);
            const dataset = {
                name: req.body.name,
                email: req.body.email,
                // password: req.body.password,
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
                // password: Joi.string().required(),
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
                        ename: sess.empdata[0].name, 
                        message: err
                    });
                }
                if(result){
                    //console.log(result);
                    // const saltRounds = 10;
                    // var salt = bcrypt.genSaltSync(saltRounds);
                    // var hash = bcrypt.hashSync(result.password, salt);
                    // result.password = hash;
                    dbs.collection('employee').findOneAndUpdate({"_id":empId}, {$set: result}, function(err,result){
                        
                        if(result){
                            return res.redirect('/home');
                            //return res.status(200).json({"message":"update account "+eId});
                        } 
                        if(err){
                            return res.render('pages/500', {
                                eid:sess.eid, 
                                utypeid:sess.utypeid,
                                ename: sess.empdata[0].name, 
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

    // delete the particuler employee details
    router.get('/delete/:empId', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
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
                        ename: sess.empdata[0].name, 
                        message: err
                    });
                }
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
        
        
    });

    return router;
};