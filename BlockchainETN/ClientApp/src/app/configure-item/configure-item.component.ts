import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { InfoShareService } from '../infoshare.service';
import { AddressInfo, PaymentInfo, CustomerInfo } from '../shared-library';
import { NgxMaskModule } from 'ngx-mask';

@Component({
  selector: 'configure-item',
  templateUrl: './configure-item.component.html',
  styleUrls: ['./configure-item.component.css']
})
export class ConfigureItemComponent {
  public NeedBattery: boolean = false;
  public OrderNetworkCard: boolean = false;

  public ShippingAddress: AddressInfo | null;
  public BillingAddress: AddressInfo | null;
  public CustomerPaymentInfo: PaymentInfo | null;

  public OrderWarranty = null;
  public OrderBattery = null;
  public ExpirationMonth = null;
  public ExpirationYear = null;

  public UseShippingAddress: boolean = false;
  public ShowReview: boolean = false;

  public Price: number = 1000;

  private TheHttp: Http | null;

  public ShowQuickFill: boolean = true;


  public Warranties: { id: number, name: string }[] = [
    { id: 0, name: "None" },
    { id: 2, name: "2 year" },
    { id: 3, name: "3 year" },
    { id: 5, name: "5 year" },
    { id: 10, name: "10 year" }];

  public Batteries: { id: number, name: string }[] = [
    { id: 1, name: "1 battery" },
    { id: 2, name: "2 batteries" },
    { id: 3, name: "3 batteries" },
    { id: 4, name: "4 batteries" }];

  public Months: { id: number, name: string }[] = [
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

  public Years: { id: number, name: string }[] = [
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


  private localhost: string = 'http://localhost:55608/api/';//watch for port # changes (project properties & base_url should fix this)

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string, public infoShareService: InfoShareService) {
    this.localhost = baseUrl + 'api/todo';
    this.TheHttp = http;

    this.ShippingAddress = new AddressInfo();
    this.BillingAddress = new AddressInfo();
    this.CustomerPaymentInfo = new PaymentInfo();

    
    //this.GetList();
  }

  public FinishConfiguration() {
    //this.PurchaseBuild = true;
    let asdf = 1 + 2;
  }

  public FillPayment() {
    this.CustomerPaymentInfo.NameOnCard = "Robert Buyer";
    this.CustomerPaymentInfo.CCNumber = "4422676780104242";
    this.CustomerPaymentInfo.ExpirationMonth = this.Months.find(x => x.id == 3).id;
    this.CustomerPaymentInfo.ExpirationYear = this.Years.find(x => x.id == 2024).id;
    this.CustomerPaymentInfo.SecurityCode = "555";
  }

  public SendTo: string;
  public Street: string;
  public City: string;
  public StateProvince: string;
  public Country: string;
  public ZipPostalCode: string;

  public FillShippingAddress(){
    let one = new AddressInfo();
    one.SendTo ="Joe B.";
    one.Street = "8468 East University Street";
    one.City = "Scotch Plains";
    one.StateProvince = "NJ";
    one.Country = "USA";
    one.ZipPostalCode = "07076";

    let two = new AddressInfo();
    two.SendTo = "Fred D.";
    two.Street = "8016 Gulf St.";
    two.City = "North Augusta";
    two.StateProvince = "SC";
    two.Country = "USA";
    two.ZipPostalCode = "29841";

    let three = new AddressInfo();
    three.SendTo = "Kim Z.";
    three.Street = "894 NW.Myrtle Road";
    three.City = "Anchorage";
    three.StateProvince = "AK";
    three.Country = "USA";
    three.ZipPostalCode = "99504";

    let four = new AddressInfo();
    four.SendTo = "Mike L.";
    four.Street = "94 Marvon Avenue";
    four.City = "Pittsburgh";
    four.StateProvince = "PA";
    four.Country = "USA";
    four.ZipPostalCode = "99504";

    let five = new AddressInfo();
    five.SendTo = "Spot the Talking Dog";
    five.Street = "777 Goodluck Lane";
    five.City = "New City";
    five.StateProvince = "NY";
    five.Country = "USA";
    five.ZipPostalCode = "10956";

    let six = new AddressInfo();
    six.SendTo = "Mike L.";
    six.Street = "910 Taylor Dr.";
    six.City = "Bowling Green";
    six.StateProvince = "KY";
    six.Country = "USA";
    six.ZipPostalCode = "42101";

    let FakeAddresses: Array<AddressInfo> = [one, two, three, four, five, six];

    let rand1 = this.getRandomInt(0, 5);
    let rand2 = this.getRandomInt(0, 5);
    let rand11 = this.getRandomInt(0, 5);
    let rand21 = this.getRandomInt(0, 5);
    let rand111 = this.getRandomInt(0, 5);
    let rand211 = this.getRandomInt(0, 5);
    let rand1111 = this.getRandomInt(0, 5);
    let rand11112 = this.getRandomInt(0, 5);
    let rand12 = this.getRandomInt(0, 5);
    let rand22 = this.getRandomInt(0, 5);
    let rand222 = this.getRandomInt(0, 5);
    let rand2222 = this.getRandomInt(0, 5);

    this.BillingAddress = FakeAddresses[rand1];
    this.ShippingAddress = FakeAddresses[rand2];
  
  }

  private getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  public FinishPayment() {
    //this.PurchaseBuild = true;
    let asdf = 1 + 2;
  }

  public ChangeShippingAddress(e) {
    if (this.UseShippingAddress) {
      this.BillingAddress.SendTo = this.ShippingAddress.SendTo;
      this.BillingAddress.Street = this.ShippingAddress.Street;
      this.BillingAddress.City = this.ShippingAddress.City;
      this.BillingAddress.StateProvince = this.ShippingAddress.StateProvince;
      this.BillingAddress.ZipPostalCode = this.ShippingAddress.ZipPostalCode;
      this.BillingAddress.Country = this.ShippingAddress.Country;
    }
    else {
      this.BillingAddress.SendTo = "";
      this.BillingAddress.Street = "";
      this.BillingAddress.City = "";
      this.BillingAddress.StateProvince = "";
      this.BillingAddress.ZipPostalCode = "";
      this.BillingAddress.Country = "";
    }
  }

  public onSendToBlur() {
    if (this.UseShippingAddress)
      this.BillingAddress.SendTo = this.ShippingAddress.SendTo;
  }

  public onStreetBlur() {
    if (this.UseShippingAddress)
      this.BillingAddress.Street = this.ShippingAddress.Street;
  }

  public onCityBlur() {
    if (this.UseShippingAddress)
      this.BillingAddress.City = this.ShippingAddress.City;
  }

  public onStateBlur() {
    if (this.UseShippingAddress)
      this.BillingAddress.StateProvince = this.ShippingAddress.StateProvince;
  }

  public onZipBlur() {
    if (this.UseShippingAddress)
      this.BillingAddress.ZipPostalCode = this.ShippingAddress.ZipPostalCode;
  }

  public onCountryBlur() {
    if (this.UseShippingAddress)
      this.BillingAddress.Country = this.ShippingAddress.Country;
  }

  
  
  public ReviewOrder() {
    this.ShowReview = true;
  }

  public ConfirmOrder() {
    //call datacontroller
  }

}



