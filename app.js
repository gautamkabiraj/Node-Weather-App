var express = require('express');
var _ = require('lodash');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var port = process.env.PORT || 3000;

// set assets directory
app.use('/assets', express.static(__dirname + '/public'));

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// set view engine
app.set('view engine', 'ejs');

// custom middleware
app.use('/', function(req, res, next){
    console.log('Request URL:' + req.url);
    next();
});

app.get('/', function(req, res){
    res.render('index');
});

app.post('/result2', urlencodedParser, (req, res) => {
    var lname = req.body.locationname;
    var newlname = _.replace(lname, / /g, '%20');
    //console.log(fname);
    request({
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${newlname}`,
        json: true
    }, function(error, response, body){
        if(error){
            console.log(error);
        }
        else {
            var fulladdr = body.results[0].formatted_address;
            var lat = body.results[0].geometry.location.lat;
            var lng = body.results[0].geometry.location.lng;  
            getDarkSky(fulladdr, lat, lng);
        }
    });

    function getDarkSky(fulladdr, lat, lng){
        request({
            url: `https://api.darksky.net/forecast/075c96b2e49145df6dfcc6a8d60c6296/${lat},${lng}`,
            json: true
        },(error, response, body) => {
            if(error){
                console.log(error);
            }
            else {
                var timezone = body.timezone;    
                var csummary = body.currently.summary;
                var ctemp_t = (body.currently.temperature - 32)*(5/9);
                var ctemp = _.round((ctemp_t), 2).toFixed(2);
                var catemp_t = (body.currently.apparentTemperature - 32)*(5/9);
                var catemp = _.round((catemp_t), 2).toFixed(2);                
                var chumidity = body.currently.humidity;
                var cpressure = body.currently.pressure;
                var cwindspeed = body.currently.windSpeed;
                var ccloudcover = body.currently.cloudCover;
                var cpreci = body.currently.precipIntensity;
                var hrsummary = body.hourly.summary;
                var dlsummary = body.daily.summary;

              ((lname) => {
                    request({
                        url: `https://en.wikipedia.org/api/rest_v1/page/summary/${lname}`,
                        json: true
                    }, function(error, response, body){
                        if(error){
                            console.log(error);
                        }
                        else{
                            var placeSummary = body.extract;
                            console.log('placeSummary:' + placeSummary);
                                res.render('result2', {
                                    // place: place,
                                     // state: state,
                                    // stateshort: stateshort,
                                     // country: country,
                                     // countryshort: countryshort,
                                    lat: lat,
                                    lng: lng,
                                    timezone: timezone,
                                    csummary: csummary,
                                    ctemp: ctemp,
                                    catemp: catemp,
                                    chumidity: chumidity,
                                    cpressure: cpressure,
                                    cwindspeed: cwindspeed,
                                    ccloudcover: ccloudcover,
                                    cpreci: cpreci,
                                    hrsummary: hrsummary,
                                    dlsummary: dlsummary,
                                    fulladdr: fulladdr,
                                    placeSummary: placeSummary                            
                        
                             });
                        }
                    });
            
                })(lname);            
            }
        });
    }

});

// listen to port
app.listen(port);

// 075c96b2e49145df6dfcc6a8d60c6296