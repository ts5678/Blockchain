import { Component, Inject, TemplateRef } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';

import { OrderInfo, Guid, OrderStatus, SharedFunctions, RandomNums } from '../shared-library';
import { OrderSystemService } from "../services/order-system.service";
import { Web3Service } from '../services/web3.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';


@Component({
    selector: 'services-dashboard',
    templateUrl: './services-dashboard.component.html',
    styleUrls: ['./services-dashboard.component.css']
})
export class ServicesDashboardComponent {

    public loading: boolean = false;

    public AllWarranty: boolean = true;


    public rows = [];
    public allrows = [];


    private completeStatus: string = 'Order Fulfilled';
    public ShowRandomServiceIssue: boolean = false;

    constructor(private web3Service: Web3Service, private OSService: OrderSystemService, private toastr: ToastrService) {
        console.log(this.web3Service.web3);
    }

    public SearchOrders() {
        this.OSService.getAllWarrantyOrders();
    }

    public FilterOrders() {

        if (this.AllWarranty)
            this.rows = [...this.allrows.filter(row => SharedFunctions.GetOrderStatusNumber(row.OrderStatus) > 3)];
        else
            this.rows = [...this.allrows.filter(row => SharedFunctions.GetServiceReasonNumber(row.OrderServiceReasonStatus) > 0)];

    }

    ngOnInit() {
        console.log(`services dashboard initiated.`);
        this.loading = true;
        this.OSService.orderNotifyLoadComplete = false;


        this.OSService.orderNotify.asObservable().subscribe({
            next: result => {
                console.log(result);
                console.log(`services updates`);
                this.allrows = [...this.allrows];

                let existingOrders = [];

                this.allrows.map((row) => {
                    if (result.OrderID === row.OrderID) {
                        //order already in thr row.. just update it.

                        if (this.OSService.orderNotifyLoadComplete && row.Status !== result.OrderStatus)
                            this.toastr.warning(`${row.OrderName} has been changed`, "Orders updated");

                        row.Status = result.OrderStatus;
                        //row.ChangeStatusText = this.GetChangeStatusText(SharedFunctions.GetOrderStatusString((SharedFunctions.GetOrderStatusNumber(row.Status))));
                        existingOrders.push(row.OrderID);
                    }
                });

                //OrderName
                //OrderID
                //OrderSubmitter
                //CustomerInfo.Email
                //OrderServiceReasonStatus
                //OrderServiceDate

                if (existingOrders.indexOf(result.OrderID) === -1 && SharedFunctions.GetOrderStatusNumber(result.OrderStatus) > 3) {
                    this.allrows.push({
                        OrderName: result.OrderName,
                        OrderID: result.OrderID,
                        OrderSubmitter: result.OrderSubmitter,
                        CustomerInfo: result.CustomerInfo,
                        OrderServiceReasonStatus: result.OrderServiceReasonStatus,
                        OrderServiceDate: result.OrderServiceDate,
                        OrderStatus: result.OrderStatus
                    });

                    if (this.OSService.orderNotifyLoadComplete)
                        this.toastr.success(`${result.OrderName} has been added`, "Orders Added");
                };

                console.log(this.allrows.length);

                this.loading = false;
                this.allrows = [...this.allrows];

            }
        });
        console.log(`Length is  : ${this.allrows.length}`);
        this.OSService.getAllWarrantyOrders().then((value) => {
            this.FilterOrders();
            this.loading = false;
        });;
    }

    public ToggleCreateRandomServiceIssue() {

        this.ShowRandomServiceIssue = !this.ShowRandomServiceIssue;

    }

    public CreateRandomServiceIssue(row) {

        this.loading = true;

        let newstatus = SharedFunctions.GetServiceReasonNumber(row.OrderServiceReasonStatus) + RandomNums.getRandomInt(1, 5);

        this.OSService.updateServiceStatus(row.OrderID, newstatus, {
            from: this.web3Service.web3.eth.accounts[0]
        })
            .on('transactionHash', (transactionHash) => {
                this.toastr.info(`Service Status Update Requested`);
            })
            .on('receipt', (receipt) => {
                console.log(`Service Status Changed`);
                this.loading = false;
            });

    }

    public RunSpinner() {
        this.loading = true;

        setTimeout(() => { this.loading = false; }, 3000);
    }
}
