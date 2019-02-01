const express = require('express');
const mongodb = require('mongodb');
var multer = require('multer');
var path = require('path'); //to get ext from file



module.exports = function(dbs){
    const router = express.Router();
    router.get('/', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            return res.render('pages/upload', {
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

    router.post('/uploadfile', (req, res, next) => {
        sess = req.session;
        if(sess.eid){
            // create a storage which says where and how the files/images should be saved
            var Storage = multer.diskStorage({
                destination: function(req, file, callback) {
                    callback(null, "views/public/images");
                },
                filename: function(req, file, callback) {
                    var ext = path.extname(file.originalname);
                    callback(null, sess.eid + ext);
                }
            });

            var upload = multer({
                storage: Storage,
                fileFilter: function (req, file, callback) {
                    var ext = path.extname(file.originalname);
                    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
                        return callback(new Error('Only images are allowed'))
                    }
                    callback(null, true)
                },
                limits:{
                    fileSize: 1024 * 1024
                }
            }).single("imgUploader"); //Field name and max count
            upload(req, res, function(err) {
                if (err) {
                    //console.log(err);
                    return res.render('pages/500', {
                        eid:sess.eid, 
                        utypeid:sess.utypeid,
                        ename: sess.empdata[0].name,
                        imgname: sess.empdata[0].imgname, 
                        message: err
                    });
                }
                //console.log(req.file);
                const empId = mongodb.ObjectID(sess.eid);
                dbs.collection('employee').findOneAndUpdate({"_id":empId}, {$set: {"imgname":req.file.filename}}, function(err,result){
                    if(result){
                        return res.redirect('/home');
                        //return res.status(200).json({"message":"update account "+eId});
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
            });
            
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    return router;
};