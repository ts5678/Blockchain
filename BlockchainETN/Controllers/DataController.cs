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


namespace BlockchainETN.Controllers
{

    [Route("api/[controller]")]
    public class DataController : Controller
    {
        string localhost = "http://localhost:31890/api/data";

        // GET api/data
        [HttpPost]
        [Route("CreateOrder")]
        public string CreateOrder([FromBody] JObject content)
        {
            HttpClient client = new HttpClient();
            var url = localhost;
            var orderinfo = JsonConvert.SerializeObject(content.Root);
            var retVal = CreateOrderEth(orderinfo);
            retVal.Wait();

            return "bleh";
        }

        [HttpGet]
        [Route("GetOrders")]
        [Route("data/GetOrders")]
        public GetOrdersOutputDTOBase GetOrders()
        {
            HttpClient client = new HttpClient();
            var url = localhost;

            var retVal = GetOrdersEth().Result;

            return retVal;
        }
        static async Task<decimal> CreateOrderEth(string orderinfo)
        {
            var web3 = new Web3("http://127.0.0.1:7545");

            //testing with the ethereum /truffle example from the petshop tutorial
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead("C:\\Users\\e9923570\\Source\\Repos\\Order-By-Ethereum\\Order-By-Ethereum\\build\\contracts\\OrderSystem.json"))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheOrderSystemContractAddress = json["networks"]["5777"]["address"].ToString();

            var senderAddress = "0xb53a1FcA5bAf097C43B6357109056D3835625bC6";
            var senderPassword = "99e3ff29ba50a4d89ee760dc3d5f7a2f05fea81ba268d25771d368e19aaa80f9";

            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);



            CreateOrderFunction createOrder = new CreateOrderFunction();
            createOrder.Orderid = Guid.NewGuid().ToString();
            createOrder.Orderinfo = orderinfo;
            createOrder.FromAddress = senderAddress;

            OrderSystemService service = new OrderSystemService(web3, ganacheOrderSystemContractAddress);
            var theresult = await service.CreateOrderRequestAndWaitForReceiptAsync(createOrder);

            //get the contract we deployed
            var contract = web3.Eth.GetContract(abi, ganacheOrderSystemContractAddress);
            var getOrdersResult = await contract.GetFunction("getOrders").CallDeserializingToObjectAsync<GetOrdersOutputDTOBase>();

            return new decimal(1);
        }

        static async Task<GetOrdersOutputDTOBase> GetOrdersEth()
        {
            var web3 = new Web3("http://127.0.0.1:7545");

            //testing with the ethereum /truffle example from the petshop tutorial
            var json = JObject.Load(new JsonTextReader(new StreamReader(System.IO.File.OpenRead("C:\\Users\\e9923570\\Source\\Repos\\Order-By-Ethereum\\Order-By-Ethereum\\build\\contracts\\OrderSystem.json"))));
            var abi = json["abi"].ToString();
            var bytecode = json["bytecode"].ToString();
            var ganacheOrderSystemContractAddress = json["networks"]["5777"]["address"].ToString();

            var senderAddress = "0xb53a1FcA5bAf097C43B6357109056D3835625bC6";
            var senderPassword = "99e3ff29ba50a4d89ee760dc3d5f7a2f05fea81ba268d25771d368e19aaa80f9";

            var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);

            //get the contract we deployed
            var contract = web3.Eth.GetContract(abi, ganacheOrderSystemContractAddress);
            var getOrdersResult = await contract.GetFunction("getOrders").CallDeserializingToObjectAsync<GetOrdersOutputDTOBase>();

            return getOrdersResult;
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

    public partial class OrderSystemService
    {
        public static Task<TransactionReceipt> DeployContractAndWaitForReceiptAsync(Nethereum.Web3.Web3 web3, OrderSystemDeployment orderSystemDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            return web3.Eth.GetContractDeploymentHandler<OrderSystemDeployment>().SendRequestAndWaitForReceiptAsync(orderSystemDeployment, cancellationTokenSource);
        }
        public static Task<string> DeployContractAsync(Nethereum.Web3.Web3 web3, OrderSystemDeployment orderSystemDeployment)
        {
            return web3.Eth.GetContractDeploymentHandler<OrderSystemDeployment>().SendRequestAsync(orderSystemDeployment);
        }
        public static async Task<OrderSystemService> DeployContractAndGetServiceAsync(Nethereum.Web3.Web3 web3, OrderSystemDeployment orderSystemDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            var receipt = await DeployContractAndWaitForReceiptAsync(web3, orderSystemDeployment, cancellationTokenSource);
            return new OrderSystemService(web3, receipt.ContractAddress);
        }

        protected Nethereum.Web3.Web3 Web3 { get; }

        public ContractHandler ContractHandler { get; }

        public OrderSystemService(Nethereum.Web3.Web3 web3, string contractAddress)
        {
            Web3 = web3;
            ContractHandler = web3.Eth.GetContractHandler(contractAddress);
        }

        public Task<bool> CompareStringsQueryAsync(CompareStringsFunction compareStringsFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<CompareStringsFunction, bool>(compareStringsFunction, blockParameter);
        }


        public Task<bool> CompareStringsQueryAsync(string a, string b, BlockParameter blockParameter = null)
        {
            var compareStringsFunction = new CompareStringsFunction();
            compareStringsFunction.A = a;
            compareStringsFunction.B = b;

            return ContractHandler.QueryAsync<CompareStringsFunction, bool>(compareStringsFunction, blockParameter);
        }

        public Task<string> CreateOrderRequestAsync(CreateOrderFunction createOrderFunction)
        {
            return ContractHandler.SendRequestAsync(createOrderFunction);
        }

        public Task<TransactionReceipt> CreateOrderRequestAndWaitForReceiptAsync(CreateOrderFunction createOrderFunction, CancellationTokenSource cancellationToken = null)
        {
            return ContractHandler.SendRequestAndWaitForReceiptAsync(createOrderFunction, cancellationToken);
        }

        public Task<string> CreateOrderRequestAsync(string orderid, string orderinfo)
        {
            var createOrderFunction = new CreateOrderFunction();
            createOrderFunction.Orderid = orderid;
            createOrderFunction.Orderinfo = orderinfo;

            return ContractHandler.SendRequestAsync(createOrderFunction);
        }

        public Task<TransactionReceipt> CreateOrderRequestAndWaitForReceiptAsync(string orderid, string orderinfo, CancellationTokenSource cancellationToken = null)
        {
            var createOrderFunction = new CreateOrderFunction();
            createOrderFunction.Orderid = orderid;
            createOrderFunction.Orderinfo = orderinfo;

            return ContractHandler.SendRequestAndWaitForReceiptAsync(createOrderFunction, cancellationToken);
        }

        public Task<BigInteger> GetNumberOfOrdersQueryAsync(GetNumberOfOrdersFunction getNumberOfOrdersFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetNumberOfOrdersFunction, BigInteger>(getNumberOfOrdersFunction, blockParameter);
        }


        public Task<BigInteger> GetNumberOfOrdersQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetNumberOfOrdersFunction, BigInteger>(null, blockParameter);
        }

        public Task<GetOrdersOutputDTO> GetOrdersQueryAsync(GetOrdersFunction getOrdersFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetOrdersFunction, GetOrdersOutputDTO>(getOrdersFunction, blockParameter);
        }

        public Task<GetOrdersOutputDTO> GetOrdersQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetOrdersFunction, GetOrdersOutputDTO>(null, blockParameter);
        }

        public Task<GetOrderInfoOutputDTO> GetOrderInfoQueryAsync(GetOrderInfoFunction getOrderInfoFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetOrderInfoFunction, GetOrderInfoOutputDTO>(getOrderInfoFunction, blockParameter);
        }

        public Task<GetOrderInfoOutputDTO> GetOrderInfoQueryAsync(string orderid, BlockParameter blockParameter = null)
        {
            var getOrderInfoFunction = new GetOrderInfoFunction();
            getOrderInfoFunction.Orderid = orderid;

            return ContractHandler.QueryDeserializingToObjectAsync<GetOrderInfoFunction, GetOrderInfoOutputDTO>(getOrderInfoFunction, blockParameter);
        }
    }

    public partial class OrderSystemDeployment : OrderSystemDeploymentBase
    {
        public OrderSystemDeployment() : base(BYTECODE) { }
        public OrderSystemDeployment(string byteCode) : base(byteCode) { }
    }

    public class OrderSystemDeploymentBase : ContractDeploymentMessage
    {
        public static string BYTECODE = "0x608060405261000c61005b565b604051809103906000f080158015610028573d6000803e3d6000fd5b5060008054600160a060020a031916600160a060020a039290921691909117905534801561005557600080fd5b5061006b565b6040516109c1806110ab83390190565b6110318061007a6000396000f3fe60806040526004361061006c5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416630e84751d811461007157806315eb3f301461009c5780632e2dc43e146100cd578063591fc296146100f3578063bed34bba14610120575b600080fd5b34801561007d57600080fd5b5061008661014d565b6040516100939190610f2e565b60405180910390f35b3480156100a857600080fd5b506100bc6100b7366004610c8a565b610154565b604051610093959493929190610ed6565b3480156100d957600080fd5b506100e2610359565b604051610093959493929190610e44565b3480156100ff57600080fd5b5061011361010e366004610cc7565b610733565b6040516100939190610ebe565b34801561012c57600080fd5b5061014061013b366004610cc7565b610a7c565b6040516100939190610eb0565b6002545b90565b6060806000806000610164610b63565b6001876040518082805190602001908083835b602083106101965780518252601f199092019160209182019101610177565b518151600019602094850361010090810a82019283169219939093169190911790925294909201968752604080519788900382018820805460c0601f600260018416159099029096019091169690960493840183900490920288018501905260a08701828152909550869450928592508401828280156102575780601f1061022c57610100808354040283529160200191610257565b820191906000526020600020905b81548152906001019060200180831161023a57829003601f168201915b50505091835250506001820154602082015260028201546040820152600382015460609091019060ff16600481111561028c57fe5b600481111561029757fe5b815260048201805460408051602060026001851615610100026000190190941693909304601f81018490048402820184019092528181529382019392918301828280156103255780601f106102fa57610100808354040283529160200191610325565b820191906000526020600020905b81548152906001019060200180831161030857829003601f168201915b5050509190925250508151608083015160208401516040850151606090950151929c919b5099509297509550909350505050565b6060806060806060610369610b63565b60025460408051828152602080840282010190915260609180156103a157816020015b606081526020019060019003908161038c5790505b50905060606002805490506040519080825280602002602001820160405280156103d5578160200160208202803883390190505b5090506060600280549050604051908082528060200260200182016040528015610409578160200160208202803883390190505b509050606060028054905060405190808252806020026020018201604052801561043d578160200160208202803883390190505b509050606060028054905060405190808252806020026020018201604052801561047b57816020015b60608152602001906001900390816104665790505b50905060005b60025481101561072057600160028281548110151561049c57fe5b9060005260206000200160405180828054600181600116156101000203166002900480156105015780601f106104df576101008083540402835291820191610501565b820191906000526020600020905b8154815290600101906020018083116104ed575b505092835250506040805160209281900383018120805460026001821615610100026000190190911604601f8101859004909402820160c090810190935260a082018481529193909284929184918401828280156105a05780601f10610575576101008083540402835291602001916105a0565b820191906000526020600020905b81548152906001019060200180831161058357829003601f168201915b50505091835250506001820154602082015260028201546040820152600382015460609091019060ff1660048111156105d557fe5b60048111156105e057fe5b815260048201805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815293820193929183018282801561066e5780601f106106435761010080835404028352916020019161066e565b820191906000526020600020905b81548152906001019060200180831161065157829003601f168201915b50505050508152505096508660000151868281518110151561068c57fe5b90602001906020020181905250866020015185828151811015156106ac57fe5b60209081029091010152604087015184518590839081106106c957fe5b60209081029091010152606087015160048111156106e357fe5b83828151811015156106f157fe5b602090810290910101526080870151825183908390811061070e57fe5b60209081029091010152600101610481565b50939a9299509097509550909350915050565b6060621275004201610743610b63565b6001856040518082805190602001908083835b602083106107755780518252601f199092019160209182019101610756565b518151600019602094850361010090810a82019283169219939093169190911790925294909201968752604080519788900382018820805460c0601f600260018416159099029096019091169690960493840183900490920288018501905260a08701828152909550869450928592508401828280156108365780601f1061080b57610100808354040283529160200191610836565b820191906000526020600020905b81548152906001019060200180831161081957829003601f168201915b50505091835250506001820154602082015260028201546040820152600382015460609091019060ff16600481111561086b57fe5b600481111561087657fe5b815260048201805460408051602060026001851615610100026000190190941693909304601f81018490048402820184019092528181529382019392918301828280156109045780601f106108d957610100808354040283529160200191610904565b820191906000526020600020905b8154815290600101906020018083116108e757829003601f168201915b505050505081525050905061092d81600001516020604051908101604052806000815250610a7c565b156109795760028054600181018083556000929092528651610976917f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace01906020890190610b9e565b50505b6040805160a0810182528681524260208201529081018390526060810160008152602001858152506001866040518082805190602001908083835b602083106109d35780518252601f1990920191602091820191016109b4565b51815160209384036101000a6000190180199092169116179052920194855250604051938490038101909320845180519194610a1494508593500190610b9e565b50602082015181600101556040820151816002015560608201518160030160006101000a81548160ff02191690836004811115610a4d57fe5b021790555060808201518051610a6d916004840191602090910190610b9e565b50869450505050505b92915050565b6000816040516020018082805190602001908083835b60208310610ab15780518252601f199092019160209182019101610a92565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405160208183030381529060405280519060200120836040516020018082805190602001908083835b60208310610b1f5780518252601f199092019160209182019101610b00565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040528051906020012014905092915050565b60a06040519081016040528060608152602001600081526020016000815260200160006004811115610b9157fe5b8152602001606081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610bdf57805160ff1916838001178555610c0c565b82800160010185558215610c0c579182015b82811115610c0c578251825591602001919060010190610bf1565b50610c18929150610c1c565b5090565b61015191905b80821115610c185760008155600101610c22565b6000601f82018313610c4757600080fd5b8135610c5a610c5582610f63565b610f3c565b91508082526020830160208301858383011115610c7657600080fd5b610c81838284610fb1565b50505092915050565b600060208284031215610c9c57600080fd5b813567ffffffffffffffff811115610cb357600080fd5b610cbf84828501610c36565b949350505050565b60008060408385031215610cda57600080fd5b823567ffffffffffffffff811115610cf157600080fd5b610cfd85828601610c36565b925050602083013567ffffffffffffffff811115610d1a57600080fd5b610d2685828601610c36565b9150509250929050565b6000610d3b82610f91565b80845260208401935083602082028501610d5485610f8b565b60005b84811015610d8b578383038852610d6f838351610e06565b9250610d7a82610f8b565b602098909801979150600101610d57565b50909695505050505050565b6000610da282610f91565b808452602084019350610db483610f8b565b60005b82811015610de457610dca868351610e3b565b610dd382610f8b565b602096909601959150600101610db7565b5093949350505050565b610df781610f95565b82525050565b610df781610fa6565b6000610e1182610f91565b808452610e25816020860160208601610fbd565b610e2e81610fed565b9093016020019392505050565b610df781610151565b60a08082528101610e558188610d30565b90508181036020830152610e698187610d97565b90508181036040830152610e7d8186610d97565b90508181036060830152610e918185610d97565b90508181036080830152610ea58184610d30565b979650505050505050565b60208101610a768284610dee565b60208082528101610ecf8184610e06565b9392505050565b60a08082528101610ee78188610e06565b90508181036020830152610efb8187610e06565b9050610f0a6040830186610e3b565b610f176060830185610e3b565b610f246080830184610dfd565b9695505050505050565b60208101610a768284610e3b565b60405181810167ffffffffffffffff81118282101715610f5b57600080fd5b604052919050565b600067ffffffffffffffff821115610f7a57600080fd5b506020601f91909101601f19160190565b60200190565b5190565b151590565b600060058210610c1857fe5b6000610a7682610f9a565b82818337506000910152565b60005b83811015610fd8578181015183820152602001610fc0565b83811115610fe7576000848401525b50505050565b601f01601f19169056fea265627a7a7230582031b16dedb78179a01f7efa9c66de91a4eecdf0f18eef0bdec24b7697c0fd19466c6578706572696d656e74616cf50037608060405234801561001057600080fd5b506109a1806100206000396000f3fe6080604052600436106100cf5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416633e239e1a81146100d45780634ac1ad781461011457806362ba96871461013e57806365c728401461019f5780637f791833146101c95780638aa001fc146102125780638c8d98a01461023c5780639054bdec1461027b57806392d66313146102d4578063a324ad2414610315578063a6f0e5771461033f578063b199993714610381578063b238ad0e146103ab578063fa93f883146103e2575b600080fd5b3480156100e057600080fd5b506100fe600480360360208110156100f757600080fd5b503561040c565b6040805160ff9092168252519081900360200190f35b34801561012057600080fd5b506100fe6004803603602081101561013757600080fd5b5035610429565b34801561014a57600080fd5b5061018d600480360360a081101561016157600080fd5b5061ffff8135169060ff602082013581169160408101358216916060820135811691608001351661043b565b60408051918252519081900360200190f35b3480156101ab57600080fd5b506100fe600480360360208110156101c257600080fd5b5035610456565b3480156101d557600080fd5b5061018d600480360360808110156101ec57600080fd5b5061ffff8135169060ff602082013581169160408101358216916060909101351661046b565b34801561021e57600080fd5b506100fe6004803603602081101561023557600080fd5b5035610485565b34801561024857600080fd5b5061018d6004803603606081101561025f57600080fd5b5061ffff8135169060ff6020820135811691604001351661048f565b34801561028757600080fd5b5061018d600480360360c081101561029e57600080fd5b5061ffff8135169060ff602082013581169160408101358216916060820135811691608081013582169160a090910135166104a9565b3480156102e057600080fd5b506102fe600480360360208110156102f757600080fd5b50356105e9565b6040805161ffff9092168252519081900360200190f35b34801561032157600080fd5b506100fe6004803603602081101561033857600080fd5b5035610679565b34801561034b57600080fd5b5061036d6004803603602081101561036257600080fd5b503561ffff1661068e565b604080519115158252519081900360200190f35b34801561038d57600080fd5b5061018d600480360360208110156103a457600080fd5b50356106dc565b3480156103b757600080fd5b506100fe600480360360408110156103ce57600080fd5b50803560ff16906020013561ffff166106f7565b3480156103ee57600080fd5b506100fe6004803603602081101561040557600080fd5b50356107bf565b60006018603c8084045b0481151561042057fe5b0690505b919050565b60006007600462015180840401610420565b600061044c868686868660006104a9565b9695505050505050565b6000610461826107ca565b6040015192915050565b600061047c858585856000806104a9565b95945050505050565b6000603c82610420565b60006104a184848460008060006104a9565b949350505050565b60006107b25b8761ffff168161ffff1610156104ed576104c88161068e565b156104db576301e28500820191506104e5565b6301e13380820191505b6001016104af565b6104f5610919565b601f81526105028961068e565b1561051357601d602082015261051b565b601c60208201525b601f60408201819052601e606083018190526080830182905260a0830181905260c0830182905260e0830182905261010083018190526101208301829052610140830152610160820152600191505b8760ff168261ffff1610156105ab578061ffff600019840116600c811061058d57fe5b602002015160ff16620151800283019250818060010192505061056a565b6001870360ff166201518002830192508560ff16610e1002830192508460ff16603c02830192508360ff168301925082925050509695505050505050565b6000806107b26301e1338084048101908290610604906106dc565b6106118361ffff166106dc565b039050806301e285000283019250806107b2830361ffff16036301e1338002830192505b84831115610671576106496001830361068e565b1561065c576301e2850083039250610666565b6301e13380830392505b600182039150610635565b509392505050565b6000610684826107ca565b6020015192915050565b600060038216156106a157506000610424565b606461ffff83160661ffff16156106ba57506001610424565b61019061ffff83160661ffff16156106d457506000610424565b506001919050565b60001901600061019082046064830460048404030192915050565b60008260ff166001148061070e57508260ff166003145b8061071c57508260ff166005145b8061072a57508260ff166007145b8061073857508260ff166008145b8061074657508260ff16600a145b8061075457508260ff16600c145b156107615750601f6107b9565b8260ff166004148061077657508260ff166006145b8061078457508260ff166009145b8061079257508260ff16600b145b1561079f5750601e6107b9565b6107a88261068e565b156107b55750601d6107b9565b50601c5b92915050565b6000603c8083610416565b6107d2610939565b600080806107df856105e9565b61ffff1684526107f06107b26106dc565b84516107ff9061ffff166106dc565b039150816301e285000283019250816107b285600001510361ffff16036301e1338002830192506000600191505b600c60ff831611610877576108468286600001516106f7565b60ff16620151800290508584820111156108685760ff82166020860152610877565b9283019260019091019061082d565b600191505b61088e856020015186600001516106f7565b60ff168260ff161115156108cb578584620151800111156108b75760ff821660408601526108cb565b62015180939093019260019091019061087c565b6108d48661040c565b60ff1660608601526108e5866107bf565b60ff1660808601526108f686610485565b60ff1660a086015261090786610429565b60ff1660c08601525092949350505050565b61018060405190810160405280600c906020820280388339509192915050565b6040805160e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c08101919091529056fea165627a7a723058203f79ec5a52ec7f97c9031f69bc9c23da787cfdf0f94f4c44b4c94edbaaf685420029";
        public OrderSystemDeploymentBase() : base(BYTECODE) { }
        public OrderSystemDeploymentBase(string byteCode) : base(byteCode) { }

    }

    public partial class CompareStringsFunction : CompareStringsFunctionBase { }

    [Function("compareStrings", "bool")]
    public class CompareStringsFunctionBase : FunctionMessage
    {
        [Parameter("string", "a", 1)]
        public virtual string A { get; set; }
        [Parameter("string", "b", 2)]
        public virtual string B { get; set; }
    }

    public partial class CreateOrderFunction : CreateOrderFunctionBase { }

    [Function("createOrder", "string")]
    public class CreateOrderFunctionBase : FunctionMessage
    {
        [Parameter("string", "orderid", 1)]
        public virtual string Orderid { get; set; }
        [Parameter("string", "orderinfo", 2)]
        public virtual string Orderinfo { get; set; }
    }

    public partial class GetNumberOfOrdersFunction : GetNumberOfOrdersFunctionBase { }

    [Function("getNumberOfOrders", "uint256")]
    public class GetNumberOfOrdersFunctionBase : FunctionMessage
    {

    }

    public partial class GetOrdersFunction : GetOrdersFunctionBase { }

    [Function("getOrders", typeof(GetOrdersOutputDTO))]
    public class GetOrdersFunctionBase : FunctionMessage
    {

    }

    public partial class GetOrderInfoFunction : GetOrderInfoFunctionBase { }

    [Function("getOrderInfo", typeof(GetOrderInfoOutputDTO))]
    public class GetOrderInfoFunctionBase : FunctionMessage
    {
        [Parameter("string", "orderid", 1)]
        public virtual string Orderid { get; set; }
    }

    public partial class LogMessageEventDTO : LogMessageEventDTOBase { }

    [Event("LogMessage")]
    public class LogMessageEventDTOBase : IEventDTO
    {
        [Parameter("string", "msg", 1, false)]
        public virtual string Msg { get; set; }
        [Parameter("string", "value", 2, false)]
        public virtual string Value { get; set; }
    }


    public partial class CompareStringsOutputDTO : CompareStringsOutputDTOBase { }

    [FunctionOutput]
    public class CompareStringsOutputDTOBase : IFunctionOutputDTO
    {
        [Parameter("bool", "", 1)]
        public virtual bool ReturnValue1 { get; set; }
    }



    public partial class GetNumberOfOrdersOutputDTO : GetNumberOfOrdersOutputDTOBase { }

    [FunctionOutput]
    public class GetNumberOfOrdersOutputDTOBase : IFunctionOutputDTO
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
    }

    public partial class GetOrdersOutputDTO : GetOrdersOutputDTOBase { }

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

    public partial class GetOrderInfoOutputDTO : GetOrderInfoOutputDTOBase { }

    [FunctionOutput]
    public class GetOrderInfoOutputDTOBase : IFunctionOutputDTO
    {
        [Parameter("string", "", 1)]
        public virtual string ReturnValue1 { get; set; }
        [Parameter("string", "", 2)]
        public virtual string ReturnValue2 { get; set; }
        [Parameter("uint256", "", 3)]
        public virtual BigInteger ReturnValue3 { get; set; }
        [Parameter("uint256", "", 4)]
        public virtual BigInteger ReturnValue4 { get; set; }
        [Parameter("uint8", "", 5)]
        public virtual byte ReturnValue5 { get; set; }
    }
}