import { Api } from './base/api';
import {
    IOrderResult,
    IProduct,
    IOrder,
    ApiListResponse,
    IWebLarekAPI,
} from '../types';

export class WebLarekAPI extends Api implements IWebLarekAPI {
    readonly cdnUrl: string;

    constructor(cdnUrl: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdnUrl = cdnUrl;
    }

    async fetchProductList(): Promise<IProduct[]> {
        const response = await this.get('/product');
        return (response as ApiListResponse<IProduct>).items.map(item => ({
            ...item,
            image: `${this.cdnUrl}${item.image}`,
        }));
    }

    async fetchProductDetails(id: string): Promise<IProduct> {
        const product = await this.get(`/product/${id}`);
        return {
            ...(product as IProduct),
            image: `${this.cdnUrl}${(product as IProduct).image}`,
        };
    }

    async submitOrder(order: IOrder): Promise<IOrderResult> {
        const result = await this.post('/order', order);
        return result as IOrderResult;
    }
}