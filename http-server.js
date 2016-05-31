'use strict';

const http = require('http')
const fs = require('fs')
const phpUnserialize = require('php-serialization').unserialize

let server = http.createServer((req, res) => {
    
    console.log(req.method);
    console.log(req.url);
    if (req.method === 'GET') {
        if (req.url === '/ugh-decode/') {
            fs.readFile(__dirname + '/textarea.html', (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end(JSON.stringify(err));
                    return;
                }
                res.writeHead(200);
                res.end(data);
            })
        }
        else {
            res.writeHead(404);
            res.end('not found');
            return;
        }
    }
    else if (req.method === 'POST') {
        var postString = '';

        req.on('data', data => {
            postString += data;
        })

        req.on('end', () => {
            try {
                let jsonRequest = JSON.parse(postString);
                
                let base64Buffer = new Buffer(jsonRequest.text, 'base64')
                let serialized = base64Buffer.toString()
                
                if (!(/^i|d|s|b|n|c|a|o|r/).test(serialized)) {
                    throw Error(serialized + ' does not look like serialized php');
                }

                let unserialized = phpUnserialize(serialized)

                res.writeHead(200)
                res.end(JSON.stringify({decoded: unserialized}))
                
                return
            }
            catch (err) {
                res.writeHead(500)
                res.end(JSON.stringify({error: err.message}))
            }
        });
    }
})

server.listen(3006, () => {
    console.log("Server listening on: http://localhost:%s", 3006);
});
