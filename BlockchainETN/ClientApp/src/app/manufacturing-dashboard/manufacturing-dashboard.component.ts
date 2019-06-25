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
  selector: 'manufacturing-dashboard',
  templateUrl: './manufacturing-dashboard.component.html',
  styleUrls: ['./manufacturing-dashboard.component.css']
})
export class ManufacturingDashboardComponent {

  private TheHttp: Http | null;
  public loading: boolean = false;

  public SelectedTimespan = null;
  public Timespans = [
    { id: 86400, name: "24 Hours" },
    { id: 604800, name: "1 Week" },
    { id: 2629743, name: "1 Month" }];

  public rows = [];
  public rawdataRows = [];
  public actiontmpl: TemplateRef<any>;
  public columns = [
    { name: "Order Created", prop: "SubmissionDate" },
    { name: "Order ID", prop: 'OrderID' },
    { name: "Order Name", prop: 'OrderName' },
    { name: "Status", prop: 'Status' },
    { name: "Customer Name", prop: 'CustomerName' },
    { name: "Action" }
  ];



  private getOrdersURL: string;
  private changeStatusURL: string;

  private completeStatus: string = 'Order Fulfilled';

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string, private web3Service: Web3Service, private OSService: OrderSystemService, private toastr: ToastrService) {
    this.SelectedTimespan = this.Timespans[0];

    console.log(this.web3Service.web3);
  }

  public SearchOrders() {
    this.OSService.getAllOrders();
  }

  ngOnInit() {
    console.log(`Manufacturing dashboard initiated.`);
    this.loading = true;
    this.OSService.manuInitialLoadComplete = false;

    this.OSService.manuSubject.asObservable().subscribe({
      next: result => {
        console.log(result);
        console.log(`manufacturing updates`);
        this.rows = [...this.rows]
        //search in rows if oreader is already there.

        let existingOrders = [];


        this.rows.map((row) => {
          if (result.OrderID === row.OrderID) {
            //order already in thr row.. just update it.

            if (this.OSService.manuInitialLoadComplete && row.Status !== result.OrderStatus)
              this.toastr.warning(`${row.OrderName} has been changed`, "Orders updated");

            row.Status = result.OrderStatus
            row.ChangeStatusText = this.GetChangeStatusText(SharedFunctions.GetOrderStatusString((SharedFunctions.GetOrderStatusNumber(row.Status))))
            existingOrders.push(row.OrderID)
          }
        });

        if (existingOrders.indexOf(result.OrderID) === -1) {
          this.rows.push({
            SubmissionDate: result.OrderDate.toISOString(),
            OrderID: result.OrderID,
            OrderName: result.OrderName,
            Status: result.OrderStatus,
            CustomerName: result.OrderSubmitter,
            ChangeStatusText: this.GetChangeStatusText(SharedFunctions.GetOrderStatusString((SharedFunctions.GetOrderStatusNumber(result.OrderStatus))))
          })
          if (this.OSService.transInitialLoadComplete) {
            this.toastr.success(`${result.OrderName} has been added`, "Orders Added");
          }
        };

        console.log(this.rows.length);
        this.loading = false;
        this.rows = [...this.rows]

      }
    });
    console.log(`Length is  : ${this.rows.length}`);
    this.OSService.getAllOrders();
  }

  public SetStatus(row) {

    this.loading = true;
    if (SharedFunctions.GetOrderStatusNumber(row.Status) === 5) {
      this.loading = false;
      this.toastr.error(`This Order has been fulfilled.`);
      return;
    }

    let ethJson = {};
    ethJson['orderid'] = row.OrderID;
    ethJson['status'] = SharedFunctions.GetOrderStatusNumber(row.Status) + 1;

    this.OSService.updateStatus(ethJson['orderid'], ethJson['status'], {
      from: this.web3Service.web3.eth.accounts[0]
    })
      .on('transactionHash', (transactionHash) => {
        this.toastr.info(`Status Update Requested`);
      })
      .on('receipt', (receipt) => {
        console.log(`Status Changed`);
        this.loading = false;
      })
  }

  public GetChangeStatusText(status) {
    if (OrderStatus.OrderReceived == status)
      return "Start building...";
    else if (OrderStatus.BeingBuilt == status)
      return "Finish production...";
    else if (OrderStatus.ReadyToShip == status)
      return "Ship to customer...";
    else if (OrderStatus.InTransit == status)
      return "Complete delivery...";
    else
      return this.completeStatus;
  }

  public RunSpinner() {
    this.loading = true;

    setTimeout(() => { this.loading = false; }, 3000);
  }
}
