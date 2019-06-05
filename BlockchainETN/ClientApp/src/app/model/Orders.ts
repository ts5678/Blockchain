export class Orders{
    public OrderDate : Date ;
    public OrderID :  string;
    public OrderName :  string;
    public OrderEstDate : Date;
    public OrderStatus : string;
    public OrderSubmitter : string
    constructor(){
        this.OrderDate = new Date()
        this.OrderEstDate = new Date()
        this.OrderStatus = "Pending"
    }
    
}