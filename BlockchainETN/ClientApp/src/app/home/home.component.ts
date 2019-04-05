import { Component, Inject } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  private TheHttp : Http | null;
  public Customer : CustomerInfo | null;

  constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    this.TheHttp = http;
    this.Customer = new CustomerInfo();
  }
}

export class CustomerInfo {
  public Name: string;
  public Email: string;
  public Phone: string;

  constructor() { };
}

