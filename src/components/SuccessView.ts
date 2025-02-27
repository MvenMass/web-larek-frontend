import { View } from './base/View';
import { ensureElement } from '../utils/utils';
import { ISuccess, ISuccessActions } from '../types';

// Класс Success для отображения успешного выполнения операции
export class Success extends View<ISuccess> {
    protected _closeButton: HTMLElement;
    protected _description: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._closeButton = ensureElement<HTMLElement>(
            '.order-success__close',
            this.container
        );
        this._description = ensureElement<HTMLElement>(
            '.order-success__description',
            this.container
        );

        this.setupEventHandlers(actions);
    }

    private setupEventHandlers(actions: ISuccessActions): void {
        if (actions?.onClick && this._closeButton) {
            this._closeButton.addEventListener('click', actions.onClick);
        }
    }

    set transactionDetails(value: string) {
        this.setTextContent(this._description, `Списано ${value} синапсов`);
    }
}