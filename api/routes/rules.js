const express = require('express');
const mongodb = require('mongodb');
const Joi = require('joi');
var sess;

module.exports = function(dbs){
    const router = express.Router();
    router.get('/', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            dbs.collection('rules').find().toArray(function(err, docs){
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname, 
                        message: err
                    }); 
                }
                if(docs){
                    //console.log(docs);
                    return res.render('pages/rules_view', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname,
                        rules: docs
                    });
                }
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }

    });

    router.get('/set', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            return res.render('pages/rules_set', {
                eid:sess.eid, 
                utypeid:sess.utypeid,
                ename: sess.empdata[0].name,
                imgname: sess.empdata[0].imgname
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }

    });


    router.post('/set', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            var rulename = req.body.rulename;
            dbs.collection('rules').findOne({"rulename":rulename}, function(err, doc){
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname, 
                        message: err
                    });
                }
                if(doc){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname, 
                        message: "Rules already exists"
                    });
                }
                else{
                    const schema = Joi.object().keys({
                        rulename: Joi.string().required(),
                        rulevalue: Joi.string().required()
                    });
                    Joi.validate(req.body, schema, (err, result) => {
                        if(err){
                            return res.render('pages/500', {
                                eid:sess.eid, 
                                utypeid:sess.utypeid,
                                ename: sess.empdata[0].name,
                                imgname: sess.empdata[0].imgname, 
                                message: err
                            });
                        }
                        if(result){
                            dbs.collection('rules').insertOne(result, function(err,result){
                                if(err){
                                    return res.render('pages/500', {
                                        eid:sess.eid, 
                                        utypeid:sess.utypeid,
                                        ename: sess.empdata[0].name,
                                        imgname: sess.empdata[0].imgname, 
                                        message: err
                                    });
                                }
                                if(result){
                                    return res.redirect('/rules');
                                } 

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

    //edit rule
    router.get('/edit/:ruleId', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            const ruleId = mongodb.ObjectID(req.params.ruleId);
            dbs.collection('rules').findOne({"_id":ruleId}, function(err, doc){
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname, 
                        message: err
                    });
                }
                if(doc){
                    //console.log(doc);
                    return res.render('pages/rules_edit', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname,
                        rule: doc
                    });
                }

            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }

    });

    router.post('/edit', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            const ruleId = mongodb.ObjectID(req.body.ruleId);
            delete req.body.ruleId;
            delete req.body.rulename;
            const schema = Joi.object().keys({
                rulevalue: Joi.string().required()
            });
            
            Joi.validate(req.body, schema, (err, result) => {
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname, 
                        message: err
                    });
                }
                if(result){
                    dbs.collection('rules').findOneAndUpdate({"_id":ruleId}, {$set: result}, function(err,result){
                        if(err){
                            return res.render('pages/500', {
                                eid:sess.eid, 
                                utypeid:sess.utypeid,
                                ename: sess.empdata[0].name,
                                imgname: sess.empdata[0].imgname, 
                                message: err
                            });
                        }
                        if(result){
                            return res.redirect('/rules');
                        } 

                    });
                }
            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }

    });

    router.get('/delete/:ruleId', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            const ruleId = mongodb.ObjectID(req.params.ruleId);
            dbs.collection('rules').deleteOne({"_id":ruleId}, function(err, result){
                if(result){
                    return res.redirect('/rules');
                }
                if(err){
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname, 
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