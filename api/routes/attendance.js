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

            //var starttime = moment("09:45 AM", 'hh:mm A');
            //var starttime = moment("07:30 PM", 'hh:mm A');
            // console.log(starttime.from(dt));
            // console.log(moment(dt).from(starttime));
            // console.log(time);
            // var intimediff = '';
            // var instatus = '';
            // var checkin = new Date();
            // if(moment.min(checkin,starttime) == checkin){
            //     intimediff = moment.utc(moment(starttime,"DD/MM/YYYY HH:mm:ss").diff(moment(checkin,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
            //     instatus = 'early';
            // }else {
            //     intimediff = moment.utc(moment(checkin,"DD/MM/YYYY HH:mm:ss").diff(moment(starttime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
            //     instatus = 'late';
            // }
            // console.log('you are '+ instatus +' at time '+ intimediff);

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
                        checkout : doc.checkout,
                        intimediff: doc.intimediff,
                        instatus: doc.instatus,
                        outtimediff: doc.outtimediff,
                        outstatus: doc.outstatus

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
            dbs.collection('rules').findOne({}, {endtime:1, starttime:1, _id:0}, function(err, doc){
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
                    var starttime = doc.starttime;
                    var endtime = doc.endtime;
                    // for insert new day data
                    if(req.body.checkoption=="in"){
                        console.log(starttime);
                        var starttime = moment(starttime, 'hh:mm A');
                        console.log(starttime);
                        var intimediff = '';
                        var instatus = '';
                        var checkin = new Date();
                        if(moment.min(checkin,starttime) == checkin){
                            intimediff = moment.utc(moment(starttime,"DD/MM/YYYY HH:mm:ss").diff(moment(checkin,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                            instatus = 'early';
                        }else {
                            intimediff = moment.utc(moment(checkin,"DD/MM/YYYY HH:mm:ss").diff(moment(starttime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                            instatus = 'late';
                        }
                        console.log('you are '+ instatus +' at time '+ intimediff);
                        const dataset = {
                            empid: eid,
                            checkin: checkin,
                            intimediff: intimediff,
                            instatus: instatus
                        };
                        console.log(dataset);
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
                        var endtime = moment(endtime, 'hh:mm A');
                        var outtimediff = '';
                        var outstatus = '';
                        var checkout = new Date();
                        if(moment.min(checkout,endtime) == checkout){
                            outtimediff = moment.utc(moment(endtime,"DD/MM/YYYY HH:mm:ss").diff(moment(checkout,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                            outstatus = 'early';
                        }else {
                            outtimediff = moment.utc(moment(checkout,"DD/MM/YYYY HH:mm:ss").diff(moment(endtime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                            outstatus = 'over';
                        }
                        //console.log('you are '+ instatus +' at time '+ intimediff);
                        const dataset = {
                            checkout: checkout,
                            outtimediff: outtimediff,
                            outstatus: outstatus 
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
            });
            
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
                    var days; var intime; var outtime; var workhours; var instatus; var intimediff;
                    var outstatus; var outtimediff; var history=[]; var employee=[];
                    for(i=0; i<docs.length; i++){
                        days = moment(docs[i].checkin).format('DD/MM/YYYY');
                        intime = moment(docs[i].checkin).format('HH:mm:ss');
                        instatus = docs[i].instatus;
                        intimediff = docs[i].intimediff;
                        outtime = moment(docs[i].checkout).format('HH:mm:ss');
                        outstatus = docs[i].outstatus;
                        outtimediff = docs[i].outtimediff;
                        workhours = moment.utc(moment(docs[i].checkout,"DD/MM/YYYY HH:mm:ss").diff(moment(docs[i].checkin,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                        employee={days:days,intime: intime, instatus: instatus, intimediff: intimediff, outtime: outtime, outstatus: outstatus, outtimediff: outtimediff, workhours: workhours}
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
                    var days; var intime; var outtime; var workhours; var instatus; var intimediff;
                    var outstatus; var outtimediff; var history=[]; var employee=[];
                    for(i=0; i<docs.length; i++){
                        days = moment(docs[i].checkin).format('DD/MM/YYYY');
                        intime = moment(docs[i].checkin).format('HH:mm:ss');
                        instatus = docs[i].instatus;
                        intimediff = docs[i].intimediff;
                        outtime = moment(docs[i].checkout).format('HH:mm:ss');
                        outstatus = docs[i].outstatus;
                        outtimediff = docs[i].outtimediff;
                        workhours = moment.utc(moment(docs[i].checkout,"DD/MM/YYYY HH:mm:ss").diff(moment(docs[i].checkin,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                        employee={days:days,intime: intime, instatus: instatus, intimediff: intimediff, outtime: outtime, outstatus: outstatus, outtimediff: outtimediff, workhours: workhours}
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