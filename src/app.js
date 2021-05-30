const express= require('express');
const bodyParser= require('body-parser');
const session= require('express-session');
const request = require('request');
const AWS = require("aws-sdk");
const app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(session({
    secret: 'hp_iiitd_cookie',
    resave: false,
    saveUninitialized: false
}));
app.get("/", function (req, res) {
    res.send("HELLO");
});

app.listen(3000, function () {
    console.log("Listening on server port: 3000");
});
AWS.config.update({
    region: "local",
    endpoint: "http://localhost:8000"
  });
var db = new AWS.DynamoDB.DocumentClient();
app.get('/', function (req, res) {
    res.send({ title: "Cars API Entry Point" });
});
app.get('/worker/:id', function (req, res) {
    var wID = parseInt(req.url.slice(8));
    var params = {
        TableName: "Scranton",
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames:{
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":id": wID
        }
    };
    console.log("Scanning table.");
    db.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            res.send(data.Items)
            data.Items.forEach(function(w) {
                console.log(w.id, w.name, w.type);
            });
        }
    });
})

//using scan function
//need to use ExclusiveStartKey & LastEvaluatedKey
app.get('/worker', function (req, res) {
    var params = {
        TableName: "Scranton",
        ProjectionExpression: "#id, #name, #type, #description",
        ExpressionAttributeNames: {
            "#id": "id",
            "#name": "name",
            "#type": "type",
            "#description": "description"
        }
    };
    console.log("Scanning table.");
    db.scan(params, onScan);
    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            res.send(data)
            // print all the Cars
            console.log("Scan succeeded.");
            data.Items.forEach(function(w) {
               console.log(w.id, w.type, w.name)
            });
    if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                db.scan(params, onScan);
            }
        }
      }
 });