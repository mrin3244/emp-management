const express = require('express');
const app = express();

// create session
var session = require('express-session');
app.use(session({ secret: 'secret-key', resave: true, saveUninitialized: true }));

module.exports = function(dbs, hb){
    // initial the handelbars object in hbs
    app.engine('hbs', hb);
    // set the view engine
    app.set("view engine", "hbs");
    
    //hb.registerHelper('dateFormat', require('handlebars-dateformat'));

    const bodyparser = require('body-parser');

    const loginRoutes = require('./api/routes/login')(dbs);
    const homeRoutes = require('./api/routes/home')(dbs);
    const attendanceRoutes = require('./api/routes/attendance')(dbs);

    app.use(express.static(__dirname + '/views/public'));

    // get input from body
    app.use(bodyparser.urlencoded({extended:false}));
    app.use(bodyparser.json());

    // Routes which should handel request
    app.use('/login', loginRoutes);
    app.use('/home', homeRoutes);
    app.use('/attendance', attendanceRoutes);

    app.get('/', (req, res, next) => {
        res.render('pages/login');
        //res.status(200).json({welcome:"welcome"});
    });
    app.get('/home', (req, res, next) => {
        res.render('pages/home');
        //res.status(200).json({welcome:"welcome"});
    });

    app.get('/err', (req, res) => {
        var message = req.query.message;
        res.render('error', {message: message});
    });
    app.get('/signout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });
    // for all other link
    app.get('/*', (req, res) => {
        res.render('error');
    });

    return app;
}