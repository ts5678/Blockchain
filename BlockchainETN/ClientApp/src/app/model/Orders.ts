import { CustomerInfo } from "../shared-library";

export class Orders {
  public OrderDate: Date;
  public OrderID: string;
  public OrderName: string;
  public OrderEstDate: Date;
  public OrderStatus: string;
  public OrderSubmitter: string;
  public OrderServiceDate: Date;
  public OrderServiceReasonStatus: string;
  public CustomerInfo: CustomerInfo;

  constructor() {
    this.OrderStatus = "Pending";
  }

}
