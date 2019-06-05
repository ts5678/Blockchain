import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { InfoShareService } from '../infoshare.service';

import { CustomerInfo, RandomNums } from '../shared-library';
import { OrderSystemService } from '../services/order-system.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  private TheHttp : Http | null;
  public Customer: CustomerInfo | null;
  public OrderName: string | null;
  public OSContract :  any;

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string, private infoShareService: InfoShareService, private OSService: OrderSystemService) {
    this.TheHttp = http;
    this.Customer = new CustomerInfo();
    this.OSContract = OSService.setContract();
  
  }

  public BeginOrder() {
    this.infoShareService.Customer = this.Customer;
    this.infoShareService.OrderName = this.OrderName;
  }

  public FillCustomer(){

    let one = new CustomerInfo();
    one.Name ="Vandelay Industries";
    one.Email = "sales@vandelay.com";
    one.Phone = "4128556767";

    let two = new CustomerInfo();
    two.Name = "Flash Inc";
    two.Email = "sales@flash.com";
    two.Phone = "4122512369";

    let three = new CustomerInfo();
    three.Name = "Spin Co.";
    three.Email = "sales@spinco.com";
    three.Phone = "4121586357";

    let four = new CustomerInfo();
    four.Name = "Bluth Company";
    four.Email = "sales@bluth.com";
    four.Phone = "4129552491";

    let FakeCustomers: Array<CustomerInfo> = [one, two, three, four];

    let rand1 = RandomNums.getRandomInt(0, 3);

    this.Customer = FakeCustomers[rand1];
  }
}



