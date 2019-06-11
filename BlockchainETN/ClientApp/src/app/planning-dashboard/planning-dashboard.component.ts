import { ToastrService } from 'ngx-toastr';
import { Component, Inject, ViewEncapsulation } from "@angular/core";
import { Http, RequestOptions, RequestOptionsArgs } from "@angular/http";
import { NgxLoadingModule } from "ngx-loading";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { TableColumn, ColumnMode } from "@swimlane/ngx-datatable";

import { OrderInfo, Guid, OrderStatus, SharedFunctions } from "../shared-library";
import { DatePipe } from "@angular/common";
import { OrderSystemService } from "../services/order-system.service";
import {Web3Service} from '../services/web3.service'


@Component({
  selector: "planning-dashboard",
  templateUrl: "./planning-dashboard.component.html",
  styleUrls: ["./planning-dashboard.component.css"]
})
export class PlanningDashboardComponent {
  private TheHttp: Http | null;
  public loading: boolean = false;

  public sorting  = [{
    prop: "SubmissionDate",
    dir: "desc"
  }]

  intialOrdersLoaded = false;

  public SelectedTimespan = null;
  public Timespans = [
    { id: 86400, name: "24 Hours" },
    { id: 604800, name: "1 Week" },
    { id: 2629743, name: "1 Month" }
  ];

  public rows = [];
  public rawdataRows = [];

  public selected = []

  public columns = [
    {
      sortable: false,
      canAutoResize: false,
      draggable: false,
      resizable: false,
      headerCheckboxable: true,
      checkboxable: true,
      width: 30
    },
    { name: "Order ID", prop: "OrderID" },
    { name: "Order Name", prop: "OrderName" },
    { name: "Order Created", prop: "SubmissionDate" },
    { name: "Estimated ReceptionDate", prop: "EstimatedDate" },
    { name: "Status", prop: "Status" },
    { name: "Customer Name", prop: "CustomerName" }
  ];

  private getTransactionsURL: string;

  constructor(
    http: Http,
    @Inject("BASE_URL") baseUrl: string,
    private OSService: OrderSystemService,
    private web3service: Web3Service,
    private toastr : ToastrService
  ) {
    this.getTransactionsURL = baseUrl + "api/data/GetTransactions";
    this.TheHttp = http;

    // this.OSService.transSubject.subscribe({next : (result)=> {console.log(result); console.log(`transaction updates`)}});

    this.SelectedTimespan = this.Timespans[0];
    console.log(`constructor for planning dash fired`)


  }


  onRowSelect({selected}){
    console.log(selected);

    this.selected.splice(0,this.selected.length);
    this.selected.push(...selected);
    console.log(this.selected);
  }

  ngOnInit() {
    this.OSService.transInitialLoadComplete = false;
    console.log(`Planning dashboard initiated.`);
    
    this.loading = true;

    this.OSService.transSubject.asObservable().subscribe({
      next: result => {
        console.log(result);
        console.log(`Intial data Loaded = ${this.OSService.transInitialLoadComplete}`)
        this.rows = [...this.rows]
        //search in rows if oreader is already there.
        console.log(this.rows.length);
        let existingOrders = [];
         
  
        this.rows.map((row)=>{
          if(result.OrderID === row.OrderID){
            //order already in thr row.. just update it.

            if(this.OSService.transInitialLoadComplete && row.Status !== result.OrderStatus)
              this.toastr.warning(`${row.OrderName} has been changed`,"Orders updated");

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
        })
        if(this.OSService.transInitialLoadComplete){
          this.toastr.success(`${result.OrderName} has been added`,"Orders Added");
        }
      };
        
        
        this.loading = false;
        this.rows =[...this.rows]
        
      }
    });
    console.log(`Length is  : ${this.rows.length}`);
    this.GetTransactions();
    this.intialOrdersLoaded = true;
  }


  ngOnDestroy(){
    console.log(`Planning Component destoryed.`);
    this.OSService.transInitialLoadComplete = false;
    console.log(`Intial data Loaded = ${this.OSService.transInitialLoadComplete}`)
  }
  

  public SearchTransactions() {
    
    this.GetTransactions();
  }


async changeStatus(){
 // await this.OSService.getAllOrders();
   

  this.selected.map((row)=>{
    let orderId = row.OrderID;
    if(SharedFunctions.GetOrderStatusNumber(row.Status) > 0){
      this.toastr.error(`Order ${row.OrderName} has been already Acknowleged`,'Error');
    }else{
    this.OSService.updateStatus(orderId, SharedFunctions.GetOrderStatusNumber(row.Status)+1, {
      from: this.web3service.web3.eth.accounts[0]
    })
    .on('transactionHash',(transactionHash)=>{
      console.log('transactions');
    })
    .on('receipt', async (receipt)=>{
      console.log(`Update status successful. Got the Receipt.`);
      console.log(receipt);
      if(receipt){
        await this.OSService.getAllOrders();
      }
    })
    .on('error', console.error )
  }
  })
}
  async GetTransactions() {
    await this.OSService.getAllOrders();

    // await this.OSService.getTransactions();
    // this.OSService.transactions.subscribe(result => {
    //   console.log(result);
    //   console.log(`transaction updates`);
    // });
  }


  public GsetTransactions() {
    this.loading = true;

    let ethJson = {};
    ethJson["time"] = this.SelectedTimespan.id;
    this.rows = [];
    console.log(`Sent request for Getting the transactions `);
    this.TheHttp.post(this.getTransactionsURL, ethJson).subscribe(
      result => {
        debugger;
        this.loading = false;
        console.log(`Got the result of search!`);
        console.log(result);
        var ethRows = JSON.parse(result.text());
        this.rawdataRows = ethRows;

        //for (let i = 0; i < ethRows.returnValue1.length; i++)
        //{

        //  let orderinfo = JSON.parse(ethRows.returnValue5[i]);

        //  let ord = new OrderInfo();
        //  ord.OrderID = ethRows.returnValue1[i];

        //  let unixTimestamp = ethRows.returnValue2[i];
        //  let datePipe = new DatePipe('en-US');
        //  ord.SubmissionDate = datePipe.transform(unixTimestamp * 1000, 'MM/dd/yyyy')
        //  //let myFormattedDate = new Date(dateString);

        //  ord.Status = this.GetOrderStatus(ethRows.returnValue4[i]);
        //  ord.CustomerName = orderinfo.customer.name;
        //  ord.OrderName = orderinfo.ordername;

        //  this.rows.push(ord);
        //}

        //this.rows = [...this.rows];
      },
      error => {
        debugger;
        this.loading = false;
        console.error(error);
      }
    );
  }

  public RunSpinner() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
    }, 3000);
  }


}
