const SHA256 = require('crypto-js/sha256');
const Block = require('./Block.js');
const Blockchain = require('./BlockChain.js');
const Mempool = require('./Mempool.js');
const Hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

  /**
   * Constructor to create a new BlockController, you need to initialize here all your endpoints
   * @param {*} server
   */
  constructor(server) {
    this.server = server;
    this.blockchain = new Blockchain.Blockchain();
    this.blocks = [];
    this.mempool = new Mempool.Mempool();
    this.getBlockByIndex();
    this.getBlockByHash();
    this.getBlockByWalletAddress();
    this.postNewBlock();
    this.postRequestValidation();
    this.postValidate();
  }

  /**
   * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
   */
  getBlockByIndex() {
    let self = this;
    this.server.route({
      method: 'GET',
      path: '/block/{index}',
      handler: (request, h) => {
        const index = request.params.index;
        return self.blockchain.getBlock(index)
          .then((block) => {
            if (block !== undefined) {
              let result = JSON.parse(block);

              // Avoid decode non-exist star.story in Genesis Block
              if (result.height !== 0) {
                result.body.star.storyDecoded = Hex2ascii(result.body.star.story);
              }

              return result;
            } else {
              return { error: `Block#${index} not found` };
            }
          })
      }
    });
  }

  /**
   * Implement a GET Endpoint to retrieve a block by hash, url: "/api/block/hash:[hash]"
   */
  getBlockByHash() {
    let self = this;
    this.server.route({
      method: 'GET',
      path: '/stars/hash:{hash}',
      handler: (request, h) => {
        const hash = request.params && request.params.hash;
        return self.blockchain.getBlockByHash(hash)
          .then((block) => {
            if (block) {
              // Avoid decode non-exist star.story in Genesis Block
              if (block.height !== 0) {
                block.body.star.storyDecoded = Hex2ascii(block.body.star.story);
              }
              return block;
            }
          })
          .catch(err => {
            console.log(`Error: ${err}`);
            return { error: `${err}` };
          })
      }
    });
  }

  /**
   * Implement a GET Endpoint to retrieve a block by wallet address, url: "/api/block/address:[address]"
   */
  getBlockByWalletAddress() {
    let self = this;

    self.server.route({
      method: 'GET',
      path: '/stars/address:{address}',
      handler: (request, h) => {
        let result = [];
        const address = request.params && request.params.address;
        return self.blockchain.getBlockByWalletAddress(address)
          .then(arr => {
            if (arr && arr.length > 0) {
              arr.map(block => {
                block.body.star.storyDecoded = Hex2ascii(block.body.star.story);
                result.push(block);
              })
            }
            return result;
          })
          .catch(err => {
            console.log(`Error: ${err}`);
            return { error: `${err}` };
          })
      }
    })
  }

  /**
   * Implement a POST Endpoint to add a new Block, url: "/api/block"
   */
  postNewBlock() {
    let self = this;
    this.server.route({
      method: 'POST',
      path: '/block',
      handler: (request, h) => {
        let body = request.payload;
        if (!body || !body.address || !body.star) {
          return { error: 'Request must has valid wallet address and star payload' };
        }

        if (!self.mempool.verifyAddressRequest(body.address)) {
          return { error: `Time out or haven't requested validation, use /requestValidation to request validation` };
        }

        if (!self.mempool.verifyRequestByWallet(body.address)) {
          return { error: `Can't add block. Message verification failed.` }
        }

        let newBlock = new Block.Block(body);
        const { story } = body.star;
        const storyBuffer = Buffer.from(story, "utf8");
        newBlock.body.star.story = storyBuffer.toString("hex");

        return self.blockchain.addBlock(newBlock)
          .then((result) => {
            const block = JSON.parse(result);
            self.mempool.removeValidationRequest(body.address);
            return block;
          })
          .catch((err) => {
            console.log('Error: ', err);
            return err;
          })
      }
    });
  }

  /**
   * Implement a POST Endpoint to submit a validation request, url: "/requestValidation"
   */
  postRequestValidation() {
    let self = this;
    self.server.route({
      method: 'POST',
      path: '/requestValidation',
      handler: (request, h) => {
        let address = request.payload ? request.payload.address : null;
        if (!address) {
          return { error: 'Request must has valid address payload'}
        }
        const memory = self.mempool.addRequestValidation(address);
        return {
          'walletAddress': memory.address,
          'requestTimeStamp': memory.requestTimeStamp,
          'message': memory.message,
          'validationWindow': memory.validationWindow
        }
      }
    });
  }

  /**
   * Implement a POST Endpoint to validate message signature, url: "/message-signature/validate"
   */
  postValidate() {
    let self = this;
    self.server.route({
      method: 'POST',
      path: '/message-signature/validate',
      handler: (request, h) => {
        let address = request.payload ? request.payload.address : null;
        if (!address) {
          return { error: 'Request must has valid address payload'}
        }

        let signature = request.payload ? request.payload.signature : null;
        if (!signature) {
          return { error: 'Request must has valid signature payload'}
        }

        const memory = self.mempool.validateRequestByWallet(address, signature);
        if (!memory.messageSignature) {
          return { error: memory.validateMessage || 'Error happend during verification' }
        }

        return {
          registerStar: memory.messageSignature,
          status: {
            address: memory.address,
            requestTimeStamp: memory.requestTimeStamp,
            message: memory.message,
            validationWindow: memory.validationWindow,
            messageSignature: memory.messageSignature
          }
        }
      }
    });
  }

}

/**
 * Exporting the BlockController class
 * @param {*} server
 */
module.exports = (server) => { return new BlockController(server);}
