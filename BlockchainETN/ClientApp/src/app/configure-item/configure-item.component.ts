import { ToastrModule, ToastrService } from 'ngx-toastr';
import { OrderSystemService } from "./../services/order-system.service";
import { Component, Inject, EventEmitter, Output } from "@angular/core";
import { Http, RequestOptions, RequestOptionsArgs } from "@angular/http";
import { InfoShareService } from "../infoshare.service";
import {
  AddressInfo,
  PaymentInfo,
  CustomerInfo,
  Guid,
  RandomNums
} from "../shared-library";
import { NgxMaskModule } from "ngx-mask";
import { Web3Service } from "../services/web3.service";
import { Orders } from "../model/Orders";
import { Router } from '@angular/router';

@Component({
  selector: "configure-item",
  templateUrl: "./configure-item.component.html",
  styleUrls: ["./configure-item.component.css"]
})
export class ConfigureItemComponent {

  @Output() OrderConfirmedEvent: EventEmitter<any> = new EventEmitter();


  public NeedBattery: boolean = false;
  public OrderNetworkCard: boolean = false;
  public OrderWarranty: { id: number; name: string } = null;
  public OrderBattery: { id: number; name: string } = null;

  public ShippingAddress: AddressInfo | null;
  public BillingAddress: AddressInfo | null;
  public CustomerPaymentInfo: PaymentInfo | null;



  public UseShippingAddress: boolean = false;
  public ShowReview: boolean = false;

  public Price: number = 1000;
  public ConfirmationCode: string;
  public EstDateOfArrival: Date;

  public OrderConfirmed: boolean;

  public theJson: string = "";

  private TheHttp: Http | null;

  public Warranties: { id: number; name: string }[] = [
    { id: 0, name: "None" },
    { id: 2, name: "2 year" },
    { id: 3, name: "3 year" },
    { id: 5, name: "5 year" },
    { id: 10, name: "10 year" }
  ];

  public Batteries: { id: number; name: string }[] = [
    { id: 1, name: "1 battery" },
    { id: 2, name: "2 batteries" },
    { id: 3, name: "3 batteries" },
    { id: 4, name: "4 batteries" }
  ];

  public Months: { id: number; name: string }[] = [
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

  public Years: { id: number; name: string }[] = [
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

  private createOrderURL: string;

  constructor(
    http: Http,
    @Inject("BASE_URL") baseUrl: string,
    public infoShareService: InfoShareService,
    private web3service: Web3Service,
    private OSService: OrderSystemService,
    private toastr: ToastrService,
    private router : Router
  ) {
    this.createOrderURL = baseUrl + "api/data/createOrder";
    this.TheHttp = http;
    this.ShippingAddress = new AddressInfo();
    this.BillingAddress = new AddressInfo();
    this.CustomerPaymentInfo = new PaymentInfo();

    this.OrderWarranty = this.Warranties.find(x => x.id == 0);
    this.OrderConfirmed = false;
    console.log(this.web3service.web3);


    //this.GetList();
  }

  ngOnInit() {
  }

  public FillUPS() {
    this.NeedBattery = RandomNums.getRandomInt(0, 9) >= 5 ? true : false;
    if (this.NeedBattery) {
      let bats = RandomNums.getRandomInt(1, 4);
      this.OrderBattery = this.Batteries.find(x => x.id == bats);
    }

    this.OrderNetworkCard = RandomNums.getRandomInt(0, 9) >= 5 ? true : false;

    let warrantys = RandomNums.getRandomInt(0, 10);
    this.OrderWarranty = this.Warranties.find(x => x.id == warrantys);
    //0 2 3 5 10
    while (this.OrderWarranty == null) {
      let warrantys = RandomNums.getRandomInt(0, 10);
      this.OrderWarranty = this.Warranties.find(x => x.id == warrantys);
    }
  }

  public FillPayment() {
    this.CustomerPaymentInfo.NameOnCard = "Robert Buyer";
    this.CustomerPaymentInfo.CCNumber = "4422676780104242";
    this.CustomerPaymentInfo.ExpirationMonth = this.Months.find(x => x.id == 3);
    this.CustomerPaymentInfo.ExpirationYear = this.Years.find(
      x => x.id == 2024
    );
    this.CustomerPaymentInfo.SecurityCode = "555";
  }

  public FillShippingAddress() {
    let one = new AddressInfo();
    one.SendTo = "Joe B.";
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

    let rand1 = RandomNums.getRandomInt(0, 5);
    let rand2 = RandomNums.getRandomInt(0, 5);

    this.BillingAddress = FakeAddresses[rand1];
    this.ShippingAddress = FakeAddresses[rand2];
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
    this.ConfirmationCode = Guid.newGuid();
    this.EstDateOfArrival = new Date();
    this.EstDateOfArrival.setDate(this.EstDateOfArrival.getDate() + 14);

    this.ShowReview = true;
  }

  public ConfirmOrder() {
    //call datacontroller
    let ethJson = {};
    ethJson["ordername"] = this.infoShareService.OrderName;

    //transactionid ??
    ethJson["confirmationcode"] = this.ConfirmationCode;
    ethJson["price"] = this.Price;

    ethJson["shippingaddress"] = this.ShippingAddress.toJsonFriendly();
    ethJson["billingaddress"] = this.BillingAddress.toJsonFriendly();
    ethJson["paymentinfo"] = this.CustomerPaymentInfo.toJsonFriendly();
    ethJson["customer"] = this.infoShareService.Customer.toJsonFriendly();

    ethJson["warranty"] = this.OrderWarranty.id;
    let haswarranty = this.OrderWarranty.id > 0;
    if (this.NeedBattery)
      ethJson["battery"] = this.OrderBattery.id;
    ethJson["networkcard"] = this.OrderNetworkCard;


    ethJson["serial"] = Guid.newGuid();

    this.theJson = JSON.stringify(ethJson);

    this.OSService.createOrder([ethJson['serial'], JSON.stringify(ethJson), this.web3service.accounts[0], haswarranty], {
      from: this.web3service.web3.eth.accounts[0]
    })
      .on("transactionHash", hash => {
        console.log(hash);
        this.toastr.info(`Order Initiated. We will notify you when order gets confirmed.`);
        this.OrderConfirmed = true;

      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(`Confirmation Number ${confirmationNumber}`);
        if(confirmationNumber == 0){
          console.log(`First Confirmation`);
          this.toastr.success(`Order confirmed. You will notified for each step of the order. Redirecting to root...`, 'Confirmation', {
            timeOut: 4000
          });
          this.router.navigateByUrl("/");
                  //   console.log(`receipt hash : ${receipt} . now emitting event`);
        //   console.log(receipt);
        //   let orderData = new Orders();
        //   console.log('CREATE_ORDER' in receipt.events);
        //   if ('events' in receipt) {
        //     console.log('Events in receipt')
        //     // if ('CREATE_ORDER' in receipt.events) {
        //     //   let eventRawData = receipt.events[this.OSService.Events.CREATE_ORDER.name].raw.data;
        //     //   this.OSService.handleCreateEvent(eventRawData, null, receipt);
        //     // } else if (this.OSService.Events.ORDER_DETAILS.name in receipt.events) {
        //     //   let eventRawData = receipt.events[this.OSService.Events.CREATE_ORDER.name].raw.data;
        //     //   this.OSService.handleOrderDetailsEvent(eventRawData, null, receipt);
        //     // }
        //   }
        // }
      
      }})
      .on('receipt', (receipt) => {
        
      })
      .on('error', console.error);
    ;
    // this.TheHttp.post(this.createOrderURL, ethJson).subscribe(result => {
    //   var asdf = result;
    //   this.OrderConfirmed = true;
    //   console.log("Order has been confirmed. ! with Receipt and Transaction hash ")
    // }, error => console.error(error));

    //http.post(this._creatPOUrl, product, options)
  }
}
