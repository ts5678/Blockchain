import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';

import { OrderInfo, Guid, OrderStatus } from '../shared-library';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'planning-dashboard',
  templateUrl: './planning-dashboard.component.html',
  styleUrls: ['./planning-dashboard.component.css']
})
export class PlanningDashboardComponent {

  private TheHttp: Http | null;
  public loading: boolean = false;

  public SelectedTimespan = null;
  public Timespans = [
    { id: 0, name: "24 Hours" },
    { id: 2, name: "1 Week" },
    { id: 3, name: "1 Month" }];

  public rows = [];
  public rawdataRows = [];

  public columns = [
    { name: "Order Created", prop: "SubmissionDate" },
    { name: "Order ID", prop: 'OrderID' },
    { name: "Order Name", prop: 'OrderName' },
    { name: "Status", prop: 'Status' },
    { name: "Customer Name", prop: 'CustomerName' }
  ];


  private getOrdersURL: string;

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    this.getOrdersURL = baseUrl + 'api/data/getOrders';
    this.TheHttp = http;

    this.SelectedTimespan = this.Timespans[0];

    this.GetOrders();
  }

  public GetOrders() {
    this.loading = true;

    this.TheHttp.get(this.getOrdersURL).subscribe((result) => {
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
        
        ord.Status = this.GetOrderStatus(ethRows.returnValue4[i]);
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

  private GetOrderStatus(status: number) {
    if (status == 0)
      return OrderStatus.OrderReceived;
    else if (status == 1)
      return OrderStatus.BeingBuilt;
    else if (status == 2)
      return OrderStatus.PreparingForShipping;
    else if (status == 3)
      return OrderStatus.Complete;
  }

  public RunSpinner() {
    this.loading = true;

    setTimeout(() => { this.loading = false; }, 3000);
  }
}
