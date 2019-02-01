const express = require('express');
const mongodb = require('mongodb');
// for formating date and time
var moment = require('moment');

var sess = "";

module.exports = function(dbs){
    const router = express.Router();

    // open the page where employee submit thair attendence view page
    router.get('/', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            var dt= new Date();
            var date = moment(dt).format('DD/MM/YYYY');
            var time = moment(dt).format('HH:mm:ss');

            const eid = mongodb.ObjectID(sess.eid);
            var start = new Date();
            start.setHours(0,0,0,0);

            var end = new Date();
            end.setHours(23,59,59,999);
            dbs.collection('attendance').findOne({"empid":eid, "checkin": {$gte: start, $lt: end}}, function(err, doc){
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
                    res.render('pages/put_attendance', { 
                        date: date, 
                        time: time, 
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname,
                        checkin: doc.checkin,
                        checkout : doc.checkout
                    });
                } else {
                    res.render('pages/put_attendance', { 
                        date: date, 
                        time: time, 
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
        
        //res.status(200).json({welcome:"welcome"});
    });

    // take the attendance and insert or update the 'attendance' collection
    router.post('/attendance_submit', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            const eid = mongodb.ObjectID(sess.eid);
            // for insert new day data
            if(req.body.checkoption=="in"){
                const dataset = {
                    empid: eid,
                    checkin: new Date()
                };
                dbs.collection('attendance').insertOne(dataset, function(err,result){
                    if(result){
                        return res.redirect('/home');
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
            // for update the out time
            if(req.body.checkoption=="out"){
                const dataset = {
                    checkout: new Date()
                };
                var start = new Date();
                start.setHours(0,0,0,0);
                var end = new Date();
                end.setHours(23,59,59,999);
                dbs.collection('attendance').findOneAndUpdate({"empid":eid, "checkin": {$gte: start, $lt: end}}, {$set: dataset}, function(err,result){
                    if(result){
                        //console.log(result);
                        return res.redirect('/home');
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
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    // find a particular employee history
    router.get('/history/:empid', (req, res, next) => {
        sess = req.session;
        const empid = mongodb.ObjectID(req.params.empid);
        if(sess.eid){
            var date = new Date();
            var start = new Date(date.getFullYear(), date.getMonth(), 1);
            start.setHours(0,0,0,0);
            var end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            end.setHours(23,59,59,999);
            dbs.collection('attendance').find({"empid":empid, "checkin": {$gte: start, $lt: end}}).toArray(function( err, docs){
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
                    var days;
                    var intime;
                    var outtime;
                    var workhours;
                    var history=[];
                    var employee=[];
                    for(i=0; i<docs.length; i++){
                        days = moment(docs[i].checkin).format('DD/MM/YYYY');
                        intime = moment(docs[i].checkin).format('HH:mm:ss');
                        outtime = moment(docs[i].checkout).format('HH:mm:ss')
                        workhours = moment.utc(moment(docs[i].checkout,"DD/MM/YYYY HH:mm:ss").diff(moment(docs[i].checkin,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss")
                        employee={days:days,intime: intime, outtime: outtime, workhours: workhours}
                       history.push(employee);
                    }
                    
                     //console.log(history);
                    
                    return res.render('pages/attendance_history', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname,
                        empId:empid,
                        history: history
                    });
                }
            });
            
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }

    });

    // find a particular employee history for a given date
    router.post('/historybydate/:empid', (req, res, next) => {
        sess = req.session;
        const empid = mongodb.ObjectID(req.params.empid);
        if(sess.eid){
            var date = new Date();
            var start = new Date(req.body.startDate);
            start.setHours(0,0,0,0);
            var end = new Date(req.body.endDate);
            end.setHours(23,59,59,999);
            dbs.collection('attendance').find({"empid":empid, "checkin": {$gte: start, $lt: end}}).toArray(function( err, docs){
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
                    var days;
                    var intime;
                    var outtime;
                    var workhours;
                    var history=[];
                    var employee=[];
                    for(i=0; i<docs.length; i++){
                        days = moment(docs[i].checkin).format('DD/MM/YYYY');
                        intime = moment(docs[i].checkin).format('HH:mm:ss');
                        outtime = moment(docs[i].checkout).format('HH:mm:ss')
                        workhours = moment.utc(moment(docs[i].checkout,"DD/MM/YYYY HH:mm:ss").diff(moment(docs[i].checkin,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss")
                        employee={days:days,intime: intime, outtime: outtime, workhours: workhours}
                       history.push(employee);
                    }
                    
                     //console.log(history);
                    
                    return res.render('pages/attendance_history_bydate', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname,
                        start:moment(start).format('DD/MM/YYYY'),
                        end:moment(end).format('DD/MM/YYYY'),
                        history: history
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