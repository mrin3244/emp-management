const express = require('express');
const mongodb = require('mongodb');
const Joi = require('joi');
var sess;

module.exports = function(dbs){
    const router = express.Router();
    router.get('/', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            const adminId = mongodb.ObjectID(sess.eid);
            dbs.collection('rules').findOne({"adminId":adminId}, function(err, doc){
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
                    return res.render('pages/rules_view', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname,
                        rule: doc
                    });
                }
                else{
                    return res.render('pages/rules_view', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname
                    });
                }

            });
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }

    });

    //Add new if not find any or edit old rule
    router.get('/set', (req, res, next) => {
        sess = req.session;
        if(sess.utypeid=='1'){
            const adminId = mongodb.ObjectID(sess.eid);
            //console.log(adminId);
            dbs.collection('rules').findOne({"adminId":adminId}, function(err, doc){
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
                else{
                    return res.render('pages/rules_edit', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname
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
            const adminId = mongodb.ObjectID(sess.eid);
            const schema = Joi.object().keys({
                starttime: Joi.string().required(),
                endtime: Joi.string().required()
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
                    dbs.collection('rules').findOneAndUpdate({"adminId":adminId}, {$set: result}, { upsert: true }, function(err,result){
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