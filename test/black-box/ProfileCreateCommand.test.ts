import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ProfileCreateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PROFILE_ROOT.commandName;
    const subCommand = Commands.PROFILE_ADD.commandName;
    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should create a new profile by RPC', async () => {
        const profileName = 'DEFAULT-TEST-PROFILE';
        const profileAddress = 'DEFAULT-TEST-ADDRESS';
        const res = await rpc(method, [subCommand, profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(profileName);
        expect(result.address).toBe(profileAddress);
        // check default shopping cart
        expect(result.ShoppingCarts).toHaveLength(1);
        expect(result.ShoppingCarts[0].name).toBe('DEFAULT');
    });

    test('Should fail because we want to create an empty profile', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
