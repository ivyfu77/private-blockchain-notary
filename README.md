# Project #4. Build a Private Blockchain Notary Service

In this project, I build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.

  ___Note of some Dependencies___:
   - __hapi__: "^18.1.0", a Node.js framework to build web services through RESTful APIs.
   - __level__: "^4.0.0", a light-weight db to store paired `key|value`
   - __hex2ascii__: "^4.0.0", Convert hex to ascii in JavaScript. Use for decoding encoded star story in Block.

3. Run command __npm start__ in the root directory.

## Workflow

Below is a sequence diagram that shows the flow of methods across the components - the user, the web API, the mempool, and the blockchain.

![Workflow](/workflow.png)


## Testing the API

Use Postman to access the APIs.

#### POST endpoint:

1. Web API POST endpoint to validate request with JSON response.
"http://localhost:8000/requestValidation"

__payload__:
```JSON
{ "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }
```

2. Web API POST endpoint validates message signature with JSON response.
"http://localhost:8000/message-signature/validate"

__payload__:
```JSON
{
  "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
  "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```
___Note___: Use Electrum sign/verify tool to get the right signature


3. Web API POST endpoint with JSON response that submits the Star information to be saved in the Blockchain.
"http://localhost:8000/api/block"

__payload__:
```JSON
{
  "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
  "star": {
    "dec": "68° 52' 56.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}
```

#### GET endpoint:

1. Get Star block by hash with JSON response.
"http://localhost:8000/stars/hash:[HASH]"

__HASH__: hash string in each block

eg: "http://localhost:8000/api/block/hash:a009ad18146fc71b461dc89d6036a0e86205b7f48ba8f6d5c083b21a2dd571f7"


2. Get Star block by wallet address (blockchain identity) with JSON response.
"http://localhost:8000/stars/address:[ADDRESS]"

__ADDRESS__: address string stored in block body

eg: "http://localhost:8000/api/block/address:17aAHasK9FrcAd228nxrYBiFHRfNvRjqyA"


3. Get star block by star block height with JSON response.
"http://localhost:8000/api/block/{height}"

__height__: number, the height/index of the block you want to get.

eg: "http://localhost:8000/api/block/1"


