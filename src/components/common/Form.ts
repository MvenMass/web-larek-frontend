import { View } from '../base/View';
import { IEvents } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IFormStatus } from '../../types';

export class Form<T> extends View<IFormStatus> {
    protected _submitButton: HTMLButtonElement;
    protected _errorContainer: HTMLElement;

    constructor(protected formContainer: HTMLFormElement, protected eventBus: IEvents) {
        super(formContainer);

        this._submitButton = ensureElement<HTMLButtonElement>(
            'button[type="submit"]',
            this.formContainer
        );
        this._errorContainer = ensureElement<HTMLElement>(
            '.form__errors',
            this.formContainer
        );

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.formContainer.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.name && target.value !== undefined) {
                this.handleInputChange(target.name as keyof T, target.value);
            }
        });

        this.formContainer.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            this.eventBus.emit(`${this.formContainer.name}:submit`);
        });
    }

    private handleInputChange(field: keyof T, value: string): void {
        this.eventBus.emit(`${this.formContainer.name}.${String(field)}:change`, {
            field,
            value,
        });
    }

    set valid(isValid: boolean) {
        if (this._submitButton) {
            this._submitButton.disabled = !isValid;
        }
    }

    set errors(errorMessage: string) {
        if (this._errorContainer) {
            this._errorContainer.textContent = errorMessage || '';
        }
    }

    render(state: Partial<T> & IFormStatus): HTMLFormElement {
        const { valid, errors, ...inputFields } = state;

        // Обновляем состояние формы
        if (valid !== undefined) this.valid = valid;

        // Преобразуем массив ошибок в строку, если это массив
        if (errors !== undefined) {
            if (Array.isArray(errors)) {
                this.errors = errors.join('\n');
            } else {
                this.errors = String(errors);
            }
        }

        Object.assign(this, inputFields);

        return this.formContainer;
    }
}