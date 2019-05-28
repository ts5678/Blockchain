import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';
import * as $ from 'jquery/dist/jquery.min.js';

import { OrderInfo, Guid, OrderStatus, SharedFunctions } from '../shared-library';
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

  public itemToChange = null;

  private getOrdersURL: string;
  private changeStatusURL: string;

  public progressbarvalue = 0;

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    this.getOrdersURL = baseUrl + 'api/data/getOrders';
    this.changeStatusURL = baseUrl + 'api/data/changeStatus';
    this.TheHttp = http;

    this.SelectedTimespan = this.Timespans[0];

    this.GetOrders();
  }

  public SearchOrders() {
    this.GetOrders();
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
        ord.SubmissionDateNumber = unixTimestamp;
        ord.SubmissionDate = datePipe.transform(unixTimestamp * 1000, 'MMM d, y, h:mm:ss a');//'MM/dd/yyyy')
        //let myFormattedDate = new Date(dateString);
        
        ord.Status = SharedFunctions.GetOrderStatusString(ethRows.returnValue4[i]);
        ord.CustomerName = orderinfo.customer.name;
        ord.OrderName = orderinfo.ordername;
        ord.ChangeStatusText = this.GetChangeStatusText(ord);

        this.rows.push(ord);
      }

      this.rows = this.rows.sort(function (a, b) {

        let statusOrd = SharedFunctions.GetOrderStatusNumber(a.Status) - SharedFunctions.GetOrderStatusNumber(b.Status);
        let dateOrd = b.SubmissionDateNumber - a.SubmissionDateNumber;

        if (statusOrd == 0)
          return dateOrd;//if status equal, ret by date below
        else
          return statusOrd;

      });

      this.rows = [...this.rows];
    }
    , error => {
        this.loading = false;
        console.error(error);
      });
  }

  public ShowStatusChange(row) {
    this.itemToChange = row;
    this.progressbarvalue = 0;
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

  public CancelStatusChange() {
    this.itemToChange = null;
  }

  public SetStatusChange() {
    let ethJson = {};
    ethJson['orderid'] = this.itemToChange.OrderID;
    ethJson['status'] = SharedFunctions.GetOrderStatusNumber(this.itemToChange.Status) + 1;

    this.progressbarvalue = 25;

    this.TheHttp.post(this.changeStatusURL, ethJson).subscribe((result) => {

      this.itemToChange = null;
      this.progressbarvalue = 100;

      setTimeout(() => {
        this.GetOrders();
        $("[data-dismiss=modal]").trigger({ type: "click" });
      }, 1000);

    }, error => {
      this.progressbarvalue = 100;
      this.itemToChange = null;

      console.error(error);
    });
  }
}
