import { ToastrService } from 'ngx-toastr';
import { SharedFunctions, OrderStatus, CustomerInfo } from './../shared-library';
import { Injectable, AnimationKeyframe, EventEmitter } from "@angular/core";
import { Web3Service } from "./web3.service";
import { Contract } from "web3-eth-contract";
import { Observable, Subject } from "rxjs";
import { fromPromise } from "rxjs/observable/fromPromise";
import { of } from "rxjs/observable/of";
import { PassThrough } from "stream";
import { Orders } from "../model/Orders";
import { Dictionary, KeyValuePair } from "../dictionary";
import { keyframes } from '@angular/core/src/animation/dsl';
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

    public orderNotify = new Subject<Orders>();
    orderNotifyLoadComplete = false;

    //public manuSubject = new Subject<Orders>();
    //manuInitialLoadComplete = false;

    randomNumber = Math.random();

    //OrderStatus = ["OrderReceived", "BeingBuilt", "PreparedForShipping", "InTransit", "ShippingComplete", 'ServiceRequested']

    OSContractAddr: string;

    private static billingAddresses = new Dictionary<string, number>();
    private static mailingAddresses = new Dictionary<string, number>();

    private static orders = 0;
    private static transactions = 0;
    private static nonCompleteOrders = 0;
    private static warrantyOrders = 0;
    private static warrantyPrice = 0;
    private static orderPrice = 0;

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

        this.orderNotify.next(order);
    }


    handleOrderDetailsEvent = (rawData, eventData, receipt) => {
        let order = new Orders();
        let eventObj = this.Events.ORDER_DETAILS;

        if (eventData) {
            null;
        }
        else if (rawData) {
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

        this.orderNotify.next(order);
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



    constructor(private web3Service: Web3Service, private toastr: ToastrService) {

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
                } else if (event.event == this.Events.ORDER_DETAILS.name) {
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
                console.log(`OS Contract is now set with address`);
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
            .createOrder(funcParams[0], funcParams[1], funcParams[2], funcParams[3])
            .send(localParams);
    }

    updateStatus(orderID, newStatus, sendParams) {
        let localParams: object = {
            from: this.web3Service.accounts[0],
            gas: 2000000
        };
        return this.OSContract.methods.changeStatus(orderID, newStatus).send(localParams);
    }

    updateServiceStatus(orderID, newStatus, sendParams) {
        let localParams: object = {
            from: this.web3Service.accounts[0],
            gas: 2000000
        };
        return this.OSContract.methods.changeServiceStatus(orderID, newStatus).send(localParams);
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
        
        let blockCount = await this.web3Service.web3.eth.getBlockNumber();
        let totalTrxCount = 0;
        for (let blockIdx = 1; blockIdx <= blockCount; blockIdx++) {
            let trxCount = await this.web3Service.web3.eth.getBlockTransactionCount(
                blockIdx
            );

            totalTrxCount = totalTrxCount + trxCount;

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

                } catch (e) {
                    console.log(e);
                    continue;
                }
            }
        }
        OrderSystemService.transactions = totalTrxCount;
    }

    getTransactionNumber() {
        return OrderSystemService.transactions;
    }

    async getAllOrders() {
        if (!this.OSContract) {
            const delay = new Promise(resolve => setTimeout(resolve, 100));
            await delay;
            return await this.getAllOrders();
        }

        let resultObj = await this.OSContract.methods.getAllOrders().call();

        let order = new Orders();
        let orderNums = resultObj[0].length;
        OrderSystemService.orders = orderNums;
        let nonCompletes = 0;
        let totalOrderPrice = 0;
        let orderState = '';
        let mailingState = '';
        let tempBillingAddresses = new Dictionary<string, number>();
        let tempMailingAddresses = new Dictionary<string, number>();

        for (let counter = 0; counter < orderNums; counter++) {
            order.OrderID = resultObj[0][counter];
            order.OrderDate = new Date(parseInt(resultObj[1][counter]) * 1000);
            order.OrderEstDate = new Date(parseInt(resultObj[2][counter]) * 1000);
            order.OrderStatus = SharedFunctions.GetOrderStatusString(resultObj[3][counter]);
            console.log("Event Status: " + order.OrderStatus);
            console.log("This State: " + JSON.parse(resultObj[4][counter])['billingaddress']['stateprovince']);
            if(order.OrderStatus != "Delivered") 
                nonCompletes++;
            let orderInfo = resultObj[4][counter];
            totalOrderPrice = totalOrderPrice + JSON.parse(orderInfo)["price"];
            order.OrderName = JSON.parse(orderInfo)["ordername"];
            orderState = JSON.parse(orderInfo)['billingaddress']['stateprovince'];
            mailingState = JSON.parse(orderInfo)['shippingaddress']['stateprovince'];
            
            // Add the billing address and mailing address of order to a map which will
            // keep track of the number of orders from that state.
            if(tempBillingAddresses.containsKey(orderState)) {
                let currentStateQuantity = tempBillingAddresses.tryGetValue(orderState);
                tempBillingAddresses.remove(x => x.key == orderState);
                tempBillingAddresses.add(orderState, currentStateQuantity + 1);
            }
            else {
                tempBillingAddresses.add(orderState, 1);
            }
            if(tempMailingAddresses.containsKey(mailingState)) {
                let currentStateQuantity = tempMailingAddresses.tryGetValue(mailingState);
                tempMailingAddresses.remove(x => x.key == mailingState);
                tempMailingAddresses.add(mailingState, currentStateQuantity + 1);
            }
            else {
                tempMailingAddresses.add(mailingState, 1);
            }
            order.OrderInfo = order.OrderInfo;
            //Wrong Way to upload.
            order.OrderSubmitter = resultObj[5][counter];

            this.orderNotify.next(order);
        }

        OrderSystemService.nonCompleteOrders = nonCompletes;
        OrderSystemService.orderPrice = totalOrderPrice;
        OrderSystemService.billingAddresses = tempBillingAddresses;
        OrderSystemService.mailingAddresses = tempMailingAddresses;
        for(let i = 0; i < OrderSystemService.billingAddresses.length; i++) {
            console.log("State Value: " + OrderSystemService.billingAddresses.elementAt(i).key);
        }
        
        this.orderNotifyLoadComplete = true;
    }

    getNonCompleteNumber() {
        return OrderSystemService.nonCompleteOrders;
    }

    getOrderNumber() {
        return OrderSystemService.orders;
    }

    getOrderPrice() {
        return OrderSystemService.orderPrice;
    }

    getBillingAddresses() {
        return OrderSystemService.billingAddresses;
    }

    getMailingAddresses() {
        return OrderSystemService.mailingAddresses;
    }

    async getAllWarrantyOrders() {
        if (!this.OSContract) {
            const delay = new Promise(resolve => setTimeout(resolve, 100));
            await delay;
            return await this.getAllWarrantyOrders();
        }

        let resultObj = await this.OSContract.methods.getAllWarrantyOrders().call();

        let order = new Orders();
        let orderNums = resultObj[0].length;
        let totalWarrantyOrders = 0;
        let totalWarrantyPrice = 0;

        for (let counter = 0; counter < orderNums; counter++) {
            let ordid = resultObj[0][counter];
            if (ordid.length > 0) {
                totalWarrantyOrders++;
                order.OrderID = resultObj[0][counter];
                order.OrderDate = new Date(parseInt(resultObj[1][counter]) * 1000);
                let servicedate = resultObj[2][counter];
                if (servicedate != "0")
                    order.OrderServiceDate = new Date(parseInt(servicedate) * 1000);
                order.OrderStatus = SharedFunctions.GetOrderStatusString(resultObj[3][counter]);
                order.OrderInfo = resultObj[4][counter];
                let parsedJson = JSON.parse(order.OrderInfo);
                order.OrderName = parsedJson["ordername"];
                order.CustomerInfo = CustomerInfo.fromJson(parsedJson['customer']);
                totalWarrantyPrice = totalWarrantyPrice + parsedJson["price"];

                order.OrderSubmitter = resultObj[5][counter];
                order.OrderServiceReasonStatus = SharedFunctions.GetServiceReasonString(resultObj[6][counter]);

                this.orderNotify.next(order);
            }
        }

        OrderSystemService.warrantyOrders = totalWarrantyOrders;
        OrderSystemService.warrantyPrice = totalWarrantyPrice;

        this.orderNotifyLoadComplete = true;
    }

    getWarrantyOrderNumber() {
        return OrderSystemService.warrantyOrders;
    }

    getWarrantyPrice() {
        return OrderSystemService.warrantyPrice;
    }

}
