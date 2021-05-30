const AWS = require("aws-sdk");
const fs = require('fs');
AWS.config.update({
    region: "local",
    endpoint: "http://localhost:8000"
});
var docClient = new AWS.DynamoDB.DocumentClient();
console.log("Importing Scranton into DynamoDB. Please wait.");
let scranton = JSON.parse(fs.readFileSync('data.json', 'utf8'));
scranton.forEach(function(scran) {
  console.log(scran)
var params = {
        TableName: "Scranton",
        Item: {
            "id": scran.id,
            "type": scran.type,
            "name": scran.name,
            "description": scran.description
        }
    };
docClient.put(params, function(err, data) {
       if (err) {
           console.error(err);
       } else {
           console.log("PutItem succeeded:", scran.name);
       }
    });
});