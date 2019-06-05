var OrderSystem = artifacts.require("../contracts/OrderSystem.sol");

var DateTime = artifacts.require("../contracts/DateTime.sol");

module.exports = function(deployer) {
  deployer.deploy(DateTime);
  deployer.deploy(OrderSystem)
};
