import { SelectorCollection, SelectorElement } from '../types';

export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function isSelector(x: any): x is string {
    return typeof x === "string" && x.length > 1;
}

export function isEmpty(value: any): boolean {
    return [null, undefined].includes(value);
}

export function ensureAllElements<T extends HTMLElement>(
    selector: SelectorCollection<T>,
    context: HTMLElement = document.body as HTMLElement
): T[] {
    if (typeof selector === 'string') {
        return Array.from(context.querySelectorAll(selector)) as T[];
    }
    if (selector instanceof NodeList) {
        return Array.from(selector) as T[];
    }
    if (Array.isArray(selector)) {
        return selector;
    }
    throw new Error('Invalid selector type');
}

export function ensureElement<T extends HTMLElement>(
    selector: SelectorElement<T>,
    context?: HTMLElement
): T {
    if (typeof selector === 'string') {
        const elements = ensureAllElements<T>(selector, context);
        if (elements.length > 1) console.warn(`Multiple elements found for selector: ${selector}`);
        if (elements.length === 0) throw new Error(`Element not found: ${selector}`);
        return elements[0] as T;
    }
    return selector as T;
}

export function cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T {
    const template = ensureElement<HTMLTemplateElement>(query);
    const firstChild = template.content.firstElementChild;
    return firstChild ? firstChild.cloneNode(true) as T : (() => { throw new Error('Template has no elements'); })();
}

export function bem(block: string, element?: string, modifier?: string): { name: string, class: string } {
    const parts = [block];
    element && parts.push(`__${element}`);
    modifier && parts.push(`_${modifier}`);
    return { name: parts.join(''), class: `.${parts.join('')}` };
}

export function setElementData(el: HTMLElement, data: Record<string, unknown>) {
    for (const key of Object.keys(data)) {
        el.dataset[key] = String(data[key]);
    }
}

export function getElementData<T extends Record<string, unknown>>(
    el: HTMLElement,
    scheme: { [K in keyof T]: (value: string) => T[K] }
): T {
    const data: Partial<T> = {};
    const dataset = el.dataset;
    for (const key of Object.keys(scheme) as (keyof T)[]) {
        if (dataset.hasOwnProperty(key)) {
            const datasetKey = key as string;
            const value = dataset[datasetKey]; 
            data[key] = scheme[key](value!); 
        }
    }

    return data as T;
}

export function isPlainObject(obj: unknown): obj is object {
    return obj !== null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype;
}

export function isBoolean(v: unknown): v is boolean {
    return typeof v === 'boolean';
}

export function createElement<
    T extends HTMLElement,
    P extends Record<string, any> = Record<string, any>
>(
    tagName: keyof HTMLElementTagNameMap,
    props: P = {} as P,
    children: (HTMLElement | string)[] = []
): T {
    const element = document.createElement(tagName) as T;
    
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'dataset') {
            setElementData(element, value as Record<string, unknown>);
        } else {
            const stringValue = isBoolean(value) ? value : String(value);
            (element as any)[key] = stringValue;
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    
    return element;
}