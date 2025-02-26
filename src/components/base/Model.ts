import { IEvents } from '../../types';

// Гарда для проверки на модель
export const isModel = (obj: unknown): obj is Model<any> => {
  return obj instanceof Model;
};

export abstract class Model<T> {
  protected eventBus: IEvents;

  constructor(data: Partial<T>, events: IEvents) {
    this.eventBus = events;
    Object.assign(this, data);
  }

  // Сообщить всем что модель поменялась
  emitChanges(event: string, payload: object = {}) {
    this.eventBus.emit(event, payload);
  }
}