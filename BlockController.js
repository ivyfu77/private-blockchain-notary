const SHA256 = require('crypto-js/sha256');
const Block = require('./Block.js');
const Blockchain = require('./BlockChain.js');

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
    this.initializeMockData();
    this.getBlockByIndex();
    this.postNewBlock();
  }

  /**
   * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
   */
  getBlockByIndex() {
    let self = this;
    this.server.route({
      method: 'GET',
      path: '/api/block/{index}',
      handler: (request, h) => {
        const index = request.params.index;
        return self.blockchain.getBlock(index)
          .then((block) => {
            if (block !== undefined) {
              return JSON.parse(block);
            } else {
              return { error: `Block#${index} not found` };
            }
          })
      }
    });
  }

  /**
   * Implement a POST Endpoint to add a new Block, url: "/api/block"
   */
  postNewBlock() {
    let self = this;
    this.server.route({
      method: 'POST',
      path: '/api/block',
      handler: (request, h) => {
        let body = request.payload ? request.payload.body : null;
        if (!body) {
          return { error: 'Request must has valid body payload'}
        }
        let newBlock = new Block.Block(body);
        return self.blockchain.addBlock(newBlock)
          .then((result) => {
            return JSON.parse(result);
          })
          .catch((err) => {
            console.log('Error: ', err);
            return err;
          })
      }
    });
  }

  /**
   * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
   */
  async initializeMockData() {
    let self = this;
    await (function theLoop (i) {
      setTimeout(function () {
        let blockTest = new Block.Block("Test Block - " + (i + 1));
        self.blockchain.addBlock(blockTest).then((result) => {
          i++;
          if (i < 5) theLoop(i);
        });
      }, 100);
    })(0);
  }

}

/**
 * Exporting the BlockController class
 * @param {*} server
 */
module.exports = (server) => { return new BlockController(server);}
