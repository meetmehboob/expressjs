require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http');
const app = express();
const bodyParser = require('body-parser');
var portNum = process.env.PORT || 3000;
const database = require('./database');

app.use(cors());
const server = http.createServer(app);

//middleware setup
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


const Users = require('./model/Users');

//import users they are pages which contain multiple pages
const usersRoute = require('./controller/users');
app.use('/users', usersRoute);


server.listen(portNum);