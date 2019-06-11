import { ToastrService } from 'ngx-toastr';
import { Web3Service } from './services/web3.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { OrderSystemService } from './services/order-system.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation : ViewEncapsulation.None
})
export class AppComponent {
  title = 'app';

  constructor(private web3Service : Web3Service, private OSService : OrderSystemService, private toastrService :  ToastrService){
 
  }
  

  ngOnInit(){
    console.log(`App Initiated`);
    this.web3Service.bootstrapWeb3()
  }
  
}
