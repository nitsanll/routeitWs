var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
var schema = mongoose.Schema;

var coord = new schema({
    lat: String,
    lng: String
});

var alert = new schema({
    content: String,
    coord: coord
});

var segmentSchema = new schema({
    indx: {type:Number, index:1, required:true, unique:true},
    start_pt: String,
    end_pt: String,
    coord_Array: [coord],
    total_km: {
        type: SchemaTypes.Double
    },
    area: String,
    duration: String,
    difficulty: String,
    alert: [alert],
    description: [String],
    sites: [String],
    type: [String]
}, {collection: 'segments'});

var Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;
