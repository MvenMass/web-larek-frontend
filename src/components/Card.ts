import { View } from './base/View';
import { ICard, IActions } from '../types';
import { ensureElement } from '../utils/utils';
import { categoryClasses } from '../utils/constants';

export class Card extends View<ICard> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _category?: HTMLElement;
    protected _index?: HTMLElement;

    constructor(container: HTMLElement, actions?: IActions) {
        super(container);

        // Инициализация элементов
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._image = container.querySelector('.card__image');
        this._button = container.querySelector('.card__button');
        this._description = container.querySelector('.card__text');
        this._category = container.querySelector('.card__category');
        this._index = container.querySelector('.basket__item-index');

        // Добавление обработчика клика
        if (actions?.onClick) {
            const target = this._button || container;
            target.addEventListener('click', actions.onClick);
        }
    }

    disablePurchaseButton(value: number | null) {
        if (!value && this._button) {
            this._button.disabled = true;
        }
    }

    set id(value: string) {
        this.container.setAttribute('data-id', value);
    }

    get id(): string {
        return this.container.getAttribute('data-id') || '';
    }

    set title(value: string) {
        this.setTextContent(this._title, value);
    }

    get title(): string {
        return this._title?.textContent || '';
    }

    set price(value: number | null) {
        const priceText = value !== null ? `${value} синапсов` : 'Бесценно';
        this.setTextContent(this._price, priceText);
        this.disablePurchaseButton(value);
    }

    get price(): number {
        return Number(this._price?.textContent || '');
    }

    set category(value: string) {
        this.setTextContent(this._category, value);
        
        const baseClass = 'card__category';
        const categoryClass = categoryClasses[value] || '';
        
        if (this._category) {
            this._category.className = `${baseClass} ${categoryClass}`.trim();
        }
    }

    get category(): string {
        return this._category?.textContent || '';
    }

    set index(value: string) {
    this.setTextContent(this._index, value);
}

    get index(): string {
        return this._index?.textContent || '';
    }

    set image(value: string) {
        if (this._image) {
            this._image.src = value;
            this._image.alt = this.title || 'Нет заголовка';
        }
    }

    set description(value: string) {
        this.setTextContent(this._description, value);
    }

    set buttonTitle(value: string) {
        this.setTextContent(this._button, value);
    }
}