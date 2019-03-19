using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Nethereum.Web3;

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
            var retVal = GetAccountBalance();
            retVal.Wait();
            return retVal.Result.ToString();
        }

        static async Task<decimal> GetAccountBalance()
        {
            var web3 = new Web3("https://mainnet.infura.io");

            var balance = await web3.Eth.GetBalance.SendRequestAsync("0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae");
            Console.WriteLine($"Balance in Wei: {balance.Value}");

            var etherAmount = Web3.Convert.FromWei(balance.Value);
            Console.WriteLine($"Balance in Ether: {etherAmount}");

            return etherAmount;
        }
    }
}