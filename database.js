const mongoose = require('mongoose');
const assert = require('assert');
const db_url = process.env.DB_URL;
mongoose.connect(db_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
},
function(err, link) {
//error
assert.equal(err, null, 'Database connection error..');

//Ok
//console.log(link);
});