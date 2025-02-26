import { Model } from './base/Model';
import {
    IProduct,
    IOrder,
    IOrderResult,
    ISendForm, 
    IAppState,
    FormErrors,
    IContactForm,
} from '../types'; 

export type CatalogChangeEvent = {
    catalog: IProduct[];
};

export class AppState extends Model<IAppState> {
    catalog: IProduct[];
    basket: IProduct[] = [];
    order: IOrder = {
        payment: 'online',
        address: '',
        email: '',
        phone: '',
        total: 0,
        items: [],
    };
    preview: string | null;
    formErrors: FormErrors = {};

    clearBasket() {
        this.basket = [];
        this.updateBasket();
    }

    clearOrder() {
        this.order = {
            payment: 'online',
            address: '',
            email: '',
            phone: '',
            total: 0,
            items: [],
        };
    }

    setCatalog(items: IProduct[]) {
        this.catalog = items;
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: IProduct) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    addToBasket(item: IProduct) {
        if (!this.basket.includes(item)) {
            this.basket.push(item);
            this.updateBasket();
        }
    }

    removeFromBasket(item: IProduct) {
        this.basket = this.basket.filter((it) => it !== item);
        this.updateBasket();
    }

    updateBasket() {
        this.emitChanges('counter:changed', this.basket);
        this.emitChanges('basket:changed', this.basket);
    }

    setDeliveryField(field: keyof ISendForm, value: string) {
        this.order[field] = value;
        if (this.validateDelivery()) {
            this.eventBus.emit('delivery:ready', this.order);
        }
    }

    setContactField(field: keyof IContactForm, value: string) {
        this.order[field] = value;
        if (this.validateContact()) {
            this.eventBus.emit('contact:ready', this.order);
        }
    }

    validateDelivery() {
        const errors: FormErrors = {};
        const deliveryRegex = /^[а-яА-ЯёЁa-zA-Z0-9\s\/.,-]{10,}$/;
        if (!this.order.address) {
            errors.address = 'Не указан адрес';
        } else if (!deliveryRegex.test(this.order.address)) {
            errors.address = 'Адрес некорректен';
        }
        this.formErrors = errors;
        this.eventBus.emit('formErrors:change', errors);
        return Object.keys(errors).length === 0;
    }

    validateContact() {
        const errors: FormErrors = {};
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
        // Обновленное регулярное выражение для номера телефона:
        // Разрешает форматы: +79244224242, 89244224242, (924)422-42-42, +7(924)422-42-42
        const phoneRegex = /^(\+?7|8)?[\s\-]?(\(?\d{3}\)?)[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    
        if (!this.order.email) {
            errors.email = 'Не указан email';
        } else if (!emailRegex.test(this.order.email)) {
            errors.email = 'Некорректный email';
        }
    
        let phone = this.order.phone;
    
        // Удаляем все символы, кроме цифр и '+' в начале строки
        if (phone) {
            phone = phone.replace(/[^+\d]/g, '');
        }
    
        // Если номер начинается с '8', преобразуем его в формат '+7'
        if (phone?.startsWith('8')) {
            phone = '+7' + phone.slice(1);
        }
    
        // Проверяем, что после очистки остался только валидный номер
        if (!phone) {
            errors.phone = 'Не указан телефон';
        } else if (!/^\+7\d{10}$/.test(phone)) { // Проверяем, что номер начинается с '+7' и содержит ровно 10 цифр
            errors.phone = 'Некорректный телефон';
        } else if (!phoneRegex.test(this.order.phone)) { // Проверяем исходный формат ввода
            errors.phone = 'Неверный формат телефона';
        } else {
            this.order.phone = phone;
        }
    
        this.formErrors = errors;
        this.eventBus.emit('formErrors:change', errors);
    
        return Object.keys(errors).length === 0;
    }
}