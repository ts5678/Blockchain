import { Guid, PaymentInfo, CommonObjects } from './shared-library';

describe('shared-library tests', () => {

  beforeEach(() => {

  });

  it('Guid should generate a string greater than 10 in length..', () => {
    let newGuid = Guid.newGuid();
    expect(newGuid.length).toBeGreaterThan(10);
  });

  it('Guid should generate a string 36 length..', () => {
    let newGuid = Guid.newGuid();
    expect(newGuid.length).toEqual(36);
  });

  it('Guid should not generate a string 35 length..', () => {
    let newGuid = Guid.newGuid();
    expect(newGuid.length).not.toEqual(35);
  });


  it('PaymentInfo JSON ..', () => {

    let CustomerPaymentInfo = new PaymentInfo();
    CustomerPaymentInfo.NameOnCard = "Robert Buyer";
    CustomerPaymentInfo.CCNumber = "4422676780104242";
    CustomerPaymentInfo.ExpirationMonth = CommonObjects.Months.find(x => x.id == 3)
    CustomerPaymentInfo.ExpirationYear = CommonObjects.Years.find(x => x.id == 2024);
    CustomerPaymentInfo.SecurityCode = "555";

    let testing = CustomerPaymentInfo.toJson();

    let newobj = PaymentInfo.fromJson(JSON.parse(testing));
    console.log(CustomerPaymentInfo.toJson());
    expect(newobj.CCNumber).toEqual("4422676780104242");
  });
});
