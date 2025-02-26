import { Form } from './common/Form';
import { ISendForm, IContactForm, IActions } from '../types';
import { IEvents } from '../types';
import { ensureElement } from '../utils/utils';

export class DeliveryForm extends Form<ISendForm> {
    protected _cardButton: HTMLButtonElement;
    protected _cashButton: HTMLButtonElement;
    protected _selectedPayment: string = '';

    constructor(container: HTMLFormElement, events: IEvents, actions?: IActions) {
        super(container, events);

        // Инициализация кнопок оплаты
        this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
        this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);

        // Установка начального состояния для кнопки "card"
        this._cardButton.classList.add('button_alt-active');

        // Добавление обработчиков событий
        if (actions?.onClick) {
            this._cardButton.addEventListener('click', () => this.togglePaymentButtons(this._cardButton));
            this._cashButton.addEventListener('click', () => this.togglePaymentButtons(this._cashButton));
        }
    }

    // Метод для переключения состояния кнопок оплаты
    togglePaymentButtons(target: HTMLElement): void {
        if (target === this._cardButton) {
            this._cardButton.classList.add('button_alt-active');
            this._cashButton.classList.remove('button_alt-active');
            this._selectedPayment = 'card';
        } else if (target === this._cashButton) {
            this._cardButton.classList.remove('button_alt-active');
            this._cashButton.classList.add('button_alt-active');
            this._selectedPayment = 'cash';
        }
    }

    // Метод для получения выбранного способа оплаты
    getSelectedPayment(): string {
        return this._selectedPayment;
    }

    // Установка адреса доставки
    set address(value: string) {
        const input = this.container.querySelector<HTMLInputElement>('[name="address"]');
        if (input) {
            input.value = value;
        }
    }
}

export class ContactForm extends Form<IContactForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    // Установка номера телефона
    set phone(value: string) {
        const input = this.container.querySelector<HTMLInputElement>('[name="phone"]');
        if (input) {
            input.value = value;
        }
    }

    // Установка email
    set email(value: string) {
        const input = this.container.querySelector<HTMLInputElement>('[name="email"]');
        if (input) {
            input.value = value;
        }
    }
}