'use strict';
// Requires the module locally from the parent folder
const temporaryStamp = require('./../index.js');

// Initializes the temporary-stamp object
// Its preferred to use AES encryption implementations
// It supports all AES modes with IV described by the "crypto" module
// The key and hash values are set by default internally
// To set iv you should base on the advanced example
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
