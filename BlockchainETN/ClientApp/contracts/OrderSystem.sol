pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract OrderSystem {

    enum OrderStatusEnum { OrderReceived , BeingBuilt, PreparedForShipping, InTransit, ShippingComplete,ServiceRequested }
    enum ServiceReasonEnum { None, WaterDamage , ElectricalIssue, Damaged, Other, Unknown}

    struct Order {
        string OrderID;
        uint SubmissionDate;
        uint EstimatedReceptionDate;
        OrderStatusEnum OrderStatus;
        string OrderInfo;
        string submitter;
        bool HasWarranty;
        uint ServiceRequestDate;
        ServiceReasonEnum ServiceStatus;
    }

    mapping (string => Order) Orders;
    string[] OrderIds;

    event CreateOrderMsg(string msg, string value);
    event ORDER_DETAILS(string orderID, uint SubDate,uint EstDate, uint orderStatus, string orderInfo, string submitter );
    event GetOrdersMsg(string msg);
    event GetAllOrdersMsg(string msg);
    event ChangeStatus(string msg, uint enu);
    event ChangeServiceStatus(string msg, uint enu);

    function compareStrings (string memory a, string memory b) public pure returns (bool) {
       return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
    //     if (_i == 0) {
    //         return "0";
    //     }
    //     uint j = _i;
    //     uint len;
    //     while (j != 0) {
    //         len++;
    //         j /= 10;
    //     }
    //     bytes memory bstr = new bytes(len);
    //     uint k = len - 1;
    //     while (_i != 0) {
    //         bstr[k--] = byte(uint8(48 + _i % 10));
    //         _i /= 10;
    //     }
    //     return string(bstr);
    // }

    function createOrder(string memory orderid, string memory orderinfo, string memory submitter, bool hasWarranty) public returns (string memory) {
        uint twoWeeksFromNow = now + (86400 * 14);//today plus 14 days

        Order memory existCheck = Orders[orderid];
        if(compareStrings(existCheck.OrderID, ""))
            OrderIds.push(orderid);

        emit CreateOrderMsg("createOrder orderid:", orderid);
        emit CreateOrderMsg("submitter:", submitter);
        emit ORDER_DETAILS(orderid, now, twoWeeksFromNow, uint(OrderStatusEnum.OrderReceived), orderinfo, submitter);

        Orders[orderid] = Order(orderid, now, twoWeeksFromNow, OrderStatusEnum.OrderReceived, orderinfo, submitter,
                                        hasWarranty, 0, ServiceReasonEnum.None);

        return orderid;
    }

    function changeStatus(string memory orderid, uint newstatus) public returns (bool) {

        Order memory existingOrder = Orders[orderid];
        if(compareStrings(existingOrder.OrderID, ""))
            return false;

        emit ORDER_DETAILS(orderid, existingOrder.SubmissionDate, existingOrder.EstimatedReceptionDate,
                                    uint(OrderStatusEnum(newstatus)), existingOrder.OrderInfo, existingOrder.submitter);

        Orders[orderid] = Order(orderid, existingOrder.SubmissionDate, existingOrder.EstimatedReceptionDate,
                                    OrderStatusEnum(newstatus), existingOrder.OrderInfo, existingOrder.submitter,
                                    existingOrder.HasWarranty,existingOrder.ServiceRequestDate, existingOrder.ServiceStatus);

        return true;
    }

    function changeServiceStatus(string memory orderid, uint newstatus) public returns (bool) {

        Order memory existingOrder = Orders[orderid];
        if(compareStrings(existingOrder.OrderID, ""))
            return false;

        emit ChangeServiceStatus(orderid, uint(ServiceReasonEnum(newstatus)));

        Orders[orderid] = Order(orderid, existingOrder.SubmissionDate, existingOrder.EstimatedReceptionDate,
                                    existingOrder.OrderStatus, existingOrder.OrderInfo, existingOrder.submitter,
                                    existingOrder.HasWarranty, now, ServiceReasonEnum(newstatus));

        return true;
    }

    function getNumberOfOrders() public view returns (uint){
        return OrderIds.length;
    }

    function getOrders(uint timeGreaterThan) public view returns (string[] memory,uint[] memory,uint[] memory, uint[] memory,string[] memory){
        Order memory ord;
        string[] memory orderids = new string[](OrderIds.length);
        uint[] memory submissiondates = new uint[](OrderIds.length);
        uint[] memory estimateddates = new uint[](OrderIds.length);
        uint[] memory statuses = new uint[](OrderIds.length);
        string[] memory orderinfos = new string[](OrderIds.length);

        //emit GetOrdersMsg("getOrders");

        for(uint i = 0;i < OrderIds.length; i++)
        {

            ord = Orders[OrderIds[i]];
            if(ord.SubmissionDate > timeGreaterThan){
                orderids[i] = ord.OrderID;
                submissiondates[i] = ord.SubmissionDate;
                estimateddates[i] = ord.EstimatedReceptionDate;
                statuses[i] = uint(ord.OrderStatus);
                orderinfos[i] = ord.OrderInfo;
            }
        }


        return (orderids,submissiondates,estimateddates,statuses,orderinfos);
    }

    function getAllOrders() public view returns (string[] memory,uint[] memory,uint[] memory, uint[] memory,string[] memory, string[] memory){

        //emit GetAllOrdersMsg("getAllOrders");

        Order memory ord;
        string[] memory orderids = new string[](OrderIds.length);
        uint[] memory submissiondates = new uint[](OrderIds.length);
        uint[] memory estimateddates = new uint[](OrderIds.length);
        uint[] memory statuses = new uint[](OrderIds.length);
        string[] memory orderinfos = new string[](OrderIds.length);
        string[] memory submitters = new string[](OrderIds.length);

        for(uint i = 0;i < OrderIds.length; i++)
        {
            ord = Orders[OrderIds[i]];
            orderids[i] = ord.OrderID;
            submissiondates[i] = ord.SubmissionDate;
            estimateddates[i] = ord.EstimatedReceptionDate;
            statuses[i] = uint(ord.OrderStatus);
            orderinfos[i] = ord.OrderInfo;
            submitters[i] = ord.submitter;
        }
        return (orderids,submissiondates,estimateddates,statuses,orderinfos, submitters);
    }

    function getAllWarrantyOrders() public view
            returns (string[] memory,uint[] memory,uint[] memory, uint[] memory,string[] memory, string[] memory,
                uint[] memory){

        //emit GetAllOrdersMsg("getAllOrders");

        Order memory ord;
        string[] memory orderids = new string[](OrderIds.length);
        uint[] memory submissiondates = new uint[](OrderIds.length);
        uint[] memory statuses = new uint[](OrderIds.length);
        string[] memory orderinfos = new string[](OrderIds.length);
        string[] memory submitters = new string[](OrderIds.length);
        uint[] memory servicedates = new uint[](OrderIds.length);
        uint[] memory servicestatuses = new uint[](OrderIds.length);

        for(uint i = 0;i < OrderIds.length; i++)
        {
            ord = Orders[OrderIds[i]];
            if(ord.HasWarranty){
                orderids[i] = ord.OrderID;
                submissiondates[i] = ord.SubmissionDate;
                servicedates[i] = ord.ServiceRequestDate;
                statuses[i] = uint(ord.OrderStatus);
                orderinfos[i] = ord.OrderInfo;
                submitters[i] = ord.submitter;
                servicestatuses[i] = uint(ord.ServiceStatus);
            }
        }
        return (orderids,submissiondates,servicedates,statuses,orderinfos, submitters,servicestatuses);
    }

    function getOrderInfo(string memory orderid) public view returns (string memory, string memory, uint, uint, OrderStatusEnum){

        Order memory theOrd = Orders[orderid];

        return (theOrd.OrderID, theOrd.OrderInfo, theOrd.SubmissionDate, theOrd.EstimatedReceptionDate, theOrd.OrderStatus);

    }
}