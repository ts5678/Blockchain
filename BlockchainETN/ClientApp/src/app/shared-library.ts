//namespace SharedLibrary {
  export class AddressInfo {
    public SendTo: string;
    public Street: string;
    public City: string;
    public StateProvince: string;
    public Country: string;
    public ZipPostalCode: string;

    constructor() { };
  }

  export class PaymentInfo {
    public NameOnCard: string;
    public CCNumber: string;
    public ExpirationMonth: number;
    public ExpirationYear: number;
    public SecurityCode: string;
    constructor() { };
  }

  export class CustomerInfo {
    public Name: string;
    public Email: string;
    public Phone: string;

    constructor() { };
  }

  export class TransactionInfo {
    public Timestamp: Date;
    public TransactionID: string;
    public TransactionType: OrderStatus;
    public TransactionSubmitter: string;

    //constructor() { };
    constructor(aTimestamp: Date, aTransactionID: string, aTransactionType: OrderStatus, aTransactionSubmitter: string) {
      this.Timestamp = aTimestamp;
      this.TransactionID = aTransactionID;
      this.TransactionType = aTransactionType;
      this.TransactionSubmitter = aTransactionSubmitter;
    };
  }

  export class Guid {
    static newGuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  export const enum OrderStatus {
    OrderReceived = "Order Received",
    BeingBuilt = "Being Built",
    PreparingForShipping = "Preparing For Shipping",
    Complete = "Complete"
  }


