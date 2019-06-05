import { Component, Inject, TemplateRef } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';

import { OrderInfo, Guid, OrderStatus, SharedFunctions } from '../shared-library';
import { OrderSystemService } from "../services/order-system.service";
import { Web3Service } from '../services/web3.service';
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
    { name: "Action"}
  ];



  private getOrdersURL: string;
  private changeStatusURL: string;

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string, private web3Service: Web3Service, private OSService : OrderSystemService) {
    this.getOrdersURL = baseUrl + 'api/data/getOrders';
    this.changeStatusURL = baseUrl + 'api/data/changeStatus';
    this.TheHttp = http;

    this.SelectedTimespan = this.Timespans[0];

   // this.GetOrders();
    console.log(this.web3Service.web3);
  }

  public SearchOrders() {
    this.GetOrders();
  }

  ngOnInit(){
      console.log(`Random number is ${this.OSService.getRand()}`);
    console.log(`Manufacturing dashboard initiated.`);
    this.loading = true;

    this.OSService.manuSubject.asObservable().subscribe({
      next: result => {
        console.log(result);
        console.log(`manufacturing updates`);
        this.rows = [...this.rows]
        //search in rows if oreader is already there.

        let existingOrders = [];
         
  
        this.rows.map((row)=>{
          if(result.OrderID === row.OrderID){
            //order already in thr row.. just update it.
            row.Status = result.OrderStatus
            existingOrders.push(row.OrderID)
          }});
        
        if(existingOrders.indexOf(result.OrderID) === -1){
         this.rows.push({
          SubmissionDate: result.OrderDate.toISOString(),
          EstimatedDate : result.OrderEstDate.toISOString(),
          OrderID: result.OrderID,
          OrderName: result.OrderName,
          Status: result.OrderStatus,
          CustomerName: result.OrderSubmitter         
        
        })};
      
        console.log(this.rows.length);
        this.loading = false;
        this.rows =[...this.rows]
        
      }
    });
    console.log(`Length is  : ${this.rows.length}`);
    this.OSService.getAllOrders();
  }


  public GetOrders() {
    this.loading = true;

    let ethJson = {};
    ethJson['time'] = this.SelectedTimespan.id;
    this.rows = [];

    this.TheHttp.post(this.getOrdersURL, ethJson).subscribe((result) => {
      this.loading = false;
      var ethRows = JSON.parse(result.text());
      this.rawdataRows = ethRows;

      for (let i = 0; i < ethRows.returnValue1.length; i++) {

        let orderinfo = JSON.parse(ethRows.returnValue5[i]);

        let ord = new OrderInfo();
        ord.OrderID = ethRows.returnValue1[i];

        let unixTimestamp = ethRows.returnValue2[i];
        let datePipe = new DatePipe('en-US');
        ord.SubmissionDate = datePipe.transform(unixTimestamp * 1000, 'MM/dd/yyyy')
        //let myFormattedDate = new Date(dateString);
        
        ord.Status = SharedFunctions.GetOrderStatusString(ethRows.returnValue4[i]);
        ord.CustomerName = orderinfo.customer.name;
        ord.OrderName = orderinfo.ordername;
        ord.ChangeStatusText = this.GetChangeStatusText(ord);

        this.rows.push(ord);
      }

      this.rows = [...this.rows];
    }
    , error => {
        this.loading = false;
        console.error(error);
      });
  }

  public SetStatus(row) {
    let ethJson = {};
    ethJson['orderid'] = row.OrderID;
    ethJson['status'] = SharedFunctions.GetOrderStatusNumber(row.Status) + 1;

    this.loading = true;
    this.TheHttp.post(this.changeStatusURL, ethJson).subscribe((result) => {
      this.loading = false;

    }, error => {
      this.loading = false;
      console.error(error);
    });
  }

  public GetChangeStatusText(row) {
    if (OrderStatus.OrderReceived == row.Status)
      return "Start building...";
    else if (OrderStatus.BeingBuilt == row.Status)
      return "Finish production...";
    else if (OrderStatus.ReadyToShip == row.Status)
      return "Ship to customer...";
    else if (OrderStatus.InTransit == row.Status)
      return "Complete delivery...";
    else
      return "";
  }

  public RunSpinner() {
    this.loading = true;

    setTimeout(() => { this.loading = false; }, 3000);
  }
}
