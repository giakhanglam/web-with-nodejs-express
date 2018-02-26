var express = require('express'),
	app = express();

// set up handlebars view engine, replace ejs
var handlebars = require('express3-handlebars').create({ 
	defaultLayout: 'main',
	helpers: {
		section: function(name, options){
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// add self-created module fortune in lib directory
var fortune = require('./lib/fortune.js');

// add STATIC middleware
app.use(express.static(__dirname + '/public'));

// add body-parser middleware for POST form
app.use(require('body-parser')());

app.set('port', process.env.PORT || 3000);


// URL parameters to turn on tests
// http://localhost:3000?test=1 => homepage complete with tests
// use middleware to detect test=1 in the querystring
app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' &&
		req.query.test === '1';
	next();
});

// middleware to inject weather data into res.locals.partials
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
	res.locals.partials.weather = getWeatherData();
	next();
});


// ROUTES

app.get('/', function(req, res){
	res.render('home');
});

app.get('/about', function(req, res){
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

// this route just show about Sections page 79
app.get('/test-sections', function(req, res){
	res.render('jquery-test');
});

app.get('/newsletter', function(req, res){
	// we will learn about CSRF later...for now, just
	// provide a dummy value
	res.render('newsletter', {csrf: 'CSRF token goes here'});
});

app.post('/process', function(req, res){
	/*console.log('Form (from querystring): ' + req.query.form);
	console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	console.log('Name (from visible form field): ' + req.body.name);
	console.log('Email (from visible form field): ' + req.body.email);
	res.redirect(303, '/thank-you');*/
	if(req.xhr || req.accepts('json,html')==='json'){
		// if there were an error, we would send { error: 'error description' }
		res.send({success: true});
	} else {
		// if there were an error, we would redirect to an error page
		res.redirect(303, '/thank-you');
	}
});

// this route show 'invisible' info that the browser sends to server when request
app.get('/headers', function(req, res){
	res.set('Content-Type', 'text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	res.send(s);
});

app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});

/*
 * middlewares, catch-all handlers, need to specify the status code
 */
// custom 404 page
app.use(function(req, res){
	res.status(404).render('404');
});

// custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500).render('500');
});


if(app.thing === null) console.log('bleat!');

// function to get current weather data
function getWeatherData(){
	return {
		locations: [
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)'
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)'
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)'
			}
		]
	};
}

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + 
		app.get('port') + '; press Ctrl-C to terminate.');
});
