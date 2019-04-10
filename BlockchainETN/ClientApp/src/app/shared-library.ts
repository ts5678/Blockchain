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

export class SharedArrays {
  public static Warranties: { id: number, name: string }[] = [
    { id: 0, name: "None" },
    { id: 2, name: "2 year" },
    { id: 3, name: "3 year" },
    { id: 5, name: "5 year" },
    { id: 10, name: "10 year" }];

  public static Batteries: { id: number, name: string }[] = [
    { id: 1, name: "1 battery" },
    { id: 2, name: "2 batteries" },
    { id: 3, name: "3 batteries" },
    { id: 4, name: "4 batteries" }];

  public static Months: { id: number, name: string }[] = [
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

  public static Years: { id: number, name: string } [] = [
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
}
  export class PaymentInfo {
    public NameOnCard: string;
    public CCNumber: string;
    public ExpirationMonth: { id: number, name: string };
    public ExpirationYear: { id: number, name: string };
    public SecurityCode: string;

    constructor() { };

    public toJson() {

      let newObj = {
        nameoncard: this.NameOnCard,
        ccnumber: this.CCNumber,
        expirationmonth: this.ExpirationMonth ? this.ExpirationMonth.id : "",
        expirationyear: this.ExpirationYear ? this.ExpirationYear.id : "",
        securitycode: this.SecurityCode
      };

      return JSON.stringify(newObj);
    }
    
    public fromJson(json: PaymentInfoJSON) {

      this.NameOnCard = json.nameoncard;
      this.CCNumber = json.ccnumber;
      this.ExpirationMonth = SharedArrays.Months.find(x => x.id == json.expirationmonth);
      this.ExpirationYear = SharedArrays.Years.find(x => x.id == json.expirationyear);
      this.SecurityCode = json.securitycode;
    }

    public static fromJson(json: PaymentInfoJSON) {

      let newObj = new PaymentInfo();

      newObj.NameOnCard = json.nameoncard;
      newObj.CCNumber = json.ccnumber;
      newObj.ExpirationMonth = SharedArrays.Months.find(x => x.id == json.expirationmonth);
      newObj.ExpirationYear = SharedArrays.Years.find(x => x.id == json.expirationyear);
      newObj.SecurityCode = json.securitycode;

      return newObj;
    }
}

  interface PaymentInfoJSON {
    nameoncard: string;
    ccnumber: string;
    expirationmonth: number,
    expirationyear: number,
    securitycode: string;
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

export class RandomNums {
  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}


