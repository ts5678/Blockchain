const ganache = require('ganache-cli');
let  dateobj = new Date(Date.now());

console.log(dateobj.toISOString());

options = {
  gasLimit :  2000000000,
  time : new Date(),
  blockTime : 5
}
const server =  ganache.server(options);

server.listen("8545", (err, blockChain)=>{
  console.log(blockChain);
})

