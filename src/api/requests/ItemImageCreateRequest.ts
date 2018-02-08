import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ItemImageDataCreateRequest } from './ItemImageDataCreateRequest';

// tslint:disable:variable-name
export class ItemImageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public data: any;

}
// tslint:enable:variable-name
