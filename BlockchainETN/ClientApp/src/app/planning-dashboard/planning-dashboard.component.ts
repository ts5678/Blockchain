import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';

import { OrderInfo, Guid, OrderStatus } from '../shared-library';


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

  public context;

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
    var context = this;
    this.TheHttp.get(this.getOrdersURL).subscribe((result) => {
      this.loading = false;
      var ethRows = JSON.parse(result.text());
      this.rawdataRows = ethRows;

      for (let i = 0; i < ethRows.returnValue1.length; i++) {

        let orderinfo = JSON.parse(ethRows.returnValue5[i]);

        let ord = new OrderInfo();
        ord.OrderID = ethRows.returnValue1[i];
        ord.SubmissionDate = new Date(ethRows.returnValue2[i]);
        ord.Status = ethRows.returnValue4[i];
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

  public RunSpinner() {
    this.loading = true;

    setTimeout(() => { this.loading = false; }, 3000);
  }
}
