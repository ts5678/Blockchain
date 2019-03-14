import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';

@Component({
  selector: 'configure-item',
  templateUrl: './configure-item.component.html',
  styleUrls: ['./configure-item.component.css']
})
export class ConfigureItemComponent {
  public NeedBattery: boolean = false;
  public OrderNetworkCard: boolean = false;
  public PurchaseBuild: boolean = false;

  public ShowReview: boolean = false;
  
  public ShippingAddress: AddressInfo | null;
  public BillingAddress: AddressInfo | null;
  public CustomerPaymentInfo: PaymentInfo | null;

  public OrderName: string = '';
  private TheHttp: Http | null;

  public OrderWarranty = null;
  public Warranties = [
    { id: 0, name: "None" },
    { id: 2, name: "2 year" },
    { id: 3, name: "3 year" },
    { id: 5, name: "5 year" },
    { id: 10, name: "10 year" }];

  public OrderBattery = null;
  public Batteries = [
    { id: 1, name: "1 battery" },
    { id: 2, name: "2 batteries" },
    { id: 3, name: "3 batteries" },
    { id: 4, name: "4 batteries" }];

  public ExpirationMonth = null;
  public Months = [
    { id: 1, name: "January" },
    { id: 2, name: "February" },
    { id: 3, name: "March" },
    { id: 4, name: "April" },
    { id: 5, name: "May" },
    { id: 6, name: "June" },
    { id: 7, name: "July" },
    { id: 8, name: "August" },
    { id: 9, name: "September" },
    { id: 10, name: "October" },
    { id: 11, name: "November" },
    { id: 12, name: "December" }
  ];

  public ExpirationYear = null;
  public Years = [
    { id: 2019, name: "2019" },
    { id: 2020, name: "2020" },
    { id: 2021, name: "2021" },
    { id: 2022, name: "2022" },
    { id: 2023, name: "2023" },
    { id: 2024, name: "2024" },
    { id: 2025, name: "2025" },
    { id: 2026, name: "2026" },
    { id: 2027, name: "2027" },
    { id: 2028, name: "2028" },
    { id: 2029, name: "2029" },
    { id: 2030, name: "2030" }
  ];


  private localhost: string = 'http://localhost:55608/api/todo';//watch for port # changes (project properties & base_url should fix this)

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    this.localhost = baseUrl + 'api/todo';
    this.TheHttp = http;
    this.ShippingAddress = new AddressInfo();
    this.BillingAddress = new AddressInfo();
    this.CustomerPaymentInfo = new PaymentInfo();

    
    //this.GetList();
  }

  public PurchaseAndBuild() {
    this.PurchaseBuild = true;
  }
  
  public ReviewOrder() {
    this.ShowReview = true;
  }

  public ConfirmOrder() {
    //TODO
  }


  public GetList() {
    if (this.TheHttp == null)
      return;

    this.TheHttp.get(this.localhost).subscribe(result => {

      let jsonArray = result.json();

      for (let i = 0; i < jsonArray.length; i++) {
        let newItem = jsonArray[i];
      }

    }, error => console.error(error));
  }

  public addItem(event: any) {
    //if (this.TheHttp == null)
    //  return;

    //this.Adding = true;

    //let postInfo = { 'name': this.AddedName, 'isComplete': this.AddedComplete };

    //this.TheHttp.post(this.localhost, postInfo).subscribe(result => {

    //  this.GetList();
    //  this.Adding = false
    //}, error => console.error(error));

  }

  public cancelItem() {
    //this.Adding = false;
    //this.AddedName = '';
    //this.AddedComplete = false;
  }
}

export class AddressInfo {
  public SendTo: string;
  public Street: string;
  public City: string;
  public StateProvince: string;
  public Country: string;
  public ZipPostalCode: string;

  constructor() { };
}

export class PaymentInfo {
  public NameOnCard: string;
  public CCNumber: string;
  public ExpirationMonth: string;
  public ExpirationYear: string;
  public SecurityCode: string;
  constructor() {};
}

