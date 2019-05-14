import { Component, Inject, TemplateRef } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';

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



  private getOrdersURL: string;

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    this.getOrdersURL = baseUrl + 'api/data/getOrders';
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
        ord.SubmissionDate = datePipe.transform(unixTimestamp * 1000, 'MM/dd/yyyy')
        //let myFormattedDate = new Date(dateString);
        
        ord.Status = SharedFunctions.GetOrderStatus(ethRows.returnValue4[i]);
        ord.CustomerName = orderinfo.customer.name;
        ord.OrderName = orderinfo.ordername;

        this.rows.push(ord);
      }

      this.rows = [...this.rows];
    }
    , error => {
        this.loading = false;
        console.error(error);
      });
  }

  public SetStatus(row)
  {
    let a = 1 + 1;
  }

  public RunSpinner() {
    this.loading = true;

    setTimeout(() => { this.loading = false; }, 3000);
  }
}
