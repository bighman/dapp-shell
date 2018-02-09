import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('EscrowUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ESCROW_ROOT.commandName;
    const subCommand = Commands.ESCROW_UPDATE.commandName;

    let profileId;
    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 100,
                    seller: 100
                }
            },
            itemPrice: {
                currency: Currency.BITCOIN,
                basePrice: 0.0001,
                shippingPrice: {
                    domestic: 0.123,
                    international: 1.234
                },
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: 'This is temp address.'
                }
            }
        }
    };

    const testData = {
        type: EscrowType.NOP,
        ratio: {
            buyer: 1000,
            seller: 1000
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;
    });

    test('Should update Escrow by RPC', async () => {
        // set profile id
        testDataListingItemTemplate.profile_id = profileId;

        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        const addListingItemTempResult = addListingItemTempRes;
        const createdTemplateId = addListingItemTempResult.id;
        const paymentInformationId = addListingItemTempResult.PaymentInformation.id;

        const updateDataRes: any = await rpc(method, [subCommand, createdTemplateId, testData.type, testData.ratio.buyer, testData.ratio.seller]);
        updateDataRes.expectJson();
        updateDataRes.expectStatusCode(200);
        const result: any = updateDataRes.getBody()['result'];
        expect(result.paymentInformationId).toBe(paymentInformationId);
        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });
});
