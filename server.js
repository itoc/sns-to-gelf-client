// ITOC SNS to GELF Client
// 
// This program will run as a simple HTTP server allowing SNS to push messages into Graylog in GELF format
// 
// Author:  David Nedved, ITOC.
//          david.nedved@itoc.com.au
// 
// --------------------------------------------------------------------------------------------------------------

// Configuration Options / Environment Variables:
//
//      HTTP_LISTEN_PORT    (Integer, port to run webserver on, defaults to 9000)
//      CONSOLE_DEBUG       (String, true/false - provides verbose debugging)
//      GELF_SERVER         (String, provide hostname or IP)
//      GELF_SERVER_PORT    (Integer, defaults to: 12201)
//      GELF_CHUNK_SIZE     (Integer, defaults to: 8154 - set to 8154 if you're running on LAN and 1420 for WAN mode.)
//      GELF_TRANSPORT_TYPE (String, either 'wan' or 'lan', defaults to 'wan')

// --------------------------------------------------------------------------------------------------------------

if(process.env.HTTP_LISTEN_PORT) { 
    var server_listen_port = process.env.HTTP_LISTEN_PORT;
} else {
    var server_listen_port = 9000;
}

if(process.env.GELF_CHUNK_SIZE) {
    var GELF_CHUNK_SIZE = process.env.GELF_CHUNK_SIZE;
} else {
    var GELF_CHUNK_SIZE = 8154;
}

if(process.env.GELF_TRANSPORT_TYPE) {
    var GELF_TRANSPORT_TYPE = process.env.GELF_TRANSPORT_TYPE;
} else {
    var GELF_TRANSPORT_TYPE = 'wan';
}

if(process.env.GELF_SERVER) {
    var GELF_SERVER = process.env.GELF_SERVER;
} else {
    console.log('Please set environment variable: GELF_SERVER');
    process.exit();
}

if(process.env.GELF_SERVER_PORT) {
    var GELF_SERVER_PORT = process.env.GELF_SERVER_PORT;
} else {
    var GELF_SERVER_PORT = 12201;
}

// --------------------------------------------------------------------------------------------------------------

var http = require('http'),
    SNSClient = require('aws-snsclient'),
    Gelf = require('gelf'),
    moment = require('moment'),
    _ = require('underscore');

var gelf = new Gelf({
    graylogPort: GELF_SERVER_PORT,
    graylogHostname: GELF_SERVER,
    connection: GELF_TRANSPORT_TYPE,
    maxChunkSizeWan: GELF_CHUNK_SIZE,
    maxChunkSizeLan: GELF_CHUNK_SIZE
});

var auth = {
    verify: false
};

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// If message is a legit SNS message post it to GELF Server
var client = SNSClient(auth, function(err, message) {

    if(process.env.CONSOLE_DEBUG) console.log(message);

    var sns_topic_split = message.TopicArn.split(":");
    var server_message = {
        "Type": message['Type'],
        "facility": "AWS-SNS",
        "SNS-MessageId": message.MessageId,
        "SNS-TopicArn": message.TopicArn,
        "SNS-Subject": message.Subject,
        "AWS-Account-ID": sns_topic_split[4],
        "AWS-SNS-Region": sns_topic_split[3],
        // "source": aws_account_id[4],                     // Graylog does not seem to care about this and always displays source as the server.js's ip.
        "short_message": message.Message,                   // Don't worry; if the SNS message contains JSON we will try and parse it and post each key->value into Graylog below.
        "timestamp": moment(message.Timestamp).unix()
    };

    if(isJson(message.Message)) {

        // Do some cleaning ... It seems Graylog does not like key's that have a space in the name when transmitting GELF, let's replace with underscores...
        parsed_message = JSON.parse(message.Message)

        var clean_gelf_objects = {};
        for (var key in parsed_message) {
            clean_gelf_objects[key.replace(/ /g, '_')] = parsed_message[key];
        }

        var graylog_data = _.extend(clean_gelf_objects, server_message);

        if(graylog_data.hasOwnProperty('Event_Message')){
            graylog_data.short_message = graylog_data.Event_Message
        } else {
            graylog_data.short_message = "-"; // gelf class by default fills with string "Gelf Shortmessage" if found null...
        }

    } else { 
        var graylog_data = server_message;
    }

    gelf.emit('gelf.log', graylog_data);

});

console.log("ITOC SNS to Gelf Client\n-----------------------------------------------------\n");
console.log("Starting service with the following configuration: ");
console.log("   - HTTP Service Listening on TCP:" + server_listen_port);
console.log("   - Gelf Chunk Size:" + GELF_CHUNK_SIZE);
console.log("   - Gelf Transport Type:" + GELF_TRANSPORT_TYPE);
console.log("   - Gelf Server Address:" + GELF_SERVER);
console.log("   - Gelf Server Port:" + GELF_SERVER_PORT);
if(process.env.CONSOLE_DEBUG) console.log("   - [Debug mode on]");

console.log("\n");

// Listen as simple Web-server on 0.0.0.0
http.createServer(function(req, res) {

    var now = new Date();
    if(req.headers.host) {
        if(req.headers['x-amz-sns-message-type']) {
            console.log("[" + now + "] SNS Request from: " + req.headers.host + " (" + req.headers['x-amz-sns-message-type'] + " Request type)");
        } else {
            console.log("[" + now + "] HTTP Request from: " + req.headers.host + " (NOT VALID SNS REQUEST)");            
        }
    }

    if(req.headers['x-amz-sns-message-type']) { 
        return client(req, res);
    }

    res.writeHead(404);
    res.end('Sorry, the type of request you have sent is not valid for this service.');

}).listen(server_listen_port);

