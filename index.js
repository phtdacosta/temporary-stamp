// temporary-stamp

'use strict';

const crypto = require('crypto');

function encrypt(obj, data) {
    let cipher;
    if (obj.iv === false) {
        cipher = crypto.createCipher(obj.cipher, obj.key);
    } else {
        cipher = crypto.createCipheriv(obj.cipher, obj.key, obj.iv);
    }
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(obj, data) {
    let decipher;
    if (obj.iv === false) {
        decipher = crypto.createDecipher(obj.cipher, obj.key);
    } else {
        decipher = crypto.createDecipheriv(obj.cipher, obj.key, obj.iv);
    }
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

let error = new Error('The token is not valid anymore');
error.code = 'INVALIDDATE';

class StampError extends Error {
    constructor(message, code) {
        // Calling parent constructor of base Error class
        super(message);
        // Saving class name in the property of our custom error as a shortcut
        this.name = this.constructor.name;
        // Capturing stack trace, excluding constructor call from it
        Error.captureStackTrace(this, this.constructor);
        // Additional properties
        this.code = code;
    }
}

module.exports = class Stamp {

    constructor(key, cipher, hash, iv) {
        // The default values are good enough to set an optimal security background for the process
        this.key = key || crypto.randomBytes(32);
        this.cipher = cipher || 'aes256';
        this.hash = hash || 'sha512';
        this.iv = iv || false;
    }

    generateToken(duration, data) {
        let payload = {
            maxTimestamp: Date.now() + duration,
        }
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                payload[key] = data[key];
            }
        }
        return JSON.stringify(payload);
    }

    // Generates an unique encrypted string used to authenticate an action thru untrusted environments
    setupToken(duration, data) {
        return encrypt(this, this.generateToken(duration, data));
    }

    // Checks if the given unknown token is valid, looking for the max timestamp set in it
    verifyToken(unknownToken) {
        const decrypted = decrypt(this, unknownToken);
        const payload = JSON.parse(decrypted);
        // Only parses valid payloads as a security measure
        if (payload.maxTimestamp >= Date.now()) {
            return true;
        } else {
            return false;
        }
    }

    // Tries to solve the unknown token, decrypting and parsing it before returning the raw payload
    solveToken(unknownToken) {
        const decrypted = decrypt(this, unknownToken);
        const payload = JSON.parse(decrypted);
        // Only parses valid payloads as a security measure
        if (payload.maxTimestamp >= Date.now()) {
            return payload;
        } else {
            const error = new StampError('Payload date is not valid anymore', 'INVALIDDATE');
            throw error;
        }
    }

    // Appends a HMAC hash at the end of some data, using the data itself as the salt for plain simple authentication purposes
    // Good to be used before actually ciphering the data with some kind of encryption
    signHMAC(data, key) {
        const hmac = crypto.createHmac(this.hash, key);
        hmac.update(data);
        return data + '.' + hmac.digest('hex');
    }

    // Retrieves the authenticity of the signed data, testing the authentication hash from the end of the data against the hashed version of the plain data
    testHMAC(hmacData, key) {
        return (hmacData == hmacSign(hmacData.split('.')[0], key));
    }

}