import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { TestDataGenerateRequest } from '../../requests/TestDataGenerateRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {CreatableModel} from '../../enums/CreatableModel';

export class DataGenerateCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService
    ) {
        super(Commands.DATA_GENERATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: CreatableModel, model to generate
     *  [1]: amount
     *  [2]: withRelated, return full objects or just id's
     *  [3...]: generateParams
     *
     * @param {RpcRequest} data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);
        const generateParams = data.params.length > 3 ? _.slice(data.params, 3) : [];

        return await this.testDataService.generate({
            model: data.params[0],
            amount: data.params[1],
            withRelated: data.params[2],
            generateParams
        } as TestDataGenerateRequest);
    }

    public help(): string {
        return this.getName() + ' <model> [<amount> [<withRelated>]]\n'
            + '    <model>                 - [TODO] ENUM{} - [TODO]\n'
            + '    <amount>                - [optional] Numeric - [TODO]\n'
            + '    <withRelated>           - [optional] Boolean - [TODO]';
    }

    public description(): string {
        return 'Generates data to the database.';
    }
}
