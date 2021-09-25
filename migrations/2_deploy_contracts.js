// eslint-disable-next-line no-undef
const DStorage = artifacts.require("DStorage");

module.exports = function (deployer) {
  deployer.deploy(DStorage);
};
