using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Nethereum.Hex.HexTypes;
using Nethereum.Web3;
using Nethereum.Web3.Accounts.Managed;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BlockchainETN.Controllers
{
    [Route("api/[controller]")]
    public class DataController : Controller
    {
        string localhost = "http://localhost:31890/api/data";

        // GET api/data
        [HttpGet]
        public string Get()
        {
            HttpClient client = new HttpClient();
            var url = localhost;
            var retVal = GetEthereumTests();
            retVal.Wait();
            return retVal.Result.ToString();
        }

        static async Task<decimal> GetEthereumTests()
        {
            var web3 = new Web3("http://127.0.0.1:7545");

            //testing with the ethereum /truffle example from the petshop tutorial
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead("Adoption.json"))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheAdoptionContractAddress = json["networks"]["5777"]["address"].ToString();
            //the Below is the output from the Truffle Deployment, which will exist in the Adoption.json
            //Replacing 'Adoption'
            //--------------------
            //> transaction hash: 0xa653513bd46fd5a28bb43f4f7f498d41dc1336e44f63a639669ce4e1a3ddd315
            // > Blocks: 0            Seconds: 0
            // > contract address: 0x75760C9BDC8Dd32cA42c116218065C42cbCB95C1
            //  > account:             0xb53a1FcA5bAf097C43B6357109056D3835625bC6
            //  > balance:             99.97713632
            //  > gas used: 217067
            //> gas price: 20 gwei
            //> value sent: 0 ETH
            //> total cost: 0.00434134 ETH

            var senderAddress = "0xb53a1FcA5bAf097C43B6357109056D3835625bC6";
            var senderPassword = "99e3ff29ba50a4d89ee760dc3d5f7a2f05fea81ba268d25771d368e19aaa80f9";

            // Some Balance Queries
            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);
            var funds = await web3.Eth.GetBalance.SendRequestAsync(senderAddress).ConfigureAwait(false);
            Console.WriteLine($"Account {senderAddress} has {Web3.Convert.FromWei(funds.Value)} eth");

            var gasPrice = await web3.Eth.GasPrice.SendRequestAsync().ConfigureAwait(false);
            Console.WriteLine($"Gas price is {gasPrice.Value} wei");

            //We are going to call the contract from Truffle that we already deployed
            //you can spin up the page that Truffle uses and click adopt on the dogs,
            //a list will return of what address adopted the dogs & what dogs are not adopted.
            var contract = web3.Eth.GetContract(abi, ganacheAdoptionContractAddress);

            //List<string> was a proper return value for the getAdopters function
            //there is a command line C# code generator that will analyze the classes from solidity and 
            //generate c# code that will work for that contract
            var getAdoptersResult = await contract.GetFunction("getAdopters").CallAsync<List<string>>();


            //=================================================================
            //creates a BRAND NEW contract, and a fresh instance of the contract
            // you will not see any adopters like the above, because its brand new
            var receipt = await web3.Eth.DeployContract.SendRequestAndWaitForReceiptAsync(abi, bytecode, senderAddress, new HexBigInteger(900000), null);
            var newContractAddress = receipt.ContractAddress;

            return new decimal(1);
        }
    }
}