const handlebars = require('express-handlebars');
//const helper = require('./helper')(handlebars);

const path = __dirname + '/../../views/';

const hb = handlebars({
    defaultLayout: "main",
    extname: "hbs",
    layoutsDir: path + "layouts",
    partialsDir: path + "partial",

    helpers: {
        // create function for hbs page
        ifEq: function (v1, v2, options) {
            if (v1 === v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
    }
});

module.exports = hb;