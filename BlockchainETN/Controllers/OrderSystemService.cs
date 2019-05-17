using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Web3;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts.CQS;
using Nethereum.Contracts.ContractHandlers;
using Nethereum.Contracts;
using System.Threading;
using OrderByEthereum.Contracts.OrderSystem.ContractDefinition;

namespace OrderByEthereum.Contracts.OrderSystem
{
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

        protected Nethereum.Web3.Web3 Web3{ get; }

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

        public Task<string> CreateOrderRequestAsync(string orderid, string orderinfo, string submitter)
        {
            var createOrderFunction = new CreateOrderFunction();
                createOrderFunction.Orderid = orderid;
                createOrderFunction.Orderinfo = orderinfo;
                createOrderFunction.Submitter = submitter;
            
             return ContractHandler.SendRequestAsync(createOrderFunction);
        }

        public Task<TransactionReceipt> CreateOrderRequestAndWaitForReceiptAsync(string orderid, string orderinfo, string submitter, CancellationTokenSource cancellationToken = null)
        {
            var createOrderFunction = new CreateOrderFunction();
                createOrderFunction.Orderid = orderid;
                createOrderFunction.Orderinfo = orderinfo;
                createOrderFunction.Submitter = submitter;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(createOrderFunction, cancellationToken);
        }

        public Task<string> ChangeStatusRequestAsync(ChangeStatusFunction changeStatusFunction)
        {
             return ContractHandler.SendRequestAsync(changeStatusFunction);
        }

        public Task<TransactionReceipt> ChangeStatusRequestAndWaitForReceiptAsync(ChangeStatusFunction changeStatusFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(changeStatusFunction, cancellationToken);
        }

        public Task<string> ChangeStatusRequestAsync(string orderid, BigInteger newstatus)
        {
            var changeStatusFunction = new ChangeStatusFunction();
                changeStatusFunction.Orderid = orderid;
                changeStatusFunction.Newstatus = newstatus;
            
             return ContractHandler.SendRequestAsync(changeStatusFunction);
        }

        public Task<TransactionReceipt> ChangeStatusRequestAndWaitForReceiptAsync(string orderid, BigInteger newstatus, CancellationTokenSource cancellationToken = null)
        {
            var changeStatusFunction = new ChangeStatusFunction();
                changeStatusFunction.Orderid = orderid;
                changeStatusFunction.Newstatus = newstatus;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(changeStatusFunction, cancellationToken);
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

        public Task<GetOrdersOutputDTO> GetOrdersQueryAsync(BigInteger timeGreaterThan, BlockParameter blockParameter = null)
        {
            var getOrdersFunction = new GetOrdersFunction();
                getOrdersFunction.TimeGreaterThan = timeGreaterThan;
            
            return ContractHandler.QueryDeserializingToObjectAsync<GetOrdersFunction, GetOrdersOutputDTO>(getOrdersFunction, blockParameter);
        }

        public Task<GetAllOrdersOutputDTO> GetAllOrdersQueryAsync(GetAllOrdersFunction getAllOrdersFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetAllOrdersFunction, GetAllOrdersOutputDTO>(getAllOrdersFunction, blockParameter);
        }

        public Task<GetAllOrdersOutputDTO> GetAllOrdersQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetAllOrdersFunction, GetAllOrdersOutputDTO>(null, blockParameter);
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
}
