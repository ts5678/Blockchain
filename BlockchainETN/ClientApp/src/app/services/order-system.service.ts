import { Injectable, AnimationKeyframe } from "@angular/core";
import { Web3Service } from "./web3.service";
import { Contract } from "web3-eth-contract";
import { Observable, Subject } from "rxjs";
import { fromPromise } from "rxjs/observable/fromPromise";
import { of } from "rxjs/observable/of";
import { PassThrough } from "stream";
import { Orders } from "../model/Orders";
const OrderSystem = require("../../../build/contracts/OrderSystem.json");
const InputDataDecoder = require('ethereum-input-data-decoder');


@Injectable()
export class OrderSystemService {
  OSContract: Contract;

  transactionsArray: String[] = [];

  public transactions: Observable<any> = of(this.transactionsArray);

  public transSubject = new Subject<Orders>();

  public manuSubject = new Subject<Orders>();

  randomNumber = Math.random();

  OrderStatus = ["OrderReceived" , "BeingBuilt", "PreparedForShipping", "InTransit", "ShippingComplete",'ServiceRequested' ]

  OSContractAddr :string;

  handleCreateEvent = (rawData,eventData,receipt) => {
    let order = new Orders();
    
    if(eventData){
      null;
    }else if(rawData){
      let resultObj = this.web3Service.web3.eth.abi.decodeParameters(this.Events.createOrder.typeArray, rawData);
      console.log(this.Events.createOrder.params);
      let idx = this.Events.createOrder.params.indexOf('orderID');
      order.OrderID = resultObj[idx];
       order.OrderDate = new Date(parseInt(resultObj[this.Events.createOrder.params.indexOf('SubDate')]));
       order.OrderEstDate = new Date(parseInt(resultObj[this.Events.createOrder.params.indexOf('EstDate')]));
       order.OrderStatus= this.OrderStatus[resultObj[this.Events.createOrder.params.indexOf('orderStatus')]];
       let orderInfo = resultObj[this.Events.createOrder.params.indexOf('orderInfo')]
      order.OrderName =JSON.parse(orderInfo)["ordername"];
      order.OrderSubmitter =  receipt.from;
    }

    if(order.OrderStatus === this.OrderStatus[0]){
      this.transSubject.next(order);
    }else{
      this.manuSubject.next(order);
    }
    
  
}

 
  Events : {createOrder : {name : string, params : string[], typeArray : string[], topic: any, handler:any}} = {
    createOrder :{
      name : "CREATE_ORDER",
      params : ["orderID", "SubDate","EstDate", "orderStatus", "orderInfo"],
      typeArray: ['string', 'uint256','uint256','uint256','string'],
      topic : function(web3){
        try{
        return web3.utils.keccak256(`${this.name}(${this.typeArray})`)
        }catch(err){
          console.log(err)
        }
      },
      handler : this.handleCreateEvent
    }

  }



  constructor(private web3Service: Web3Service) {
    
    this.handleCreateEvent = this.handleCreateEvent.bind(this);
    try {
      this.setContract().then();
    } catch (e) {
      console.log(`Error while setting up contract ${e}`);
    }
    console.log(`Topic for create Order : ${this.Events.createOrder.topic(this.web3Service.web3)}`)

    
  }

  getRand(){
    return this.randomNumber;
  }

  ngOninit(){
    
    try {
      this.setContract().then();
    } catch (e) {
      console.log(`Error while setting up contract ${e}`);
    }
  }

  eventHandler(event){
    event
      .on('data', async (event)=>{
        console.log(`Event has been fired`);
        console.log(event);
        let receipt = await this.web3Service.web3.eth.getTransactionReceipt(event.transactionHash)
        if(event.event === 'CREATE_ORDER'){
          this.handleCreateEvent(event.raw.data,"",receipt);
        }
        
      })
      .on('error', console.error);

  }


  public async setContract() {
    if (!this.OSContract) {
      console.log(`Setting the contract`);
      let networkid = this.web3Service.web3.eth.net.getId().then(networkID => {
        this.OSContractAddr =  OrderSystem.networks[networkID].address;
        console.log(`This OSContractAddress :  ${this.OSContractAddr}`)
        this.OSContract = new this.web3Service.web3.eth.Contract(
          OrderSystem.abi,
          this.OSContractAddr
        );
        try {
          this.eventHandler(this.OSContract.events.allEvents());
        }catch(err){
          console.error()
        }
        console.log(`OS Contract is now set with addres`);
        console.log(this.OSContract);
      });
    }
  }

  /***
   *
   */

  createOrder(funcParams,sendParams) {
    let localParams: object = {
      from: this.web3Service.accounts[0],
      gas: 2000000
    };
    return this.OSContract.methods
        .createOrder(funcParams[0], funcParams[1], funcParams[2])
        .send(localParams);
    // debugger;
    // try {
    //   if (!this.OSContract) {
    //     throw new Error("Some issue occured.");
    //   } else {

    //       .on('transactionHash', (hash) => {
    //         console.log(`transaction hash : ${hash}`);
    //       })
    //       .on('receipt', (receipt) => {
    //         console.log(`receipt hash : ${receipt}`);
    //         console.log(receipt);
    //       })
    //       .on('error', console.error);
    //   }
    // } catch (err) {
    //   console.log(err);
    // }
  }

  updateStatus(orderID, newStatus, sendParams){
      let localParams: object = {
      from: this.web3Service.accounts[0],
      gas: 2000000
    };
    return this.OSContract.methods.changeStatus(orderID,newStatus).send(localParams)
  }

  decodeReceipt(receipt){
    let logs = receipt.logs;
    for(let logCount= 0; logCount<logs.length; logCount++){
      for (let prop in this.Events){
        let currTopic = logs[logCount].topics[0];
        let eventTopic = this.Events[prop].topic(this.web3Service.web3);
        if(currTopic === eventTopic){
          console.log(`Event Found : ${this.Events[prop].name}`);
          this.Events[prop].handler(logs[logCount].data,null, receipt);
        }
      }
    }
  }


  async getTransactions() {
    const decoder = new InputDataDecoder( OrderSystem.abi);
    let orderData : Orders = new Orders();
    

    let blockCount = await this.web3Service.web3.eth.getBlockNumber();
    for (let blockIdx = 1; blockIdx <= blockCount; blockIdx++) {
      let trxCount = await this.web3Service.web3.eth.getBlockTransactionCount(
        blockIdx
      );
      
      for (let trxIdx = 0; trxIdx < trxCount; trxIdx++) {
        try {
          let transaction = await this.web3Service.web3.eth.getTransactionFromBlock(
            blockIdx,
            trxIdx
          );
          console.log(transaction);
          let receipt = await this.web3Service.web3.eth.getTransactionReceipt(transaction.hash);
          

          if((receipt) && receipt.to !== null && (receipt.to.toLowerCase() === this.OSContractAddr.toLowerCase())){
            console.log(receipt);
            console.log(`Now decoding Receipt via log method.`)
            this.decodeReceipt(receipt);
          }

          // let result = decoder.decodeData(transaction.input);
          // if("method" in result){
          //   if (result.method !== "" || result.method !== null || result.method !== undefined){
                
          //       orderData.OrderDate = (await this.web3Service.web3.eth.getBlock(blockIdx)).timestamp;
          //       console.log(orderData.OrderDate);
          //       orderData.OrderID = result.inputs[result.names.indexOf("orderid")];
          //       console.log(result.inputs[result.names.indexOf("orderinfo")]);
          //       orderData.OrderName = JSON.parse(result.inputs[result.names.indexOf("orderinfo")]).ordername;
          //       orderData.OrderSubmitter = result.inputs[result.names.indexOf("submitter")];
          //       console.log(`${orderData.OrderID} ------------ ${orderData.OrderName} --------------- ${orderData.OrderSubmitter}`);
          //       this.transSubject.next(orderData);
          //   }
          // }
//          console.log(result);
        } catch (e) {
          console.log(e);
          continue;
        }
      }
    }
  }

   async getAllOrders(){
     if(!this.OSContract){
        const delay = new Promise(resolve => setTimeout(resolve, 100));
         await delay;
      return await this.getAllOrders();
     }
    let resultObj = await this.OSContract.methods.getAllOrders().call();
    let order = new Orders();
    let orderNums =  resultObj[0].length
    for (let counter=0; counter< orderNums; counter++){
      order.OrderID = resultObj[0][counter];
    order.OrderDate = new Date(parseInt(resultObj[1][counter]));
       order.OrderEstDate = new Date(parseInt(resultObj[2][counter]));
       order.OrderStatus= this.OrderStatus[resultObj[3][counter]];
       let orderInfo = resultObj[4][counter]
      order.OrderName =JSON.parse(orderInfo)["ordername"];
      //Wrong Way to upload.
      order.OrderSubmitter =  this.web3Service.accounts[0];

    if(order.OrderStatus !== this.OrderStatus[0]){
      this.manuSubject.next(order);
    }
    this.transSubject.next(order);
    }
    
  }

}
