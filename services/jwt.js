const util = require('util');
const error = util.error;


var crypto = require("crypto");
exports.encode = function(payload,secret){
    algorithm = "HS256";
    var header = {
        type:"JWT",
        alg:algorithm
    };


    var jwt = base64Encode(JSON.stringify(header))+ "."+base64Encode(JSON.stringify(payload));
    jwt +="."+sign(jwt,secret);
    return jwt;
}

exports.decode = function(token,secret){
    var segments = token.split('.');
    if(segments.length!==3){
         throw new error("not a valid user");
    }

    var header = JSON.parse(base64Decode(segments[0]));
    var payload = JSON.parse(base64Decode(segments[1]));


    var rawSignature = segments[0]+"."+segments[1];
    if(!verifySignature(rawSignature,secret,segments[2])){
        throw new error("signature failed");
    }



    return payload;


}

function verifySignature(raw,secret,signature){
    return signature === sign(raw,secret);
}

function sign(str,key) {
    return crypto.createHmac('sha256',key).update(str).digest('base64');
    
}


function base64Encode(str){
    return new Buffer(str).toString('base64');
}

function base64Decode(str){
    return new Buffer(str,'base64').toString();
}