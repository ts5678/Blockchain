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

  public ShippingAddress: AddressInfo | null;
  public BillingAddress: AddressInfo | null;
  public CustomerPaymentInfo: PaymentInfo | null;

  public AddedName: string = '';
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


  private localhost: string = 'http://localhost:55608/api/todo';//watch for port # changes (project properties & base_url should fix this)

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    this.localhost = baseUrl + 'api/todo';
    this.TheHttp = http;

    //this.GetList();
  }

  public PurchaseAndBuild() {
    this.PurchaseBuild = true;
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
  constructor(
    public SendTo: string,
    public Street: string,
    public City: string,
    public StateProvince: string,
    public Country: string,
    public ZipPostalCode: string) { };
}

export class PaymentInfo {
  constructor(
    public NameOnCard: string,
    public CCNumber: string,
    public Expiration: string,
    public SecurityCode: string) { };
}

