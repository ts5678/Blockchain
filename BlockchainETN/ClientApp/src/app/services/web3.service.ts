import { Injectable, NgModule } from '@angular/core';
import contract from 'truffle-contract';
import { Subject } from 'rxjs';

const Web3 = require('web3');


declare let window: any;

@Injectable()
export class Web3Service {
  public web3: any;
  public accounts: string[];
  public ready = false;

  public accountsObservable = new Subject<string[]>();

  constructor() {
    this.bootstrapWeb3();
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public async bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)

    if (!this.web3) {
      console.log(`Redefining Web3`);

      if (typeof window.web3 !== 'undefined') {
        console.log(`In second condition`);
        window.ethereum.enable();

        // Use Mist/MetaMask's provider
        this.web3 = new Web3(window.web3.currentProvider);
      } else {
        console.log('No web3? You should consider trying MetaMask!');

        // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
        Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545'));

      }
    }

    setInterval(() => this.refreshAccounts(), 100);
  }

  public async artifactsToContract(artifacts) {
    debugger;
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;

  }

  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
