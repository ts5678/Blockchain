import { Web3Service } from './services/web3.service';
import { Component } from '@angular/core';
import { OrderSystemService } from './services/order-system.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private web3Service : Web3Service, private OSService : OrderSystemService){
  }

  ngOnInit(){
  
    this.web3Service.bootstrapWeb3()
  }
  
}
