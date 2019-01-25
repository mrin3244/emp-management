const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/employeeManagementDb';

module.exports = function(callback){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, database){
        if(err){
            throw err;
        }
        if(!err){
            db = database;
            console.log('database connected');
        }
        callback(err, db);
    });
}