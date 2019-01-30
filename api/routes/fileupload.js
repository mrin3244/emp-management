const express = require('express');
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
                ename: sess.empdata[0].name
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
                    callback(null, sess.eid + "_" + Date.now() + ext);
                }
            });

            var upload = multer({
                storage: Storage,
                fileFilter: function (req, file, callback) {
                    var ext = path.extname(file.originalname);
                    if(ext !== '.png' && ext !== '.jpg') {
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
                    return res.end("Something went wrong!");
                }
                console.log(req.file.path);
                return res.end("File uploaded sucessfully!.");
            });
            
        }
        else{
            return res.redirect('/err?message=Auth failed');
        }
    });

    return router;
};