import { Component, Inject, TemplateRef, ViewEncapsulation, SystemJsNgModuleLoader } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableColumn, ColumnMode } from '@swimlane/ngx-datatable';
import { Dictionary, KeyValuePair } from "../dictionary";
import { OrderInfo, Guid, OrderStatus, SharedFunctions } from '../shared-library';
import { OrderSystemService } from "../services/order-system.service";
import { Web3Service } from '../services/web3.service';
import { Contract } from "web3-eth-contract";
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { PlanningDashboardComponent } from '../planning-dashboard/planning-dashboard.component';
import { ManufacturingDashboardComponent } from '../manufacturing-dashboard/manufacturing-dashboard.component';
import { ServicesDashboardComponent } from '../services-dashboard/services-dashboard.component';
import { forEach } from '@angular/router/src/utils/collection';


@Component({
    selector: 'analytics-dashboard',
    templateUrl: './analytics-dashboard.component.html',
    styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent {
    public loading: boolean = false;

    public sorting = [{
        prop: "SubmissionDate",
        dir: "desc"
    }]

    // Regions of the United States according to the National Geographic Society
    private geoMap = { "WA": "West", "OR": "West", "ID": "West", "MT": "West", "WY": "West", "CO": "West", "UT": "West", "NV": "West", "CA": "West", "AK": "West", "HI": "West",
                     "AZ": "Southwest", "NM": "Southwest", "OK": "Southwest", "TX": "Southwest",
                     "ND": "Midwest", "SD": "Midwest", "NE": "Midwest", "KS": "Midwest", "MN": "Midwest", "IA": "Midwest", "MO": "Midwest", "WI": "Midwest", "IL": "Midwest", "MI": "Midwest", "IN": "Midwest", "OH": "Midwest",
                     "AR": "Southeast", "LA": "Southeast", "MS": "Southeast", "AL": "Southeast", "GA": "Southeast", "FL": "Southeast", "SC": "Southeast", "TN": "Southeast", "NC": "Southeast", "KY": "Southeast", "VA": "Southeast", "WV": "Southeast", "DC": "Southeast", "MD": "Southeast", "DE": "Southeast",
                     "NJ": "Northeast", "PA": "Northeast", "NY": "Northeast", "CT": "Northeast", "RI": "Northeast", "MA": "Northeast", "VT": "Northeast", "NH": "Northeast", "ME": "Northeast"
                    };

    /*public SelectedTimespan = null;
    public Timespans = [
        { id: 86400, name: "24 Hours" },
        { id: 604800, name: "1 Week" },
        { id: 2629743, name: "1 Month" }
    ];*/

    public rows = [];
    public selected = [];

    private orders = 0;
    private transactions = 0;
    private nonCompleteOrders = 0;
    private warrantyOrders = 0;
    private warrantyPrice = 0;
    private orderPrice = 0;

    private billingAddresses;
    private billingAddressRegionData = new Dictionary<string, number>();
    private billingAddressStateData = new Dictionary<string, string>();

    private mailingAddresses;
    private mailingAddressRegionData = new Dictionary<string, number>();
    private mailingAddressStateData = new Dictionary<string, string>();

    private completeStatus: string = 'Order Fulfilled';

    constructor(private web3Service: Web3Service, private OSService: OrderSystemService, private toastr: ToastrService) {
        console.log(this.web3Service.web3);
    }

    // Gets number of orders.
    public getOrderNumber() {
        return this.orders;
    }

    // Gets number of transactions.
    public getTransactionNumber() {
        return this.transactions;
    }

    // Gets average transactions per order.
    public getAverageTransactionsPerOrder() {
        return Math.round((this.getTransactionNumber() / this.getOrderNumber() + 0.00001) * 100) / 100;
    }

    // Gets number of non complete orders.
    public getNonCompleteOrders() {
        return this.nonCompleteOrders;
    }

    // Gets percentage of non complete orders.
    public getPercentageNonCompleteOrders() {
        return Math.round((this.getNonCompleteOrders() / this.getOrderNumber() + 0.00001) * 100 * 100) / 100;
    }

    // Gets number of warranty orders.
    public getWarrantyOrders() {
        return this.warrantyOrders;
    }

    // Gets percentage of warranty orders.
    public getPercentageWarrantyOrders() {
        return Math.round((this.getWarrantyOrders() / this.getOrderNumber() + 0.00001) * 100 * 100) / 100;
    }

    // Gets total price of orders.
    public getOrderPrice() {
        return this.orderPrice;
    }

    // Gets total price of warranty orders.
    public getWarrantyPrice() {
        return this.warrantyPrice;
    }

    // Gets the billing addresses of orders.
    public getBillingAddresses() {
        return this.billingAddresses;
    }

    // Gets the mailing addresses of orders.
    public getMailingAddresses() {
        return this.mailingAddresses;
    }

    // Returns the string of billing address data.
    public getRegionStateDataBilling() {
        return this.setGeoOutputData(this.billingAddressRegionData, this.billingAddressStateData);
    }

    // Returns the string of mailing address data.
    public getRegionStateDataMailing() {
        return this.setGeoOutputData(this.mailingAddressRegionData, this.mailingAddressStateData);
    }

    // Sets the output address data from either billing or mailing
    // addresses based on parameter input.
    public setGeoOutputData(addressRegionData, addressStateData) {
        let thisString: String = '';
        let thisRegionMap = addressRegionData;
        let thisStateMap = addressStateData;
        let length = thisRegionMap.length;
        let regionElement;
        let stateElement;
        let percentage: number;

        for(let i = 0; i < length; i++) {
            regionElement = thisRegionMap.elementAt(i);
            stateElement = thisStateMap.elementAt(i);
            percentage = Math.round((regionElement.value / this.getOrderNumber() + 0.00001) * 100 * 100) / 100;
            thisString = thisString + '<div>' + regionElement.key + ' ' + percentage + '%' + '</div>' + stateElement.value + '<br/>';
        }
        return thisString;
    }

    // Takes in either billing or mailing addresses and formats them such that the number
    // of orders per region is set, and the states with orders per region with number of 
    // orders per state is formatted.
    public formatAddresses(addresses: Dictionary<string, number>, billingOrMailing: string) {
        let region: string;
        let length = addresses.length;
        let element;
        let regionMap = new Dictionary<string, number>();
        let regionStrings = new Dictionary<string, string>();

        // Iterate through all addresses
        for(let i = 0; i < length; i++) {
            element = addresses.elementAt(i);
            let state = element.key;
            region = this.geoMap[element.key];

            // If the region of the current address already has a map
            // value, then add to the total number of orders from that
            // region and add the state and value of the state to the
            // state map. Otherwise, add new map entries.
            if(regionMap.containsKey(region)) {
                let currentRegionQuantity = regionMap.tryGetValue(region);
                let currentString = regionStrings.tryGetValue(region);
                regionMap.remove(x => x.key == region);
                regionStrings.remove(x => x.key == region);
                regionMap.add(region, currentRegionQuantity + element.value);
                regionStrings.add(region, '<div>' + currentString + state + ': ' + element.value + '</div>');
            }
            else {
                regionMap.add(region, element.value);
                regionStrings.add(region, '<div>' + state + ': ' + element.value + '</div>');
            }

            // Sets the output maps depending on input.
            if(billingOrMailing == "billing") {
                this.billingAddressRegionData = regionMap;
                this.billingAddressStateData = regionStrings;
            }
            if(billingOrMailing == "mailing") {
                this.mailingAddressRegionData = regionMap;
                this.mailingAddressStateData = regionStrings;
            }

            console.log("This State from Dashboard: " + element.key);
            console.log("Amount of orders from this State: " + element.value);
        }
    }

    // On initialization, cycle through all orders and transactions, and
    // start updating values on dashboard.
    ngOnInit() {
        console.log(`analytics dashboard initiated.`);
        this.loading = true;

        this.OSService.getAllOrders();
        this.OSService.getAllWarrantyOrders();
        this.OSService.getTransactions();

        this.updateValues();
        this.loading = false;
    }

    public RunSpinner() {
        this.loading = true;

        setTimeout(() => { this.loading = false; }, 3000);
    }

    // Update all values in dashboard from values in order-system.service.ts.
    public async updateValues() {
            if (!this.OSService.OSContract) {
                const delay = new Promise(resolve => setTimeout(resolve, 100));
                await delay;
                return await this.updateValues();
            }
            
            this.orders = this.OSService.getOrderNumber();
            this.transactions = this.OSService.getTransactionNumber();
            this.nonCompleteOrders = this.OSService.getNonCompleteNumber();
            this.warrantyOrders = this.OSService.getWarrantyOrderNumber();
            this.warrantyPrice = this.OSService.getWarrantyPrice();
            this.orderPrice = this.OSService.getOrderPrice();
            this.billingAddresses = this.OSService.getBillingAddresses();
            this.mailingAddresses = this.OSService.getMailingAddresses();
            this.formatAddresses(this.getBillingAddresses(), "billing");
            this.formatAddresses(this.getMailingAddresses(), "mailing");
    }
}
