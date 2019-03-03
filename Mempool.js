/* =================== Mempool Class ======================
|  Class as a temporary storage for validation requests   |
|  =======================================================*/

const Message = require('bitcoinjs-message');
const Memory = require('./Memory.js');

const TimeoutRequestsWindowTime = 5*60*1000;

class Mempool {

  /**
   * Constructor to create a new mempool
   */
  constructor() {
    this.mempool = [];
    this.timeoutRequests = [];
  }

  addRequestValidation(address) {
    let self = this;
    let memory;

    if (self.mempool[address]) {
      memory = self.mempool[address];
      const timePass = (new Date().getTime().toString().slice(0,-3)) - memory.requestTimeStamp;
      memory.validationWindow = TimeoutRequestsWindowTime/1000 - timePass;
    } else {
      memory = new Memory.Memory(address);
      memory.message = `${memory.address}:${memory.requestTimeStamp}:starRegistry`;
      self.mempool[address] = memory;
      self.timeoutRequests[address] = setTimeout(() => {
        self.removeValidationRequest(address);
      }, TimeoutRequestsWindowTime);

    }

    return memory;
  }

  removeValidationRequest(address) {
    delete this.mempool[address];
    delete this.timeoutRequests[address];
  }
}

module.exports.Mempool = Mempool;