var mongoose = require('mongoose');
config = {
mongoUrl:'mongodb://db_usr:db_pass@ds059471.mlab.com:59471/routeit'
};
//The server option auto_reconnect is defaulted to true
var options = {
server: {
auto_reconnect:true,
}
};
mongoose.connect(config.mongoUrl, options);
db = mongoose.connection;// a global connection variable
// Event handlers for Mongoose
db.on('error', function (err) {
console.log('Mongoose: Error: ' + err);
});
db.on('open', function() {
console.log('Mongoose: Connection established');
});
db.on('disconnected', function() {
console.log('Mongoose: Connection stopped, recconect');
mongoose.connect(config.mongoUrl, options);
});
db.on('reconnected', function () {
console.info('Mongoose reconnected!');
});