var mongoose = require('mongoose');
var Traveler = require('./traveler');

// function that creates new user and adding it to the database if the user doesn't exist
exports.createTraveler = function(mail, name, pic, callback){
    var newchar = '/';
    pic = pic.split('*').join(newchar);
    var query = Traveler.find({}).select('email');
    query.exec(function(err,mails){
        // checking if user already exists
        for(var i = 0; i<mails.length; i++)
        {
            if(mails[i].email == mail) return callback("userExists");   
        }
        var newUser = new Traveler({
                full_name: name,
                image: pic,
                email: mail,
                previous_routes: [],
                my_routes: [],
                id_counter: 0
        }); 
        newUser.save();
        callback("newUser"); 
    });
}

// function that adds sugeested route to traveler's 'my routes'
exports.addRouteToTraveler = function(id, mail, callback){   
    //pushing myRoute to traveler's 'my routes'
    var query = Traveler.findOne({email: mail}).select('suggested_route');
    query.exec(function(err,sugRoute){
      if(err) callback("travelerNotFound");
      var route = sugRoute.suggested_route;
      var dailySectionsArr = []; //contains trip's daily section
      for(var i = 0; i<route.daily_sections.length; i++){
        var coordArray = []; //contains all of daily section's coords
        var coordArr = route.daily_sections[i].coord_array;
        for(var j = 0; j<coordArr.length; j++){
          var coord ={}; //object representing a coord
          coord.lat = coordArr[j].lat;
          coord.lng = coordArr[j].lng;
          coordArray.push(coord);
        }
        //a trip's daily section
        var dailySection = { 
          day_num: route.daily_sections[i].day_num,
          date: route.daily_sections[i].date,
          start_pt: route.daily_sections[i].start_pt,
          end_pt: route.daily_sections[i].end_pt,
          coord_array: coordArray,
          total_km: route.daily_sections[i].total_km,
          area: route.daily_sections[i].area,
          duration: route.daily_sections[i].duration,
          difficulty: route.daily_sections[i].difficulty,
          alert: route.daily_sections[i].alert,
          chosen_accomm: null,
          description: route.daily_sections[i].description,
          type: route.daily_sections[i].type
        };
      dailySectionsArr.push(dailySection);
      }

      //a route to add to 'my routes'
      var myRoute = {
          trip_id: id,
          area: route.area,
          direction: route.direction,
          creation_date: new Date(),
          trip_start_pt: route.trip_start_pt,
          trip_end_pt: route.trip_end_pt,
          start_date: route.start_date,
          end_date: route.end_date,
          days_num: route.days_num,
          trip_km: route.trip_km,
          day_km: route.day_km,
          trip_difficulty: route.trip_difficulty,
          trip_type: route.trip_type,
          trip_description: route.trip_description,
          daily_sections: dailySectionsArr,
          disabled_flag: route.disabled_flag,
          isChosen: route.isChosen
        };

      var query = Traveler.findOneAndUpdate({email: mail}, {$push: {my_routes: myRoute}});
      query.exec(function(err,route){
        if(err) callback("routeNotAdded"); 
        callback(myRoute);
      });
    });
}

// function that increases the trips id counter
exports.updateIdCounter = function(id, mail, callback){
  var newId = parseInt(id)+1;
  var query = Traveler.findOneAndUpdate({email: mail}, {$set: {id_counter: newId}});
  query.exec(function(err,route){
    if(err) callback("counterNotUpdated"); 
    callback("updatedCounter");
  });
}

// function that gets the current id counter
exports.getIdCounter = function(email, callback){
  var query = Traveler.findOne().where('email', email).select('id_counter');
  query.exec(function(err,idCounter){
    if(err) callback("idCounterNotFound");
    callback(idCounter);
  });
}

// function that calculates trip end date and daily sections dates and update the trip dates 
exports.updateTripDates = function(mail, tripId, sDate, daysNum, isFri, isSat, callback){	
  var eDate = new Date(sDate);
  eDate.setDate(eDate.getDate()+parseInt(daysNum-1));
  var tmpDate = sDate;
  var tripDatesArr = []; //array contains all of the trip's dates
  //calculating trip dates between start date to end date
  for(var i = 0;  i<daysNum; i++){
    tripDatesArr.push(new Date(tmpDate));
    tmpDate.setDate(tmpDate.getDate()+1);
  }
  //updating trip dates to traveler's trip
  var query = Traveler.findOne().where('email', mail).select('my_routes');
    query.exec(function(err,routes){
      if(err) callback("myRoutesNotFound");
      var myRoutes = routes.my_routes;
      var isRouteFound = false;
      for(var i = 0; i<myRoutes.length; i++){
        if(myRoutes[i].trip_id == tripId){
          var isRouteFound = true;
          myRoutes[i].end_date = eDate;
          myRoutes[i].start_date = tripDatesArr[0];
          var dailySecs = myRoutes[i].daily_sections;
          for(var j = 0; j<dailySecs.length; j++){
            dailySecs[j].date = tripDatesArr[j];
          }
          var updatedRoute = myRoutes[i];
          break;
        }
      }
      if(isRouteFound == true){
        routes.set('my_routes', myRoutes);
        routes.save();
        callback(updatedRoute);
      }
      else callback("routeNotFound"); 
    });
}

// function that deletes trip dates and daily sections dates
exports.deleteTripDates = function(mail, tripId, callback){  
  //delete trip dates from traveler's trip
  var query = Traveler.findOne().where('email', mail).select('my_routes');
    query.exec(function(err,routes){
      if(err) callback("myRoutesNotFound");
      var myRoutes = routes.my_routes;
      var isRouteFound = false;
      for(var i = 0; i<myRoutes.length; i++){
        if(myRoutes[i].trip_id == tripId){
          var isRouteFound = true;
          myRoutes[i].end_date = null;
          myRoutes[i].start_date = null;
          var dailySecs = myRoutes[i].daily_sections;
          for(var j = 0; j<dailySecs.length; j++){
            dailySecs[j].date = null;
          }
          var updatedRoute = myRoutes[i];
          break;
        }
      }
      if(isRouteFound == true){
        routes.set('my_routes', myRoutes);
        routes.save();
        callback(updatedRoute);
      }
      else callback("routeNotFound"); 
    });
}


// function that deletes a certain trip by trip id
exports.deleteRouteFromTraveler = function(mail, tripId, callback){
   var query = Traveler.findOneAndUpdate({email: mail}, {$pull: {my_routes: {trip_id: tripId}}});
    query.exec(function(err,traveler){
      if(err) callback("routeNotDeleted");
      callback("routeDeleted");
    });
}

// function that updates the chosen accommodation for a daily section in current route 
exports.saveAccommToDay = function(mail, tripId, accomm, dayNum, callback){
  var query = Traveler.findOne().where('email', mail).select('my_routes');
  query.exec(function(err,routes){
  if(err) callback("myRoutesNotFound");
    var isRouteFound = false;
    var myRoutes = routes.my_routes;
    for(var i = 0; i<myRoutes.length; i++){
      if(myRoutes[i].trip_id == tripId){
        isRouteFound = true;
        var dailySecs = myRoutes[i].daily_sections;
        for(var j = 0; j<dailySecs.length; j++){
          if(dailySecs[j].day_num == dayNum){
             dailySecs[j].chosen_accomm = accomm;
          }
        }
        break;
      }
    }
    if(isRouteFound == true){
      routes.set('my_routes', myRoutes);
      routes.save();
      callback("accommUpdated"); 
    }
    else callback("routeNotFound");
  });
}

// function that deletes the chosen accommodation for a daily section
exports.deleteAccommFromDay = function(mail, tripId, dayNum, callback){
  var query = Traveler.findOne().where('email', mail).select('my_routes');
  query.exec(function(err,routes){
  if(err) callback("myRoutesNotFound");
    var isRouteFound = false;
    var myRoutes = routes.my_routes;
    for(var i = 0; i<myRoutes.length; i++){
      if(myRoutes[i].trip_id == tripId){
        isRouteFound = true;
        var dailySecs = myRoutes[i].daily_sections;
        for(var j = 0; j<dailySecs.length; j++){
          if(dailySecs[j].day_num == dayNum){
             dailySecs[j].chosen_accomm = "";
          }
        }
        break;
      }
    }
    if(isRouteFound == true){
      routes.set('my_routes', myRoutes);
      routes.save();
      callback("accommDeleted"); 
    }
    else callback("routeNotFound");
  });
}

// function that gets the user's "my routes"
exports.getAllMyRoutes = function(mail, callback){
  var query = Traveler.findOne().where('email', mail).select('my_routes');
    query.exec(function(err,routes){
      if(err) callback("myRoutesNotFound");
      callback(routes);
    });
}

// function that gets the user's "previous routes"
exports.getAllPreviousRoutes = function(mail, callback){
  var query = Traveler.findOne().where('email', mail).select('previous_routes');
    query.exec(function(err,routes){
      if(err) callback("prevRoutesNotFound");
      callback(routes);
    });
}

// function that adds a route to the "previous routes" after it was ended
exports.addPrevToTraveler = function(mail, routeStr, callback){
  var detailsArr = routeStr.split(",");
  var prevRoute = {
    trip_id: detailsArr[0],
    area: detailsArr[1],
    direction: detailsArr[2],
    creation_date: detailsArr[3],
    trip_start_pt: detailsArr[4],
    trip_end_pt: detailsArr[5],
    start_date: detailsArr[6],
    end_date: detailsArr[7],
    days_num: detailsArr[8],
    trip_km: detailsArr[9],
    day_km: detailsArr[10],
    trip_difficulty: detailsArr[11]
  };
  var query = Traveler.findOneAndUpdate({email: mail}, {$push: {previous_routes: prevRoute}});
  query.exec(function(err,route){
    if(err) callback("routeNotAdded"); 
    callback("prevRouteAdded");
  }); 
}

// function that deletes a route from the "previous routes"
exports.deletePrevFromTraveler = function(mail, tripId, callback){
  var query = Traveler.findOneAndUpdate({email: mail}, {$pull: {previous_routes: {trip_id: tripId}}});
  query.exec(function(err,traveler){
    if(err) callback("routeNotDeleted");
    callback("routeDeleted");
  });
}

// function that adds the calculated suggested route to traveler
exports.addRouteToSuggested = function(route, mail, callback){
  var dailySectionsArr = []; //contains trip's daily section
  for(var i = 0; i<route.daily_sections.length; i++){
    var coordArray = []; //contains all of daily section's coords
    var coordArr = route.daily_sections[i].coord_array;
    for(var j = 0; j<coordArr.length; j++){
      var coord ={}; //object representing a coord
      coord.lat = coordArr[j].lat;
      coord.lng = coordArr[j].lng;
      coordArray.push(coord);
    }

    //a trip's daily section
    var dailySection = { 
      day_num: route.daily_sections[i].day_num,
      date: route.daily_sections[i].date,
      start_pt: route.daily_sections[i].start_pt,
      end_pt: route.daily_sections[i].end_pt,
      coord_array: coordArray,
      total_km: route.daily_sections[i].total_km,
      area: route.daily_sections[i].area,
      duration: route.daily_sections[i].duration,
      difficulty: route.daily_sections[i].difficulty,
      alert: route.daily_sections[i].alert,
      chosen_accomm: null,
      description: route.daily_sections[i].description,
      type: route.daily_sections[i].type
    };
  dailySectionsArr.push(dailySection);
  }

  //a route to add to 'suggested route'
  var sugRoute = {
      trip_id: "",
      area: route.area,
      direction: route.direction,
      creation_date: "",
      trip_start_pt: route.trip_start_pt,
      trip_end_pt: route.trip_end_pt,
      start_date: route.start_date,
      end_date: route.end_date,
      days_num: route.days_num,
      trip_km: route.trip_km,
      day_km: route.day_km,
      trip_difficulty: route.trip_difficulty,
      trip_type: route.trip_type,
      trip_description: route.trip_description,
      daily_sections: dailySectionsArr,
      disabled_flag: route.disabled_flag,
      isChosen: route.isChosen
    };
    
    //setting suggested route to traveler's 'suggested route' field
    var query = Traveler.findOneAndUpdate({email: mail}, {$set: {suggested_route: sugRoute}});
    query.exec(function(err,traveler){
      if(err) callback("routeNotAddedToSuggested");  
      callback(route);
    });
}

// function that sets a chosen trip
exports.setChosen = function(mail, tripId, isChosen, callback){
  var query = Traveler.findOne().where('email', mail).select('my_routes');
  query.exec(function(err,routes){
  if(err) callback("myRoutesNotFound");
    var isRouteFound = false;
    var myRoutes = routes.my_routes;
    for(var i = 0; i<myRoutes.length; i++){
      if(myRoutes[i].trip_id == tripId){
        isRouteFound = true;
        myRoutes[i].isChosen = isChosen;
        break;
      }
    }
    if(isRouteFound == true){
      routes.set('my_routes', myRoutes);
      routes.save();
      callback("isChosenUpdated"); 
    }
    else callback("routeNotFound");
  });
}