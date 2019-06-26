import { Component, Inject, TemplateRef } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';

import { OrderInfo, Guid, OrderStatus, SharedFunctions } from '../shared-library';
import { OrderSystemService } from "../services/order-system.service";
import { Web3Service } from '../services/web3.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';


@Component({
    selector: 'analytics-dashboard',
    templateUrl: './analytics-dashboard.component.html',
    styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent {
    public loading: boolean = false;

    public rows = [];

    private completeStatus: string = 'Order Fulfilled';

    constructor(private web3Service: Web3Service, private OSService: OrderSystemService, private toastr: ToastrService) {
        console.log(this.web3Service.web3);
    }

    public SearchOrders() {
        this.OSService.getAllOrders();
    }

    ngOnInit() {
        console.log(`analytics dashboard initiated.`);
        this.loading = true;
        this.OSService.orderNotifyLoadComplete = false;

        //this.OSService.orderNotify.asObservable().subscribe({
        //    next: result => {
        //        console.log(result);
        //        console.log(`analytics updates`);
        //        this.rows = [...this.rows];
        //        //search in rows if oreader is already there.

        //        let existingOrders = [];


        //        this.rows.map((row) => {
        //            if (result.OrderID === row.OrderID) {
        //                //order already in thr row.. just update it.

        //                if (this.OSService.orderNotifyLoadComplete && row.Status !== result.OrderStatus)
        //                    this.toastr.warning(`${row.OrderName} has been changed`, "Orders updated");

        //                row.Status = result.OrderStatus;
        //                row.ChangeStatusText = this.GetChangeStatusText(SharedFunctions.GetOrderStatusString((SharedFunctions.GetOrderStatusNumber(row.Status))));
        //                existingOrders.push(row.OrderID);
        //            }
        //        });

        //        if (existingOrders.indexOf(result.OrderID) === -1 && SharedFunctions.GetOrderStatusNumber(result.OrderStatus) > 0) {
        //            this.rows.push({
        //                SubmissionDate: result.OrderDate.toISOString(),
        //                OrderID: result.OrderID,
        //                OrderName: result.OrderName,
        //                Status: result.OrderStatus,
        //                CustomerName: result.OrderSubmitter,
        //                ChangeStatusText: this.GetChangeStatusText(SharedFunctions.GetOrderStatusString((SharedFunctions.GetOrderStatusNumber(result.OrderStatus))))
        //            })
        //            if (this.OSService.orderNotifyLoadComplete) {
        //                this.toastr.success(`${result.OrderName} has been added`, "Orders Added");
        //            }
        //        };

        //        console.log(this.rows.length);
        //        this.loading = false;
        //        this.rows = [...this.rows];

        //    }
        //});
        console.log(`Length is  : ${this.rows.length}`);
        //this.OSService.getTransactions().then((result) => {
        //    let asdf = 'asdf';
        //    this.rows.push('1');
        //});
    }

    public RunSpinner() {
        this.loading = true;

        setTimeout(() => { this.loading = false; }, 3000);
    }
}
