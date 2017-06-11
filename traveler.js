var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var schema = mongoose.Schema;

var accomm = new schema({
    accomm_name: String,
    phone: String,
    accomm_id: String
});

var coord = new schema({
    lat: String,
    lng: String
});

var alert = new schema({
    content: String,
    coord: coord
});

var daily_section = new schema({ 
    day_num: {type:Number, index:1, required:true, unique:true},
    date: Date,
    start_pt: String,
    end_pt: String,
    coord_array: [coord],
    total_km: {
        type: SchemaTypes.Double
    },                
    area: String,
    duration: String,
    difficulty: String,
    alert: [alert],
    chosen_accomm: accomm,
    description: [String],
    type: [String]
});

var route = new schema({
    trip_id: Number,
    area: String,
    direction: String,
    creation_date: Date,
    trip_start_pt: String,
    trip_end_pt: String,
    start_date: Date,
    end_date: Date,
    days_num: Number,
    trip_km: Number,
    day_km: String,
    trip_difficulty: String,
    trip_type: [String],
    trip_description: [String],
    daily_sections: [daily_section],
    disabled_flag: Boolean,
    isChosen: Boolean
});

var prevRoute = new schema({
    trip_id: Number,
    area: String,
    direction: String,
    creation_date: Date,
    trip_start_pt: String,
    trip_end_pt: String,
    start_date: Date,
    end_date: Date,
    days_num: Number,
    trip_km: Number,
    day_km: String
});

var travelerSchema = new schema({
    full_name: String,
    image: String,
    email: {type:String, index:1, required:true, unique:true},
    suggested_route: route,
    previous_routes: [prevRoute],
    my_routes: [route],
    id_counter: Number
}, {collection: 'travelers'});

var Traveler = mongoose.model('Traveler', travelerSchema);

module.exports = Traveler;