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
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.Web3;
using Nethereum.Web3.Accounts.Managed;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts.ContractHandlers;
using Nethereum.RPC.Eth.Transactions;

namespace BlockchainETN.Controllers
{

    [Route("api/[controller]")]
    public class DataController : Controller
    {
        string localhost = "http://localhost:31890/api/data";

        //main account we run everything from
        static string senderAddress = "0x5aCFB76c34EB65536fe59Be833647792603b164b";//h
        static string senderPassword = "4206523e9f645f29d31115266628b6d4c48722c263553f27f1fb1bf37e558c8e";//h
        //our initial 'order system'
        static string orderSystemJson = "C:\\Users\\Terj\\Source\\Repos\\ts5678\\Order-By-Ethereum\\build\\contracts\\OrderSystem.json";//h

        //static string senderAddress = "0xb53a1FcA5bAf097C43B6357109056D3835625bC6";//w
        //static string senderPassword = "99e3ff29ba50a4d89ee760dc3d5f7a2f05fea81ba268d25771d368e19aaa80f9";//w

        //static string orderSystemJson = "C:\\Users\\e9923570\\Source\\Repos\\Order-By-Ethereum\\Order-By-Ethereum\\build\\contracts\\OrderSystem.json";//w


        // GET api/data
        [HttpPost]
        [Route("CreateOrder")]
        [Route("data/CreateOrder")]
        public string CreateOrder([FromBody] JObject content)
        {
            var orderinfo = JsonConvert.SerializeObject(content.Root);
            var retVal = CreateOrderEth(orderinfo);
            retVal.Wait();

            return "bleh";
        }

        [HttpPost]
        [Route("GetTransactions")]
        [Route("data/GetTransactions")]
        public string GetTransactions([FromBody] JObject content)
        {
            var timejson = content.Root["time"];

            var time = BigInteger.Parse(timejson.ToString());
            var retVal = GetTransactions(time).Result;

            return retVal;
        }

        [HttpPost]
        [Route("GetOrders")]
        [Route("data/GetOrders")]
        public GetOrdersOutputDTOBase GetOrders([FromBody] JObject content)
        {
            var timejson = content.Root["time"];

            var time = BigInteger.Parse(timejson.ToString());
            var retVal = GetOrdersEth(time).Result;

            return retVal;
        }

        [HttpGet]
        [Route("GetAllOrders")]
        [Route("data/GetAllOrders")]
        public GetAllOrdersOutputDTOBase GetAllOrders()
        {
            HttpClient client = new HttpClient();
            var url = localhost;

            var retVal = GetAllOrdersEth().Result;

            return retVal;
        }
        static async Task<decimal> CreateOrderEth(string orderinfo)
        {
            var web3 = new Web3("http://127.0.0.1:7545");

            //testing with the ethereum /truffle example from the petshop tutorial
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead(orderSystemJson))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheOrderSystemContractAddress = json["networks"]["5777"]["address"].ToString();
            
            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(DataController.senderAddress, DataController.senderPassword, 1200).ConfigureAwait(false);

            var orderinfoObj = JObject.Parse(orderinfo);
            var asdf = orderinfoObj.GetValue("customer");
            var thename = asdf["name"];
            CreateOrderFunction createOrder = new CreateOrderFunction();
            createOrder.Orderid = Guid.NewGuid().ToString();
            createOrder.Orderinfo = orderinfo;
            createOrder.Submitter = thename.Value<string>();
            createOrder.FromAddress = senderAddress;


            OrderSystemService service = new OrderSystemService(web3, ganacheOrderSystemContractAddress);
            service.ContractHandler.EthApiContractService.Transactions.
            var theresult = await service.CreateOrderRequestAndWaitForReceiptAsync(createOrder);

            return new decimal(1);
        }

        static async Task<string> GetTransactions(BigInteger timespan)
        {
            var web3 = new Web3("http://127.0.0.1:7545");

            //testing with the ethereum /truffle example from the petshop tutorial
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead(orderSystemJson))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheOrderSystemContractAddress = json["networks"]["5777"]["address"].ToString();

            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);

            var unixTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds - timespan;

            var transactionsByHash = new EthGetTransactionByHash(web3.Client);
            //var theresult = await transactionsByHash.SendRequestAsync(senderAddress);



            var maxBlockNumber = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
            var LastMaxBlockNumber = maxBlockNumber;

            long txTotalCount = 0;
            for (ulong blockNumber = 0; blockNumber <= LastMaxBlockNumber.Value; blockNumber++)
            {
                var blockParameter = new Nethereum.RPC.Eth.DTOs.BlockParameter(blockNumber);
                var block = await web3.Eth.Blocks.GetBlockWithTransactionsByNumber.SendRequestAsync(blockParameter);
                var trans = block.Transactions;
                int txCount = trans.Length;
                txTotalCount += txCount;

                //block.Timestamp
                

                foreach (var tx in trans)
                {
                    try
                    { 
                       
                        var bn = tx.BlockNumber.Value;
                        var th = tx.TransactionHash;
                        var ti = tx.TransactionIndex.Value;
                        var nc = tx.Nonce.Value;
                        var from = tx.From;

                        var rpt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(th);
                        var status = rpt.Status.Value;
                        
                        var to = tx.To;
                        if (to == null)
                            to = "to:NULL";

                        var v = tx.Value.Value;
                        var g = tx.Gas.Value;
                        var gp = tx.GasPrice.Value;
                        Console.WriteLine(th.ToString() + " " + ti.ToString() + " " + nc.ToString() + " " + from.ToString() + " " + to.ToString() + " " + v.ToString() + " " + g.ToString() + " " + gp.ToString());
                        if (rpt.Logs.Count > 0)
                        {
                            foreach (var rp in rpt.Logs)
                            {
                                var tpic = rp["topics"];
                                Console.WriteLine("logs : " + tpic[0].ToString());
                            }
                        }

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("ScanTxExample.Tx:\t" + ex.ToString());
                        if (ex.InnerException != null)
                            Console.WriteLine("ScanTxExample.Tx:\t" + ex.InnerException.ToString());
                    }
                }
                Console.WriteLine();
            }

            return "";
        }

        static async Task<GetOrdersOutputDTOBase> GetOrdersEth(BigInteger timespan)
        {
            var web3 = new Web3("http://127.0.0.1:7545");

            //testing with the ethereum /truffle example from the petshop tutorial
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead(orderSystemJson))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheOrderSystemContractAddress = json["networks"]["5777"]["address"].ToString();

            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);

            var unixTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds - timespan;

            //get the contract we deployed
            GetOrdersFunction getOrders = new GetOrdersFunction();
            getOrders.TimeGreaterThan = unixTimestamp;
            getOrders.FromAddress = senderAddress;

            OrderSystemService service2 = new OrderSystemService(web3, ganacheOrderSystemContractAddress);
            var theresult = await service2. GetOrdersQueryAsync(getOrders);

            return theresult;
        }

        static async Task<GetAllOrdersOutputDTOBase> GetAllOrdersEth()
        {
            var web3 = new Web3("http://127.0.0.1:7545");

            //testing with the ethereum /truffle example from the petshop tutorial
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead(orderSystemJson))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheOrderSystemContractAddress = json["networks"]["5777"]["address"].ToString();

            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);

            //get the contract we deployed
            GetAllOrdersFunction getAllOrders = new GetAllOrdersFunction();
            getAllOrders.FromAddress = senderAddress;

            OrderSystemService service = new OrderSystemService(web3, ganacheOrderSystemContractAddress);
            var theAllResult = await service.GetAllOrdersQueryAsync(getAllOrders);

            return theAllResult;
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


}