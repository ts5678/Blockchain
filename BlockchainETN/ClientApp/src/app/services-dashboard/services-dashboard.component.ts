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
  selector: 'services-dashboard',
  templateUrl: './services-dashboard.component.html',
  styleUrls: ['./services-dashboard.component.css']
})
export class ServicesDashboardComponent {

  public loading: boolean = false;

  public ShowTotals: boolean = false;


  public rows = [];
  public rawdataRows = [];

  public columns = [
    { name: "Order Name", prop: "OrderName" },
    { name: "Serial Number", prop: 'OrderID' },
    { name: "Customer Name", prop: 'OrderSubmitter' },
    { name: "Contact Info", prop: 'CustomerInfo.Email' },
    { name: "Service Requested Date", prop: 'OrderServiceDate' },
  ];
 
  private completeStatus : string = 'Order Fulfilled';

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string, private web3Service: Web3Service, private OSService : OrderSystemService, private toastr : ToastrService) {
    console.log(this.web3Service.web3);
  }

  public SearchOrders() {
    this.OSService.getAllWarrantyOrders();
  }

  ngOnInit(){
    console.log(`services dashboard initiated.`);
    this.loading = true;
    this.OSService.manuInitialLoadComplete = false;

    this.OSService.manuSubject.asObservable().subscribe({
      next: result => {
        console.log(result);
        console.log(`services updates`);
        this.rows = [...this.rows]
        //search in rows if oreader is already there.

        let existingOrders = [];
         
  
        this.rows.map((row)=>{
          if(result.OrderID === row.OrderID){
            //order already in thr row.. just update it.

            if(this.OSService.manuInitialLoadComplete && row.Status !== result.OrderStatus)
            this.toastr.warning(`${row.OrderName} has been changed`,"Orders updated");

            row.Status = result.OrderStatus;
            row.ChangeStatusText = this.GetChangeStatusText(SharedFunctions.GetOrderStatusString((SharedFunctions.GetOrderStatusNumber(row.Status))));
            existingOrders.push(row.OrderID);
          }});
        
        if(existingOrders.indexOf(result.OrderID) === -1){
          this.rows.push(result);

        if(this.OSService.transInitialLoadComplete)
          this.toastr.success(`${result.OrderName} has been added`,"Orders Added");
      };
      
        console.log(this.rows.length);
        this.loading = false;
        this.rows =[...this.rows]
        
      }
    });
    console.log(`Length is  : ${this.rows.length}`);
    this.OSService.getAllWarrantyOrders();
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
