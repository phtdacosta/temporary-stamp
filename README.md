# temporary-stamp
Inspired by the tiny and super useful python module "itsdangerous", used to encrypt and/or sign (JSON) data into temporary tokens for untrusted environments.

There are a symmetric encryption method and a HMAC data signing.
As well as the "itsdangerous" python module, "temporary-stamp" can be really useful when sensitive data are sent thru untrusted environments before reaching the server again.

Use cases:
* Encrypt an user ID for unsubscribing of newsletters into URLs. This way you don’t need to generate one-time tokens and store them in the database. Same thing with any kind of activation link for accounts and similar things.
* Encrypted and/or signed objects can be stored in cookies or other untrusted sources which means you don’t need to have sessions stored on the server, which reduces the number of necessary database queries.
* Signed information can safely do a roundtrip between server and client in general which makes them useful for passing server-side state to a client and then back.

### Installation:
```
$ npm install @phtdacosta/temporary-stamp --save
```
### Why use "temporary-stamp" over crypto plain simple cipher functions?
That's why there is "temporary" in the module name. The module aims to create tokens that expire over time. It's useful specially when the data can be changed within certain time, invalidating them, or the data have to be consumed in a hurry.

> This module aims to work with JSON-formatted data!

## Basic usage:
The simplest use example:
```js
const temporaryStamp = require('temporary-stamp');

// Initializes the temporary-stamp object
// Its preferred to use AES encryption implementations
// It supports all AES modes with IV described by the "crypto" module
// The key, iv, cipher and hash function are set by default internally
const stamp = new temporaryStamp();

// Set for how long the token should be valid as the first argument (in milliseconds)
// and then specify the JSON, with as many key-value pairs as you want
const token = stamp.setupToken(1000, {
    name: 'Reeve',
});
// output: 9de7c052fed0f0708c12ef30e40d7ff1eaf8d1ed82162c2af7a5a7ec6cc11973c369d95aeb595b7147eab5a976

// To solve the token all needed is (as the validation is automatic)
const solved = stamp.solveToken(token);
// output: { max_timestamp: 1506900062517,
//    name: 'Reeve' }
```

## Advanced usage:
For advanced use, further information can be set:
```js
const temporaryStamp = require('temporary-stamp');

// Set a key for encryption/decryption
const key = crypto.randomBytes(32);
// Set a iv to support the selected cipher
const iv = crypto.randomBytes(16);
// Set the cipher
// It supports all AES modes described by the "crypto" module
const cipher = 'aes-256-ctr';
// Set the hash
// It supports all hash functions described by the "crypto" module
const hash = 'sha512';

// Initializes the temporary-stamp object
const stamp = new temporaryStamp(key, iv, cipher, hash);

// Set for how long the token should be valid as the first argument (in milliseconds)
// and then specify the JSON, with as many key-value pairs as you want
const token = stamp.setupToken(1000, {
    name: 'Reeve',
    month: 'June',
    height: 188
});
// output: 9ede2b5472703f97e77d4af6232d6d973bef5e043375ad726583898b540401663ae3901e7f85d28b20b4ad4a71aa4db4223bc4e0e54418aeee3f6e171a99e93a90da263146537882a5

// To just verify if the token is valid
console.log(stamp.verifyToken(token));
// output: true || false

// To solve the token all needed is (as the validation is automatic)
const solve = stamp.solveToken(token);
// output: { max_timestamp: 1506900062517,
//    name: 'Reeve',
//    month: 'June',
//    height: 188 }
```

### Caveats:
* For now, the encryption/decryption methods only use ciphers with initializing vectors (iv).
* Only the symmetric encryption method supports time expiring data. Extending the support to HMAC signing is planned for the future.

## Error handling:
```js
const token = stamp.setupToken(2000, {
    'message': 'Turn the TV on and get mad!'
});

// When a token created to be used within 2 seconds is verified/solved after 3 seconds
setTimeout(function () {
    console.log(stamp.solveToken(token));
}, 3000);
// output: StampError: Payload date is not valid anymore

// When bad tokens are verified/solved
const random = 'ga5SXsg5AXwTYfI6dpfLNySnBHdGsHdZQYE7kkmA432';
stamp.verifyToken(random);
// output: TypeError: Bad input string || SyntaxError: Unexpected end of JSON input
```
