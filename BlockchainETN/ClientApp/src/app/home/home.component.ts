import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { InfoShareService } from '../infoshare.service';

import { CustomerInfo } from '../shared-library';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  private TheHttp : Http | null;
  public Customer : CustomerInfo | null;

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string, private infoShareService: InfoShareService) {
    this.TheHttp = http;
    this.Customer = new CustomerInfo();
  }

  public BeginOrder() {
    this.infoShareService.Customer = this.Customer;

    let a = 1 + 1;
  }
}



