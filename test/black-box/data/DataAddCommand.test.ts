import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('DataAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.DATA_ROOT.commandName;
    const subCommand =  Commands.DATA_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const modelName = 'profile';
    const testProfileData = {
        name: 'test-profile',
        address: 'test-address'
    };

    test('Should create test data for profile', async () => {
        const res = await rpc(method, [subCommand, modelName, JSON.stringify(testProfileData)]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testProfileData.name);
        expect(result.address).toBe(testProfileData.address);
    });


});
