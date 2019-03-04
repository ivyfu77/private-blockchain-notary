/* ===== Memory Class ==============================
|  Class with a constructor for memory          |
|  ===============================================*/

class Memory {
  constructor(address){
    this.address = address;
    this.requestTimeStamp = new Date().getTime().toString().slice(0,-3);
    this.message = '';
    this.validationWindow = 5*60*1000 / 1000;
    this.messageSignature = false;
    this.validateMessage = '';
  }
}

module.exports.Memory = Memory;