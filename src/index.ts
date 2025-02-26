import './scss/styles.scss';
import { WebLarekAPI } from './components/WebLarekAPI';
import { API_URL, CDN_URL, PaymentMethods } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { IContactForm, ISendForm, IOrder, IProduct } from './types';
import { Card } from './components/Card';
import { Basket } from './components/Basket';
import { DeliveryForm, ContactForm } from './components/DeliveryForm';
import { Success } from './components/SuccessView';
import { IOrderResult } from './types';
import { EventConstants } from './event-constants';
import { EventTypes } from './events.enum';

// Создание объектов для управления событиями и API
const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Шаблоны верстки элементов страницы
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const deliveryTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Глобальные компоненты приложения
const appData = new AppState({}, events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const delivery = new DeliveryForm(cloneTemplate(deliveryTemplate), events, {
    onClick: (ev: Event) => events.emit(EventConstants[EventTypes.PaymentToggle], ev.target as HTMLElement),
});
const contact = new ContactForm(cloneTemplate(contactTemplate), events);

/// Инициализация основных событий ///
// Обновление каталога товаров
events.on<CatalogChangeEvent>(EventConstants[EventTypes.ItemsChanged], () => {
    page.catalog = appData.catalog.map((item) => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit(EventConstants[EventTypes.CardSelect], item),
        });
        return card.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category,
        });
    });
});

// Получение списка продуктов при загрузке страницы
api.fetchProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(console.error);

/// Обработка событий карточек товаров ///
// Открытие товара
events.on(EventConstants[EventTypes.CardSelect], (item: IProduct) => {
    appData.setPreview(item);
});

events.on('preview:changed', (item: IProduct) => {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            events.emit(EventConstants[EventTypes.ProductToggle], item);
            card.buttonTitle =
                appData.basket.some((prod) => prod.id === item.id)
                    ? 'Удалить из корзины'
                    : 'Купить';
        },
    });

    modal.render({
        content: card.render({
            title: item.title,
            description: item.description,
            image: item.image,
            price: item.price,
            category: item.category,
            buttonTitle:
                appData.basket.some((prod) => prod.id === item.id)
                    ? 'Удалить из корзины'
                    : 'Купить',
        }),
    });
});

// Переключение/добавление/удаление товара и обновление счетчика
events.on(EventConstants[EventTypes.ProductToggle], (item: IProduct) => {
    if (appData.basket.some((prod) => prod.id === item.id)) {
        events.emit(EventConstants[EventTypes.ProductDelete], item);
    } else {
        events.emit(EventConstants[EventTypes.ProductAdd], item);
    }
});

events.on(EventConstants[EventTypes.ProductAdd], (item: IProduct) => {
    appData.addToBasket(item);
});

events.on(EventConstants[EventTypes.ProductDelete], (item: IProduct) => {
    appData.removeFromBasket(item);
});

events.on('counter:changed', () => {
    page.counter = appData.basket.length;
});

/// Обработка событий корзины ///
// Обновление списка товаров в корзине и общей стоимости
events.on(EventConstants[EventTypes.BasketChanged], (items: IProduct[]) => {
    basket.items = items.map((item, index) => {
        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit(EventConstants[EventTypes.ProductDelete], item),
        });
        return card.render({
            index: (index + 1).toString(),
            title: item.title,
            price: item.price,
        });
    });

    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    basket.totalPrice = total;
    basket.toggleSubmitButton(total === 0);
    appData.order.total = total;
});

// Открытие корзины
events.on('basket:open', () => {
    modal.render({
        content: basket.render({}),
    });
});

/// Обработка событий оформления заказа ///
// Открытие формы доставки
events.on('order:open', () => {
    modal.render({
        content: delivery.render({
            payment: '',
            address: '',
            valid: false,
            errors: [],
        }),
    });
    appData.order.items = appData.basket.map((item) => item.id);
});

// Смена способа оплаты
events.on(EventConstants[EventTypes.PaymentToggle], (target: HTMLElement) => {
    delivery.togglePaymentButtons(target);
    const selectedPayment = delivery.getSelectedPayment();
    appData.order.payment = selectedPayment || '';
});

// Изменение полей доставки
events.on(/^order\..*:change/, ({ field, value }: { field: keyof ISendForm; value: string }) => {
    appData.setDeliveryField(field, value);
});

// Событие заполненности формы доставки
events.on('delivery:ready', () => {
    delivery.valid = true;
});

// Открытие формы контактов
events.on('order:submit', () => {
    modal.render({
        content: contact.render({
            email: '',
            phone: '',
            valid: false,
            errors: [],
        }),
    });
});

// Изменение полей контактов
events.on(/^contacts\..*:change/, ({ field, value }: { field: keyof IContactForm; value: string }) => {
    appData.setContactField(field, value);
});

// Событие заполненности формы контактов
events.on('contact:ready', () => {
    contact.valid = true;
});

// Оформление заказа
events.on('contacts:submit', () => {
    api.submitOrder(appData.order)
        .then((result: IOrderResult) => {
            appData.clearBasket();
            appData.clearOrder();

            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                },
            });
            success.transactionDetails = result.total.toString();

            modal.render({
                content: success.render({}),
            });
        })
        .catch((err) => {
            console.error(err);
        });
});

/// Валидация форм ///
// Изменение состояния валидации форм
events.on('formErrors:change', (errors: Partial<IOrder>) => {
    const { payment, address, email, phone } = errors;

    delivery.valid = !payment && !address;
    contact.valid = !email && !phone;

    delivery.errors = [payment, address].filter((e) => e).join('; ');
    contact.errors = [email, phone].filter((e) => e).join('; ');
});

/// Управление модальным окном ///
// Модальное окно открыто
events.on('modal:open', () => {
    page.locked = true;
});

// Модальное окно закрыто
events.on('modal:close', () => {
    page.locked = false;
});