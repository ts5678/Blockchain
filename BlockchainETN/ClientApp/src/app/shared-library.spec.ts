import { Guid, PaymentInfo } from './shared-library';

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
    let info = new PaymentInfo();
    info.NameOnCard = 'Tim S';
    info.CCNumber = '5555666677778888';

    let jsonOutput = info.toJson();
    console.log(jsonOutput);
    expect(jsonOutput.length).toBeGreaterThan(2);
  });
});
