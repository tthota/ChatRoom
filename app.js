const express = require('express'); //importing express
const chalk = require('chalk'); //colring debug statements
const debug = require('debug')('app');
const morgan = require('morgan'); //to save debug logs to files
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express(); //creating an instance of application (express framework)
const port = process.env.PORT || 3000;
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(morgan('tiny')); //combined
app.use(express.static(path.join(__dirname, '/public/'))); //location of static files 
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css'))); //static files from node_modules
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'irsajet'}));
require('./src/config/passport.js')(app);
app.set('views', './src/views'); //setting folder path for template engine to search
app.set('view engine', 'ejs'); //setting view engine

const viewData = {
    title: 'Chat Room'
}

const loginSignupRouter = require('./src/routes/loginSignupRouter')(viewData);
app.use('/user', loginSignupRouter); //letting app know to use router

const homeRouter = require('./src/routes/homeRouter');
app.use('/', homeRouter);

const adminRouter = require('./src/routes/adminRouter')(viewData);
app.use('/admin', adminRouter);

const msgRouter = require('./src/routes/msgRouter');
app.use('/post', msgRouter);

io.on('connection', function(socket){
	debug('a user connected');

	//broadcasting new message on getting new_message event
	socket.on('new_message', function(msg) {
		debug('Got new message');
		debug(msg);
		io.emit('update_message', msg);
	});
});

http.listen(port, function(){
	debug(`Express is   listening to port ${chalk.green(port)}`);
})

