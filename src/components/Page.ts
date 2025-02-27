import { View } from './base/View';
import { IEvents } from '../types';
import { ensureElement } from '../utils/utils';
import { IPage } from '../types';

export class Page extends View<IPage> {
    protected _basketCounter: HTMLElement;
    protected _productCatalog: HTMLElement;
    protected _pageWrapper: HTMLElement;
    protected _headerBasket: HTMLElement;

    constructor(container: HTMLElement, protected eventHandlers: IEvents) {
        super(container);

        this._basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
        this._productCatalog = ensureElement<HTMLElement>('.gallery');
        this._pageWrapper = ensureElement<HTMLElement>('.page__wrapper');
        this._headerBasket = ensureElement<HTMLElement>('.header__basket');

        if (this._headerBasket) {
            this._headerBasket.addEventListener('click', () => {
                this.eventHandlers.emit('basket:open');
            });
        }
    }


    set counter(value: number) {
        const counterValue = value > 0 ? String(value) : '0';
        this.setTextContent(this._basketCounter, counterValue);
    }

    set catalog(items: HTMLElement[]) {
        if (items.length > 0) {
            this._productCatalog.innerHTML = '';
            items.forEach(item => this._productCatalog.appendChild(item));
        } else {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Товары отсутствуют';
            this._productCatalog.innerHTML = '';
            this._productCatalog.appendChild(emptyMessage);
        }
    }

    set locked(isLocked: boolean) {
        if (this._pageWrapper) {
            if (isLocked) {
                this._pageWrapper.classList.add('page__wrapper_locked');
            } else {
                this._pageWrapper.classList.remove('page__wrapper_locked');
            }
        }
    }
}