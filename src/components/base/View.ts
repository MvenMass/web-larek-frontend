/**
 * Базовый компонент
 */
export abstract class View<T> {
    protected constructor(protected readonly container: HTMLElement) {}

    // Метод для управления классами CSS
    toggleCssClass(element: HTMLElement, className: string, force?: boolean) {
        if (force !== undefined) {
            if (force) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        } else {
            element.classList.toggle(className);
        }
    }

    // Установка текстового содержимого элемента
    protected setTextContent(element: HTMLElement, value: unknown) {
        if (element) {
            element.textContent = `${value}`;
        }
    }

    // Изменение состояния блокировки элемента
    setElementDisabled(element: HTMLElement, state: boolean) {
        if (element) {
            if (state) {
                element.setAttribute('disabled', '');
            } else {
                element.removeAttribute('disabled');
            }
        }
    }

    // Скрытие элемента
    protected hideElement(element: HTMLElement) {
        element.style.display = 'none';
    }

    // Показ элемента
    protected showElement(element: HTMLElement) {
        if (element.style.display === 'none') {
            element.style.display = '';
        }
    }

    // Настройка изображения
    protected setElementImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            } else {
                element.alt = 'No description';
            }
        }
    }

    // Возвращает корневой DOM-элемент после применения данных
    render(data?: Partial<T>): HTMLElement {
        if (data) {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    (this as any)[key] = data[key];
                }
            }
        }
        return this.container;
    }
}