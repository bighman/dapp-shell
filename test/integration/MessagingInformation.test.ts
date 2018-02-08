import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { MessagingInformationService } from '../../src/api/services/MessagingInformationService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessagingInformation } from '../../src/api/models/MessagingInformation';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

import { MessagingInformationCreateRequest } from '../../src/api/requests/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../../src/api/requests/MessagingInformationUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';

describe('MessagingInformation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messagingInformationService: MessagingInformationService;
    let listingItemTemplateService: ListingItemTemplateService;
    let profileService: ProfileService;

    let createdId;
    let createdListingItemTemplate;
    let defaultProfile;


    const testData = {
        listing_item_template_id: null,
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey1'
    } as MessagingInformationCreateRequest;

    const testDataUpdated = {
        listing_item_template_id: null,
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey2'
    } as MessagingInformationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.MessagingInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();


        defaultProfile = await profileService.getDefault();
        createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash'
            },
            withRelated: true
        } as TestDataCreateRequest);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await messagingInformationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new messaging information', async () => {
        testData.listing_item_template_id = createdListingItemTemplate.Id;
        const messagingInformationModel: MessagingInformation = await messagingInformationService.create(testData);
        createdId = messagingInformationModel.Id;

        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should throw ValidationException because we want to create a empty messaging information', async () => {
        expect.assertions(1);
        await messagingInformationService.create({} as MessagingInformationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list messaging informations with our new create one', async () => {
        const messagingInformationCollection = await messagingInformationService.findAll();
        const messagingInformation = messagingInformationCollection.toJSON();
        expect(messagingInformation.length).toBe(1);

        const result = messagingInformation[0];

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should return one messaging information', async () => {
        const messagingInformationModel: MessagingInformation = await messagingInformationService.findOne(createdId);
        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await messagingInformationService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the messaging information', async () => {
        testDataUpdated.listing_item_template_id = createdListingItemTemplate.Id;
        const messagingInformationModel: MessagingInformation = await messagingInformationService.update(createdId, testDataUpdated);
        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.publicKey).toBe(testDataUpdated.publicKey);
    });

    test('Should delete the messaging information', async () => {
        expect.assertions(2);
        await messagingInformationService.destroy(createdId);
        await messagingInformationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(createdListingItemTemplate.id);
        await listingItemTemplateService.findOne(createdListingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemTemplate.id))
        );
    });

});
