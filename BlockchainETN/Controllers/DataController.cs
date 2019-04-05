using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Nethereum.ABI.FunctionEncoding.Attributes;
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
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead("C:\\Users\\Terj\\Source\\Repos\\ts5678\\Order-By-Ethereum\\build\\contracts\\OrderSystem.json"))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheOrderSystemContractAddress = json["networks"]["5777"]["address"].ToString();
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

            var senderAddress = "0x5aCFB76c34EB65536fe59Be833647792603b164b";
            var senderPassword = "4206523e9f645f29d31115266628b6d4c48722c263553f27f1fb1bf37e558c8e";

            // Some Balance Queries
            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);
            var funds = await web3.Eth.GetBalance.SendRequestAsync(senderAddress).ConfigureAwait(false);
            Console.WriteLine($"Account {senderAddress} has {Web3.Convert.FromWei(funds.Value)} eth");

            var gasPrice = await web3.Eth.GasPrice.SendRequestAsync().ConfigureAwait(false);
            Console.WriteLine($"Gas price is {gasPrice.Value} wei");

            //get the contract we deployed
            var contract = web3.Eth.GetContract(abi, "0x7AE67E55F2E81B35c9f6DF8d0B85F31D291C4acE");//address taken from 'truffle test'

            var getOrdersResult = await contract.GetFunction("getOrders").CallDeserializingToObjectAsync<GetOrdersOutputDTOBase>();


            //=================================================================
            //creates a BRAND NEW contract, and a fresh instance of the contract
            var receipt = await web3.Eth.DeployContract.SendRequestAndWaitForReceiptAsync(abi, bytecode, senderAddress, new HexBigInteger(900000), null);
            var newContractAddress = receipt.ContractAddress;

            return new decimal(1);
        }
    }

    [FunctionOutput]
    public class GetOrdersOutputDTOBase : IFunctionOutputDTO
    {
        [Parameter("string[]", "", 1)]
        public virtual List<string> ReturnValue1 { get; set; }
        [Parameter("uint256[]", "", 2)]
        public virtual List<BigInteger> ReturnValue2 { get; set; }
        [Parameter("uint256[]", "", 3)]
        public virtual List<BigInteger> ReturnValue3 { get; set; }
        [Parameter("uint256[]", "", 4)]
        public virtual List<BigInteger> ReturnValue4 { get; set; }
        [Parameter("string[]", "", 5)]
        public virtual List<string> ReturnValue5 { get; set; }
    }
}