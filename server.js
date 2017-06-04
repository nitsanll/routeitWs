var express = require('express');
var app = express();
var Segment = require('./routeController');
var Traveler = require('./travelersController');
var port = process.env.PORT || 3000;

app.set('port', port);
app.use('/',express.static('./public'));
app.use(function(req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    app.set('json spaces', 4);
    res.set("Content-Type", "application/json");
    next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.bodyParser({limit: '50mb'}));

// routeController functions
app.get('/calculate/:ar/:km/:dr/:td/:sp/:df/:tp/:ml', function(req,res){
    Segment.calculateRoute(req.params.ar,req.params.km,req.params.dr,req.params.td,req.params.sp,req.params.df,req.params.tp,function(data){
        if(data == "segmentsErr" || data == "typeErr" || data == "diffErr" || data == "typeDiffErr") {res.json(data);}
        else {
          Traveler.addRouteToSuggested(data, req.params.ml,function(data){
            res.json(data);
          });
        }
    });
});

app.get('/calculateFull/:ar/:km/:dr', function(req,res){
    Segment.calculateFullRoute(req.params.ar,req.params.km,req.params.dr,function(data){
      res.json(data);
    });
});

app.get('/getStartPts', function(req,res){
    Segment.getSegmentsStartPt(function(data){
      res.json(data);
    });
});

app.get('/setAlert', function(req,res){
    Segment.setAlertForSegment(function(data){
      res.json(data);
    });
});

app.get('/getSegments', function(req,res){
    Segment.getAllSegments(function(data){
      res.json(data);
    });
});

// travelerController functions
app.get('/createTraveler/:ml/:fn/:pi', function(req,res){
    Traveler.createTraveler(req.params.ml, req.params.fn, req.params.pi,function(data){
      res.json(data); 
    });
}); 

app.get('/addRoute/:id/:ml', function(req,res){
    Traveler.addRouteToTraveler(req.params.id, req.params.ml, function(data){
      res.json(data); 
    });
});

app.get('/updateDates/:ml/:id/:sd/:dn/:fr/:st', function(req,res){
    console.log("before sending: " + req.params.sd);
    //var date =  new Date(req.params.sd);
    //date.setHours(10);
    Traveler.updateTripDates(req.params.ml, req.params.id, req.params.sd, req.params.dn, req.params.fr, req.params.st, function(data){
      res.json(data); 
    });
    //res.json({'param': req.params.sd, 'date': date});
});

app.get('/deleteDates/:ml/:id', function(req,res){
    Traveler.deleteTripDates(req.params.ml, req.params.id, function(data){
      res.json(data); 
    });
});

app.get('/deleteRoute/:ml/:id', function(req,res){
    Traveler.deleteRouteFromTraveler(req.params.ml, req.params.id, function(data){
      res.json(data); 
    });
}); 

/*app.get('/getRoute/:ml/:id', function(req,res){
    Traveler.getCurrentRoute(req.params.ml, req.params.id, function(data){
      res.json(data); 
    });
});*/

app.get('/saveAccomm/:ml/:id/:ac/:dn', function(req,res){
    var accommArr = (req.params.ac).split(",");
    var accommObj = {
      accomm_name: accommArr[0],
      phone: accommArr[1],
      accomm_id: accommArr[2]
    };
    console.log(accommObj);
    Traveler.saveAccommToDay(req.params.ml, req.params.id, accommObj, req.params.dn, function(data){
      res.json(data); 
    });
});

app.get('/deleteAccomm/:ml/:id/:dn', function(req,res){
    Traveler.deleteAccommFromDay(req.params.ml, req.params.id, req.params.dn, function(data){
      res.json(data); 
    });
});

app.get('/getMyRoutes/:ml', function(req,res){
    Traveler.getAllMyRoutes(req.params.ml, function(data){
      res.json(data); 
    });
});

app.get('/getPrevRoutes/:ml', function(req,res){
    Traveler.getAllPreviousRoutes(req.params.ml, function(data){
      res.json(data); 
    });
});

app.get('/addPrevRoute/:ml', function(req,res){
    Traveler.addPrevToTraveler(req.params.ml, function(data){
      res.json(data); 
    });
});

app.get('/deletePrevRoute/:ml/:id', function(req,res){
    Traveler.deletePrevFromTraveler(req.params.ml, req.params.id, function(data){
      res.json(data); 
    });
});

app.listen(port);
console.log("service is lstening on port " + port);
