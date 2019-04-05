import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';

import { TransactionInfo, Guid, OrderStatus } from '../shared-library';


@Component({
  selector: 'planning-dashboard',
  templateUrl: './planning-dashboard.component.html',
  styleUrls: ['./planning-dashboard.component.css']
})
export class PlanningDashboardComponent {
  //public NeedBattery: boolean = false;
  //public OrderName: string = '';

  private TheHttp: Http | null;
  public loading: boolean = false;

  public SelectedTimespan = null;
  public Timespans = [
    { id: 0, name: "24 Hours" },
    { id: 2, name: "1 Week" },
    { id: 3, name: "1 Month" }];

  public rows = [];

  public columns = [
    { name: "Timestramp", prop: "Timestamp" },
    { name: "Transaction ID", prop: 'TransactionID' },
    { name: "Transaction Type", prop: 'TransactionType' },
    { name: "Transaction Submitter", prop: 'TransactionSubmitter' }
  ];

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    this.TheHttp = http;

    this.SelectedTimespan = this.Timespans[0];

    this.GetOrders();
    //this.GetList();
  }

  public GetOrders() {

    //dummy data to test table/display
    let now = new Date();

    this.rows.push(new TransactionInfo(now, Guid.newGuid(), OrderStatus.BeingBuilt, "Bob Still"));
    this.rows.push(new TransactionInfo(now, Guid.newGuid(), OrderStatus.BeingBuilt, "Ryan Red"));

    let date1 = now.setDate(now.getDate() -1);
    this.rows.push(new TransactionInfo(new Date(date1), Guid.newGuid(), OrderStatus.OrderReceived, "Ryan Red"));
    this.rows.push(new TransactionInfo(new Date(date1), Guid.newGuid(), OrderStatus.OrderReceived, "Bill Zed"));

    let date2 = now.setDate(now.getDate() -2);
    this.rows.push(new TransactionInfo(new Date(date2), Guid.newGuid(), OrderStatus.OrderReceived, "Fred Mikel"));
    this.rows.push(new TransactionInfo(new Date(date2), Guid.newGuid(), OrderStatus.OrderReceived, "Bob Still"));
    this.rows.push(new TransactionInfo(new Date(date2), Guid.newGuid(), OrderStatus.OrderReceived, "Bob Still"));

    let date3 = now.setDate(now.getDate() -3);
    this.rows.push(new TransactionInfo(new Date(date3), Guid.newGuid(), OrderStatus.Complete, "Fred Mikel"));
    this.rows.push(new TransactionInfo(new Date(date3), Guid.newGuid(), OrderStatus.Complete, "Dun Zoe"));
    this.rows.push(new TransactionInfo(new Date(date3), Guid.newGuid(), OrderStatus.Complete, "Dun Zoe"));
    this.rows.push(new TransactionInfo(new Date(date3), Guid.newGuid(), OrderStatus.Complete, "Fred Mikel"));

    let date4 = now.setDate(now.getDate() -10);
    this.rows.push(new TransactionInfo(new Date(date4), Guid.newGuid(), OrderStatus.PreparingForShipping, "Bill Zed"));
    this.rows.push(new TransactionInfo(new Date(date4), Guid.newGuid(), OrderStatus.PreparingForShipping, "Bob Still"));

  }

  public RunSpinner() {
    this.loading = true;

    setTimeout(() => { this.loading = false; }, 3000);
  }
}
