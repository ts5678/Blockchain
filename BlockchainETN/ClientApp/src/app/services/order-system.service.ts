import { ToastrService } from 'ngx-toastr';
import { SharedFunctions, OrderStatus } from './../shared-library';
import { Injectable, AnimationKeyframe, EventEmitter } from "@angular/core";
import { Web3Service } from "./web3.service";
import { Contract } from "web3-eth-contract";
import { Observable, Subject } from "rxjs";
import { fromPromise } from "rxjs/observable/fromPromise";
import { of } from "rxjs/observable/of";
import { PassThrough } from "stream";
import { Orders } from "../model/Orders";
const OrderSystem = require("../../../build/contracts/OrderSystem.json");
const InputDataDecoder = require('ethereum-input-data-decoder');


/***
 * 
* @typedef   {object} sendParams  
* @property  {string} from
* @property  {string} gas
 * 
 */

@Injectable()
export class OrderSystemService {
  OSContract: Contract;

  transactionsArray: String[] = [];

  public transactions: Observable<any> = of(this.transactionsArray);

  public transSubject = new Subject<Orders>();
  transInitialLoadComplete = false;

  public manuSubject = new Subject<Orders>();
  manuInitialLoadComplete = false;

  randomNumber = Math.random();

  //OrderStatus = ["OrderReceived", "BeingBuilt", "PreparedForShipping", "InTransit", "ShippingComplete", 'ServiceRequested']

  OSContractAddr: string;

  handleCreateEvent = (rawData, eventData, receipt) => {
    let order = new Orders();

    if (eventData) {
      null;
    } else if (rawData) {
      let resultObj = this.web3Service.web3.eth.abi.decodeParameters(this.Events.CREATE_ORDER.typeArray, rawData);
      console.log(this.Events.CREATE_ORDER.params);
      let idx = this.Events.CREATE_ORDER.params.indexOf('orderID');
      order.OrderID = resultObj[idx];
      order.OrderDate = new Date(parseInt(resultObj[this.Events.CREATE_ORDER.params.indexOf('SubDate')]));
      order.OrderEstDate = new Date(parseInt(resultObj[this.Events.CREATE_ORDER.params.indexOf('EstDate')]));
      order.OrderStatus = SharedFunctions.GetOrderStatusString(resultObj[this.Events.CREATE_ORDER.params.indexOf('orderStatus')]);
      let orderInfo = resultObj[this.Events.CREATE_ORDER.params.indexOf('orderInfo')]
      order.OrderName = JSON.parse(orderInfo)["ordername"];
      order.OrderSubmitter = receipt.from;
    }

    this.transSubject.next(order);
    if(order.OrderStatus !== OrderStatus.OrderReceived)
    this.manuSubject.next(order);
  


  }


  handleOrderDetailsEvent = (rawData, eventData, receipt) => {
    let order = new Orders();
    let eventObj = this.Events.ORDER_DETAILS;
    if (eventData) {
      null;
    } else if (rawData) {
      let resultObj = this.web3Service.web3.eth.abi.decodeParameters(eventObj.typeArray, rawData);
      console.log(eventObj.params);
      let idx = eventObj.params.indexOf('orderID');
      order.OrderID = resultObj[idx];
      order.OrderDate = new Date(parseInt(resultObj[eventObj.params.indexOf('SubDate')]));
      order.OrderEstDate = new Date(parseInt(resultObj[eventObj.params.indexOf('EstDate')]));
      order.OrderStatus = SharedFunctions.GetOrderStatusString(resultObj[eventObj.params.indexOf('orderStatus')]);
      let orderInfo = resultObj[eventObj.params.indexOf('orderInfo')]
      order.OrderName = JSON.parse(orderInfo)["ordername"];
      order.OrderSubmitter = resultObj[eventObj.params.indexOf('submitter')];
    }

      this.transSubject.next(order);
      if(order.OrderStatus !== OrderStatus.OrderReceived)
      this.manuSubject.next(order);
    
  }


  Events: {
    CREATE_ORDER: { name: string, params: string[], typeArray: string[], topic: any, handler: any },
    ORDER_DETAILS: { name: string, params: string[], typeArray: string[], topic: any, handler: any }
  } = {
      CREATE_ORDER: {
        name: "CREATE_ORDER",
        params: ["orderID", "SubDate", "EstDate", "orderStatus", "orderInfo"],
        typeArray: ['string', 'uint256', 'uint256', 'uint256', 'string'],
        topic: function (web3) {
          try {
            return web3.utils.keccak256(`${this.name}(${this.typeArray})`)
          } catch (err) {
            console.log(err)
          }
        },
        handler: this.handleCreateEvent
      },
      ORDER_DETAILS: {
        name: "ORDER_DETAILS",
        params: ["orderID", "SubDate", "EstDate", "orderStatus", "orderInfo", "submitter"],
        typeArray: ['string', 'uint256', 'uint256', 'uint256', 'string', 'string'],
        topic: function (web3) {
          try {
            return web3.utils.keccak256(`${this.name}(${this.typeArray})`)
          } catch (err) {
            console.log(err)
          }
        },
        handler: this.handleCreateEvent
      }


    }



  constructor(private web3Service: Web3Service, private toastr : ToastrService) {

    this.handleCreateEvent = this.handleCreateEvent.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
    try {
      this.setContract().then();
    } catch (e) {
      console.log(`Error while setting up contract ${e}`);
    }
    console.log(`Topic for create Order : ${this.Events.CREATE_ORDER.topic(this.web3Service.web3)}`)


  }



  /***
   * ngOnInit makes sure that the contract is set before any functions of Order System services are called.
   * 
   * 
   */
  ngOninit() {

    try {
      this.setContract().then();
    } catch (e) {
      console.log(`Error while setting up contract ${e}`);
    }
  }

  /**
   * This is a generic event handller, which will receive event of type Event Emitter. this will be used to handle the event raised by 
   * blockchain when certain operation has been completed. 
   * This function is used as a callback for the event subscription done blockchain.
   * Depending on the event type it further calls a specialist event handler. For example for CREATE_ORDER event,handleCreateEvent
   * is called
   * @param {EventEmitter} event event is an object of type Event Emitter returned by subscripion. 
   * 
   */
  eventHandler(event) {
    event
      .on('data', async (event) => {
        console.log(`Event has been fired`);
        console.log(event);
        let receipt = await this.web3Service.web3.eth.getTransactionReceipt(event.transactionHash)
        if (event.event === 'CREATE_ORDER') {
          this.handleCreateEvent(event.raw.data, "", receipt);
        }else if (event.event == this.Events.ORDER_DETAILS.name) {
          this.handleOrderDetailsEvent(event.raw.data, "", receipt)
        }
      })
      .on('error', console.error);

  }




  /**
   * setContract() make sure to set the contract before user can do any operation.
   * It waits for Web3 to be initiated and then assigns the contract to a variable and called during the initiation of the service.
   */
  public async setContract() {
    if (!this.OSContract) {
      console.log(`Setting the contract`);

      let networkid = this.web3Service.web3.eth.net.getId().then(networkID => {
        this.OSContractAddr = OrderSystem.networks[networkID].address;
        console.log(`This OSContractAddress :  ${this.OSContractAddr}`)
        this.OSContract = new this.web3Service.web3.eth.Contract(
          OrderSystem.abi,
          this.OSContractAddr
        );
        try {
          this.eventHandler(this.OSContract.events.allEvents());
        } catch (err) {
          console.error()
        }
        console.log(`OS Contract is now set with addres`);
        console.log(this.OSContract);
      });
    }
  }

  /**
   * createOrder is handler for calling createOrder function of the smart contract. It simply return the 
   * PromiEvent Object return by the function so that caller can take the action accordingly.
   * 
   * @typedef {object} sendParams
   *  
   * @param {string []} funcParams sends the array of parameters to the createOrder so the this function is agnostic about the name or the param.
   * 
   * @param {sendParams} sendParams it makes sure what you want to send to 
   * 
   * 
   */

  createOrder(funcParams, sendParams) {
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

  updateStatus(orderID, newStatus, sendParams) {
    let localParams: object = {
      from: this.web3Service.accounts[0],
      gas: 2000000
    };
    return this.OSContract.methods.changeStatus(orderID, newStatus).send(localParams)
  }

  decodeReceipt(receipt) {
    let logs = receipt.logs;
    for (let logCount = 0; logCount < logs.length; logCount++) {
      for (let prop in this.Events) {
        let currTopic = logs[logCount].topics[0];
        let eventTopic = this.Events[prop].topic(this.web3Service.web3);
        if (currTopic === eventTopic) {
          console.log(`Event Found : ${this.Events[prop].name}`);
          this.Events[prop].handler(logs[logCount].data, null, receipt);
        }
      }
    }
  }


  async getTransactions() {
    const decoder = new InputDataDecoder(OrderSystem.abi);
    let orderData: Orders = new Orders();


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


          if ((receipt) && receipt.to !== null && (receipt.to.toLowerCase() === this.OSContractAddr.toLowerCase())) {
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

  async getAllOrders() {
    if (!this.OSContract) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.getAllOrders();
    }
    let resultObj = await this.OSContract.methods.getAllOrders().call();
    let order = new Orders();
    let orderNums = resultObj[0].length
    for (let counter = 0; counter < orderNums; counter++) {
      order.OrderID = resultObj[0][counter];
      order.OrderDate = new Date(parseInt(resultObj[1][counter]));
      order.OrderEstDate = new Date(parseInt(resultObj[2][counter]));
      order.OrderStatus = SharedFunctions.GetOrderStatusString(resultObj[3][counter]);
      let orderInfo = resultObj[4][counter]
      order.OrderName = JSON.parse(orderInfo)["ordername"];
      //Wrong Way to upload.
      order.OrderSubmitter = resultObj[5][counter]

      this.transSubject.next(order);
      if(order.OrderStatus !== OrderStatus.OrderReceived)
      this.manuSubject.next(order);
    
    }

    this.transInitialLoadComplete = true;
    this.manuInitialLoadComplete = true;
  }

}
