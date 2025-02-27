import { View } from './base/View';
import { createElement, ensureElement } from '../utils/utils';
import { IBasketView } from '../types';
import { EventEmitter } from './base/events';

export class Basket extends View<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);
        this.initializeElements();
        this.items = [];
        this.toggleSubmitButton(true);
    }

    private initializeElements(): void {
        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = ensureElement<HTMLElement>('.basket__price', this.container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);
        if (this._button) {
            this._button.addEventListener('click', () => {
                this.events.emit('order:open');
            });
        }
    }

    toggleSubmitButton(isDisabled: boolean): void {
        if (this._button) {
            this._button.disabled = isDisabled;
        }
    }

    set items(items: HTMLElement[]) {
        if (items.length > 0) {
            this._list.innerHTML = '';
            items.forEach(item => this._list.appendChild(item));
        } else {
            const emptyMessage = createElement('p', { textContent: 'Корзина пуста' });
            this._list.innerHTML = '';
            this._list.appendChild(emptyMessage);
        }
    }

    set totalPrice(total: number) {
        this.setTextContent(this._total, `${total} синапсов`);
    }
}