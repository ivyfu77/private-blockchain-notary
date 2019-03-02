/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

  constructor() {
      this.db = level(chainDB);
  }

  // Get data from levelDB with key (Promise)
  getLevelDBData(key){
    let self = this;
    return new Promise(function(resolve, reject) {
      self.db.get(key, (err, value) => {
        if (err) {
          if (err.type == 'NotFoundError') {
            resolve(undefined);
          } else {
            console.log('Block' + key + 'get failed', err);
            reject(err);
          }
        } else {
          resolve(value);
        }
      })
    });
  }

  // Add data to levelDB with key and value (Promise)
  addLevelDBData(key, value) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.db.put(key,value, function(err) {
        if (err) {
          console.log(`Block ${key} submission failed, Error: ${err}`);
          reject(err);
        }

        resolve(value);
      });
    });
  }

  // Get all blocks and return as a array
  getAllBlocks() {
    let self = this;
    let chain = [];

    return new Promise((resolve, reject) => {
      self.db.createReadStream()
      .on('data', (data) => {
        chain.push(JSON.parse(data.value));
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('close', () => {
        resolve(chain);
      })
    });
  }

  // Method that return the height
  getBlocksCount() {
    let self = this;
    let count = 0;

    return new Promise(function(resolve, reject){
      self.db.createReadStream()
      .on('data', function (data) {
        count ++;
        // console.log(data.key, '=', data.value);
      })
      .on('error', function (err) {
        reject(err);
        console.log('Error: ', err);
      })
      .on('close', function () {
        resolve(count);
      })
    });
  }
}

module.exports.LevelSandbox = LevelSandbox;
