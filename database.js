const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useNewUrlParse: true
}).then(() => {
  console.log('connected');
})
.catch (error => {
  console.error(error);
});

module.exports = mongoose;