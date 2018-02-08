import { app } from '../../src/app';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { ListingItem } from '../../src/api/models/ListingItem';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { ProfileService } from '../../src/api/services/ProfileService';

import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { ItemLocationService } from '../../src/api/services/ItemLocationService';
import { LocationMarkerService } from '../../src/api/services/LocationMarkerService';
import { ShippingDestinationService } from '../../src/api/services/ShippingDestinationService';
import { ItemImageService } from '../../src/api/services/ItemImageService';

import { PaymentInformationService } from '../../src/api/services/PaymentInformationService';
import { EscrowService } from '../../src/api/services/EscrowService';
import { EscrowRatioService } from '../../src/api/services/EscrowRatioService';
import { ItemPriceService } from '../../src/api/services/ItemPriceService';
import { ShippingPriceService } from '../../src/api/services/ShippingPriceService';
import { CryptocurrencyAddressService } from '../../src/api/services/CryptocurrencyAddressService';
import { MessagingInformationService } from '../../src/api/services/MessagingInformationService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemObjectService } from '../../src/api/services/ListingItemObjectService';

import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../../src/api/requests/ListingItemTemplateUpdateRequest';
import { ListingItemCreateRequest } from '../../src/api/requests/ListingItemCreateRequest';

import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';

describe('ListingItemTemplate', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemTemplateService: ListingItemTemplateService;
    let itemInformationService: ItemInformationService;
    let itemLocationService: ItemLocationService;
    let locationMarkerService: LocationMarkerService;
    let shippingDestinationService: ShippingDestinationService;
    let itemImageService: ItemImageService;

    let paymentInformationService: PaymentInformationService;
    let escrowService: EscrowService;
    let escrowRatioService: EscrowRatioService;
    let itemPriceService: ItemPriceService;
    let shippingPriceService: ShippingPriceService;
    let cryptocurrencyAddressService: CryptocurrencyAddressService;

    let messagingInformationService: MessagingInformationService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let marketService: MarketService;
    let listingItemObjectService: ListingItemObjectService;

    let createdId;
    let createdItemInformation;
    let createdPaymentInformation;
    let createdMessagingInformation;
    let createdListingItemObjects;
    let defaultProfile;
    let defaultMarket;

    const testData = {
        hash: 'hash1',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                key: 'cat_high_luxyry_items',
                name: 'Luxury Items',
                description: ''
            },
            itemLocation: {
                region: 'South Africa',
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            },
            shippingDestinations: [{
                country: 'United Kingdom',
                shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
            }, {
                country: 'Asia',
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: 'South Africa',
                shippingAvailability: ShippingAvailability.ASK
            }],
            itemImages: [{
                hash: 'imagehash4',
                data: {
                    dataId: null,
                    protocol: ImageDataProtocolType.LOCAL,
                    encoding: 'BASE64',
                    data: ImageProcessing.milkcat
                }
            }, {
                hash: 'imagehash5',
                data: {
                    dataId: null,
                    protocol: ImageDataProtocolType.LOCAL,
                    encoding: 'BASE64',
                    data: ImageProcessing.milkcatTall
                }
            }, {
                hash: 'imagehash6',
                data: {
                    dataId: null,
                    protocol: ImageDataProtocolType.LOCAL,
                    encoding: 'BASE64',
                    data: ImageProcessing.milkcatWide
                }
            }]
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
                    address: '1234'
                }
            }
        },
        messagingInformation: [{
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1'
        }, {
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey2'
        }],
        listingItemObjects: [{
            type: ListingItemObjectType.CHECKBOX,
            description: 'Test Description',
            order: 1
        }, {
            type: ListingItemObjectType.TABLE,
            description: 'Test Description',
            order: 2
        }, {
            type: ListingItemObjectType.DROPDOWN,
            description: 'Test Description',
            order: 3
        }]

    } as ListingItemTemplateCreateRequest;

    const testDataUpdated = {
        hash: 'hash2',
        itemInformation: {
            title: 'title UPDATED',
            shortDescription: 'item UPDATED',
            longDescription: 'item UPDATED',
            itemCategory: {
                key: 'cat_apparel_adult',
                name: 'Adult',
                description: ''
            },
            itemLocation: {
                region: 'Finland',
                address: 'asdf UPDATED',
                locationMarker: {
                    markerTitle: 'UPDATED',
                    markerText: 'UPDATED',
                    lat: 33.333,
                    lng: 44.333
                }
            },
            shippingDestinations: [{
                country: 'EU',
                shippingAvailability: ShippingAvailability.SHIPS
            }],
            itemImages: [{
                hash: 'imagehash1 UPDATED',
                data: {
                    dataId: 'dataid1 UPDATED',
                    protocol: ImageDataProtocolType.LOCAL,
                    encoding: 'BASE64',
                    data: ImageProcessing.milkcat
                }
            }]
        },
        paymentInformation: {
            type: PaymentType.FREE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 1,
                    seller: 1
                }
            },
            itemPrice: {
                currency: Currency.PARTICL,
                basePrice: 3.333,
                shippingPrice: {
                    domestic: 1.111,
                    international: 2.222
                },
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: '1234 UPDATED'
                }
            }
        },
        messagingInformation: [{
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1 UPDATED'
        }, {
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey2 UPDATED'
        }],
        listingItemObjects: [{
            type: ListingItemObjectType.CHECKBOX,
            description: 'Test Description',
            order: 1
        }, {
            type: ListingItemObjectType.TABLE,
            description: 'Test Description',
            order: 2
        }, {
            type: ListingItemObjectType.DROPDOWN,
            description: 'Test Description',
            order: 3
        }]

    } as ListingItemTemplateUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.ItemLocationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.LocationMarkerService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.ShippingDestinationService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);

        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);
        escrowRatioService = app.IoC.getNamed<EscrowRatioService>(Types.Service, Targets.Service.EscrowRatioService);
        itemPriceService = app.IoC.getNamed<ItemPriceService>(Types.Service, Targets.Service.ItemPriceService);
        shippingPriceService = app.IoC.getNamed<ShippingPriceService>(Types.Service, Targets.Service.ShippingPriceService);
        cryptocurrencyAddressService = app.IoC.getNamed<CryptocurrencyAddressService>(Types.Service, Targets.Service.CryptocurrencyAddressService);

        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.MessagingInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemObjectService = app.IoC.getNamed<ListingItemObjectService>(Types.Service, Targets.Service.ListingItemObjectService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault();
        defaultMarket = await marketService.getDefault();
    });

    // todo:
    // - need more update tests

    test('Should throw ValidationException because we want to create a empty listing item template', async () => {
        expect.assertions(1);
        await listingItemTemplateService.create({} as ListingItemTemplateCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new listing item template without iteminfo, paymentinfo, messaginginfo and objects', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));
        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;
        // remove the stuff that we dont need in this test
        delete testDataToSave.itemInformation;
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        createdId = listingItemTemplateModel.Id;

        const result = listingItemTemplateModel.toJSON();
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.hash).toBe(testDataToSave.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

    });

    test('Should list listing item templates with our new create one', async () => {
        const listingItemTemplateCollection = await listingItemTemplateService.findAll();
        const listingItemTemplate = listingItemTemplateCollection.toJSON();
        expect(listingItemTemplate).toHaveLength(1);

        const result = listingItemTemplate[0];

        expect(result.hash).toBe(testData.hash);
    });

    test('Should return one simple listing item template', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.findOne(createdId);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

    });

    test('Should update the simple listing item template', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataUpdated);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        // tslint:disable:max-line-length

        expect(result.ItemInformation.title).toBe(testDataUpdated.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testDataUpdated.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testDataUpdated.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testDataUpdated.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testDataUpdated.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testDataUpdated.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testDataUpdated.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(1);
        expect(result.ItemInformation.ItemImages).toHaveLength(1);
        expect(result.ItemInformation.listingItemId).toBe(null);

        expect(result.PaymentInformation.type).toBe(testDataUpdated.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testDataUpdated.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testDataUpdated.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testDataUpdated.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testDataUpdated.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testDataUpdated.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.address);
        expect(result.PaymentInformation.listingItemId).toBe(null);

        expect(result.MessagingInformation[0].protocol).toBe(testDataUpdated.messagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testDataUpdated.messagingInformation[0].publicKey);

        expect(result.ListingItemObjects[0].type).toBe(testDataUpdated.listingItemObjects[0].type);
        expect(result.ListingItemObjects[0].description).toBe(testDataUpdated.listingItemObjects[0].description);
        expect(result.ListingItemObjects[0].order).toBe(testDataUpdated.listingItemObjects[0].order);
        // tslint:enable:max-line-length
    });

    test('Should delete the listing item template', async () => {
        expect.assertions(1);
        // log.debug('createdId:', createdId);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

    test('Should create a new listing item template without paymentinfo, messaginginfo and objects', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));

        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;

        // remove the stuff that we dont need in this test
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const result = listingItemTemplateModel.toJSON();

        createdId = result.id;
        createdItemInformation = result.ItemInformation;
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        expect(result.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(3);
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(listingItemTemplateModel.id);
    });

    test('Should delete the listing item template with item info', async () => {
        expect.assertions(6);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

    });

    test('Should create a new listing item template without messaginginfo and objects', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));

        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;

        // remove the stuff that we dont need in this test
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const result = listingItemTemplateModel.toJSON();

        createdId = result.id;
        createdItemInformation = result.ItemInformation;
        createdPaymentInformation = result.PaymentInformation;

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        expect(result.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(3);
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(createdId);

        expect(result.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        const resItemPrice = result.PaymentInformation.ItemPrice;
        expect(resItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(resItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(resItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(resItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.listingItemId).toBe(null);
        expect(result.MessagingInformation).toHaveLength(0);
        expect(result.ListingItemObjects).toHaveLength(0);
    });

    test('Should delete the listing item template with item info and payment info', async () => {
        expect.assertions(11);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        const escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        const escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // itemPrice
        const itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        const shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        const cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

    });

    test('Should create a new listing item template', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));

        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const result = listingItemTemplateModel.toJSON();

        createdId = result.id;
        createdItemInformation = result.ItemInformation;
        createdPaymentInformation = result.PaymentInformation;
        createdMessagingInformation = result.MessagingInformation;
        createdListingItemObjects = result.ListingItemObjects;

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        expect(result.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(3);
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(createdId);

        expect(result.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        const resItemPrice = result.PaymentInformation.ItemPrice;
        expect(resItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(resItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(resItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(resItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.listingItemId).toBe(null);
        expect(result.PaymentInformation.listingItemTemplateId).toBe(createdId);

        expect(result.MessagingInformation[0].protocol).toBe(testData.messagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testData.messagingInformation[0].publicKey);
        expect(result.MessagingInformation[0].listingItemId).toBe(null);
    });

    test('Should delete the listing item template with item info and payment info and message info', async () => {
        expect.assertions(13);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        const escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        const escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // itemPrice
        const itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        const shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        const cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // messagingInformation
        const messagingInformationId = createdMessagingInformation[0].id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

        // ListingItemObject
        const ListingItemObjectId = createdListingItemObjects[0].id;
        await listingItemObjectService.findOne(ListingItemObjectId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(ListingItemObjectId))
        );

    });

    // - Test listingitems related to listingitemtemplate
    test('Should published listingitems related with any listingitemtemplate', async () => {
        expect.assertions(15);
        // Create listing-item-template
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));

        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const resultTemplate = listingItemTemplateModel.toJSON();
        createdId = resultTemplate.id;
        createdItemInformation = resultTemplate.ItemInformation;
        createdPaymentInformation = resultTemplate.PaymentInformation;
        createdMessagingInformation = resultTemplate.MessagingInformation;
        createdListingItemObjects = resultTemplate.ListingItemObjects;
        // Create listing-item with listing-item-template id
        const testDataListingItem = {
            market_id: defaultMarket.id,
            hash: crypto.SHA256(new Date().getTime().toString()).toString(),
            listing_item_template_id: createdId,
            itemInformation: testDataToSave.ItemInformation,
            paymentInformation: testDataToSave.PaymentInformation,
            messagingInformation: testDataToSave.MessagingInformation,
            listingItemObjects: testDataToSave.ListingItemObjects
        };
        const listingItemModel: ListingItem = await listingItemService.create(testDataListingItem as ListingItemCreateRequest);
        const resultItem = listingItemModel.toJSON();

        // find listing-item-template
        const listingItemTemplateModel2: ListingItemTemplate = await listingItemTemplateService.findOne(createdId);
        const resultTemplate2 = listingItemTemplateModel2.toJSON();
        // check relation between listing-item and listing-item-template
        expect(resultTemplate2.ListingItem[0].id).toBe(resultItem.id);

        // delete listing-item-template
        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // listing-items
        await listingItemService.findOne(resultItem.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(resultItem.id))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        const escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        const escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // itemPrice
        const itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        const shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        const cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // messagingInformation
        const messagingInformationId = createdMessagingInformation[0].id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

        // listingItemObjects
        const listingItemObjectId = createdListingItemObjects[0].id;
        await listingItemObjectService.findOne(listingItemObjectId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectId))
        );
    });

    // update test cases
    test('Should update listing-item-template with item-information + payment-informataion', async () => {
        // create listing-item-template
        const testDataToSave = JSON.parse(JSON.stringify(testData));
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();
        testDataToSave.profile_id = defaultProfile.Id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const resultCreate = listingItemTemplateModel.toJSON();

        createdId = resultCreate.id;
        createdItemInformation = resultCreate.ItemInformation;
        createdPaymentInformation = resultCreate.PaymentInformation;
        createdMessagingInformation = resultCreate.MessagingInformation;
        createdListingItemObjects = resultCreate.ListingItemObjects;

        const testDataToUpdate = JSON.parse(JSON.stringify(testDataUpdated));
        testDataToUpdate.profile_id = defaultProfile.Id;

        // remove the stuff that we dont need in this test
        delete testDataToUpdate.messagingInformation;
        delete testDataToUpdate.listingItemObjects;

        const listingItemTemplateModel2: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataToUpdate);
        const result = listingItemTemplateModel2.toJSON();

        expect(result.hash).toBe(testDataToUpdate.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        // tslint:disable:max-line-length
        // check updated same record
        expect(result.ItemInformation.id).toBe(createdItemInformation.id);

        expect(result.ItemInformation.title).toBe(testDataUpdated.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testDataUpdated.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testDataUpdated.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testDataUpdated.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testDataUpdated.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testDataUpdated.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testDataUpdated.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(1);
        expect(result.ItemInformation.ItemImages).toHaveLength(1);
        expect(result.ItemInformation.listingItemId).toBe(null);

        // check updated same record
        expect(result.PaymentInformation.id).toBe(createdPaymentInformation.id);

        expect(result.PaymentInformation.type).toBe(testDataUpdated.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testDataUpdated.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testDataUpdated.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testDataUpdated.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testDataUpdated.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testDataUpdated.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.address);

        expect(result.MessagingInformation).toHaveLength(0);
        expect(result.ListingItemObjects).toHaveLength(0);
        // tslint:enable:max-line-length
    });

    test('Should update same listing-item-template with payment-informataion', async () => {
        const testDataToUpdate = JSON.parse(JSON.stringify(testDataUpdated));
        testDataToUpdate.market_id = defaultMarket.Id;

        // remove the stuff that we dont need in this test
        delete testDataToUpdate.itemInformation;
        delete testDataToUpdate.messagingInformation;
        delete testDataToUpdate.listingItemObjects;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataToUpdate);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testDataToUpdate.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        // tslint:disable:max-line-length
        expect(result.PaymentInformation.id).toBe(createdPaymentInformation.id);
        expect(result.PaymentInformation.type).toBe(testDataUpdated.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testDataUpdated.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testDataUpdated.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testDataUpdated.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testDataUpdated.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testDataUpdated.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.address);

        expect(result.ItemInformation).toEqual({});
        // check ItemInformation deleted from db
        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        expect(result.MessagingInformation).toHaveLength(0);

        // check message-information deleted from DB
        // messagingInformation
        const messagingInformationId = createdMessagingInformation[0].id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

        // check message-information deleted from DB
        // listing-item obejcts
        const listingItemObjectId = createdListingItemObjects[0].id;
        await listingItemObjectService.findOne(listingItemObjectId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectId))
        );

    });

    test('Should update same listing-item-template with messaging-information + item-information', async () => {
        // create listing-item
        const testDataToUpdate = JSON.parse(JSON.stringify(testDataUpdated));
        testDataToUpdate.market_id = defaultMarket.Id;

        // remove the stuff that we dont need in this test
        delete testDataToUpdate.paymentInformation;
        delete testDataToUpdate.listingItemObjects;


        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataToUpdate);
        const result = listingItemTemplateModel.toJSON();

        createdMessagingInformation = result.MessagingInformation;

        expect(result.hash).toBe(testDataToUpdate.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        // tslint:disable:max-line-length
        expect(result.MessagingInformation).not.toHaveLength(0);
        expect(result.ListingItemObjects).toHaveLength(0);

        // check item-information created again
        expect(createdItemInformation.id).not.toBe(result.ItemInformation.id);

        expect(result.ItemInformation.title).toBe(testDataUpdated.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testDataUpdated.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testDataUpdated.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testDataUpdated.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testDataUpdated.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testDataUpdated.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testDataUpdated.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(1);
        expect(result.ItemInformation.ItemImages).toHaveLength(1);
        expect(result.ItemInformation.listingItemId).toBe(null);

        // check messaging-information created again
        expect(result.MessagingInformation[0].protocol).toBe(testDataUpdated.messagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testDataUpdated.messagingInformation[0].publicKey);
        // tslint:enable:max-line-length
        expect(result.PaymentInformation).toEqual({});
        expect(result.ListingItemObjects).toHaveLength(0);
        // check payment-information deleted from db
        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        const escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        const escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // itemPrice
        const itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        const shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        const cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );
    });

    test('Should update messaging-information, listingItemObjects', async () => {
        // create listing-item
        const testDataToUpdate = JSON.parse(JSON.stringify(testDataUpdated));
        testDataToUpdate.market_id = defaultMarket.Id;

        // remove the stuff that we dont need in this test
        delete testDataToUpdate.paymentInformation;
        delete testDataToUpdate.paymentInformation;
        delete testDataToUpdate.itemInformation;

        testDataToUpdate.messagingInformation[0].id = createdMessagingInformation[0].id;

        testDataToUpdate.messagingInformation[1].id = createdMessagingInformation[1].id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataToUpdate);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testDataToUpdate.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        // tslint:disable:max-line-length
        expect(result.MessagingInformation).not.toHaveLength(0);
        expect(result.ListingItemObjects).not.toHaveLength(0);

        expect(result.MessagingInformation[0].protocol).toBe(testDataUpdated.messagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testDataUpdated.messagingInformation[0].publicKey);
        // tslint:enable:max-line-length
        // check messaging-information created again
        expect(createdListingItemObjects[0].id).not.toBe(result.ListingItemObjects[0].id);

        expect(result.ListingItemObjects[0].protocol).toBe(testDataUpdated.listingItemObjects[0].protocol);
        expect(result.ListingItemObjects[0].publicKey).toBe(testDataUpdated.listingItemObjects[0].publicKey);
        // tslint:enable:max-line-length

         // one messageing should be updated and one new should be created
        expect(result.MessagingInformation).toHaveLength(2);
        expect(result.MessagingInformation[0].id).toBe(createdMessagingInformation[0].id);
        expect(result.MessagingInformation[0].publicKey).toBe(createdMessagingInformation[0].publicKey);

        // check listingItemObject data updated
        expect(result.ListingItemObjects[0].order).toBe(createdListingItemObjects[0].order);
        expect(result.ListingItemObjects[1].order).toBe(createdListingItemObjects[1].order);
        expect(result.ListingItemObjects).toHaveLength(3);

        expect(result.ListingItemObjects[result.ListingItemObjects.length - 1].order)
        .toBe(testDataToUpdate.listingItemObjects[testDataToUpdate.listingItemObjects.length - 1].order);

        expect(result.PaymentInformation).toEqual({});
        expect(result.ItemInformation).toEqual({});

    });

    test('Should update same listing-item-template with messaging-information + item-information and listingItemObjects', async () => {
        // create listing-item
        const testDataToUpdate = JSON.parse(JSON.stringify(testDataUpdated));
        testDataToUpdate.market_id = defaultMarket.Id;

        // remove the stuff that we dont need in this test
        delete testDataToUpdate.paymentInformation;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataToUpdate);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testDataToUpdate.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        // tslint:disable:max-line-length
        expect(result.MessagingInformation).not.toHaveLength(0);
        expect(result.ListingItemObjects).not.toHaveLength(0);

        // check item-information created again
        expect(createdItemInformation.id).not.toBe(result.ItemInformation.id);
        expect(result.ItemInformation.title).toBe(testDataUpdated.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testDataUpdated.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testDataUpdated.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testDataUpdated.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testDataUpdated.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testDataUpdated.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testDataUpdated.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(1);
        expect(result.ItemInformation.ItemImages).toHaveLength(1);
        expect(result.ItemInformation.listingItemId).toBe(null);

        expect(result.MessagingInformation[0].protocol).toBe(testDataUpdated.messagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testDataUpdated.messagingInformation[0].publicKey);
        // tslint:enable:max-line-length
        // check messaging-information created again
        expect(createdListingItemObjects[0].id).not.toBe(result.ListingItemObjects[0].id);

        expect(result.ListingItemObjects[0].protocol).toBe(testDataUpdated.listingItemObjects[0].protocol);
        expect(result.ListingItemObjects[0].publicKey).toBe(testDataUpdated.listingItemObjects[0].publicKey);
        // tslint:enable:max-line-length
        expect(result.PaymentInformation).toEqual({});

        // check payment-information deleted from db
        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        const escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        const escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // itemPrice
        const itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        const shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        const cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        createdItemInformation = result.ItemInformation;
        createdMessagingInformation = result.MessagingInformation;
        createdListingItemObjects = result.ListingItemObjects;

        // delete data
        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // messagingInformation
        const messagingInformationId = createdMessagingInformation[0].id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

        // listingItemObjects
        const listingItemObjectId = createdListingItemObjects[0].id;
        await listingItemObjectService.findOne(listingItemObjectId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectId))
        );
    });

    test('Should update listing-item-template without related models', async () => {
        // create listing-item-template
        const testDataToSave = JSON.parse(JSON.stringify(testData));
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();
        testDataToSave.profile_id = defaultProfile.Id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const resultCreate = listingItemTemplateModel.toJSON();

        createdId = resultCreate.id;
        createdItemInformation = resultCreate.ItemInformation;
        createdPaymentInformation = resultCreate.PaymentInformation;
        createdMessagingInformation = resultCreate.MessagingInformation;
        createdListingItemObjects = resultCreate.ListingItemObjects;
        const testDataToUpdate = JSON.parse(JSON.stringify(testDataUpdated));
        testDataToUpdate.profile_id = defaultProfile.Id;

        // remove the stuff that we dont need in this test
        delete testDataToUpdate.itemInformation;
        delete testDataToUpdate.paymentInformation;
        delete testDataToUpdate.messagingInformation;
        delete testDataToUpdate.listingItemObjects;

        const listingItemTemplateModel2: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataToUpdate);
        const result = listingItemTemplateModel2.toJSON();

        expect(result.hash).toBe(testDataToUpdate.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        expect(result.ItemInformation).toEqual({});
        expect(result.PaymentInformation).toEqual({});
        expect(result.MessagingInformation).toHaveLength(0);
        expect(result.ListingItemObjects).toHaveLength(0);

        // check its deleted from db after update
        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        const escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        const escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // itemPrice
        const itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        const shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        const cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // messagingInformation
        const messagingInformationId = createdMessagingInformation[0].id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

        // messagingInformation
        const listingItemObjectId = createdListingItemObjects[0].id;
        await listingItemObjectService.findOne(listingItemObjectId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectId))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
});
