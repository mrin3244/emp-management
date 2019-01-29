const port = process.env.PORT || 3050;

const connectDB = require('./api/config/database');  // get a function with two function err and dbconnection
const hb = require('./api/config/handlebars');

connectDB(function(err, client){
    if(err) throw err;
    if(!err){
        var dbs = client.db('employeeManagementDb');
        const app = require('./app')(dbs, hb); // pass db and handlebars object instance to app
        app.listen(port);
    }

});