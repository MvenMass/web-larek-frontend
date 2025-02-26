import { View } from '../base/View';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';
import { IModalWindow } from '../../types';

export class Modal extends View<IModalWindow> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        // Инициализация элементов через ensureElement
        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        // Добавление обработчиков событий
        this._closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('mousedown', () => this.close());
        this._content.addEventListener('mousedown', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement | null) {
        if (value) {
            this._content.innerHTML = '';
            this._content.appendChild(value);
        } else {
            this._content.innerHTML = '';
        }
    }

    // Метод для переключения состояния модального окна
    _toggleModal(state: boolean = true) {
        if (state) {
            this.container.classList.add('modal_active');
        } else {
            this.container.classList.remove('modal_active');
        }
    }

    // Обработка нажатия клавиши Escape
    _handleEscape = (evt: KeyboardEvent) => {
        if (evt.key === 'Escape') {
            this.close();
        }
    };

    // Открытие модального окна
    open() {
        this._toggleModal();
        document.addEventListener('keydown', this._handleEscape);
        this.events.emit('modal:open');
    }

    // Закрытие модального окна
    close() {
        this._toggleModal(false);
        document.removeEventListener('keydown', this._handleEscape);
        this.content = null;
        this.events.emit('modal:close');
    }

    // Рендеринг компонента с открытием модального окна
    render(data: IModalWindow): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}