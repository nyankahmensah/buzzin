require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose =require('mongoose');
const routes = require('./routes');
const session = require('express-session');
const app = express();
const {PORT, DB_HOST} = process.env;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: false }))
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'get your dirty laundry out'
}));

app.use(function(req, res, next){
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<div class="alert alert-warning" role="alert">' + err + '</div>';
    if (msg) res.locals.message = '<div class="alert alert-success" role="alert">' + msg + '</div>';
    next();
});

//Initialise routes
app.use(routes);

//Connect to the database
mongoose.connect(
    DB_HOST,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }
).then((value)=>{
    console.log(`Database running on ${DB_HOST}`)
}).catch((err)=>{
    console.log(`Database connection error ${err}`)
})

//Set port for server to run on
app.listen(PORT||3000,()=>{
    console.log(`App running on port ${PORT||3000}`)
})