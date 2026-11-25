export interface EventDataProperty {
  eventName: string;
  propertyName: string;
  dataType: number;
}

// Keeps a saved selection visible in a dropdown even when the current date range has no data for it.
export function withSavedOption(options: string[], saved?: string): string[] {
  if (!saved || options.includes(saved)) {
    return options;
  }

  return [saved, ...options];
}

// Event names, property names and data types belong to one website, so picking a different
// website must not carry them over (a stale dataType would query the wrong value type).
export function resetEventPropertyValues<T extends Record<string, any>>(
  values: T,
  previousEntityId?: string,
  nextEntityId?: string,
): T {
  if (previousEntityId === nextEntityId) {
    return values;
  }

  const { eventName, propertyName, dataType, ...rest } = values;

  return rest as T;
}

export function getEventNames(data: EventDataProperty[] = []): string[] {
  return [...new Set(data.map(({ eventName }) => eventName))];
}

export function getPropertyNames(data: EventDataProperty[] = [], eventName?: string): string[] {
  if (!eventName) {
    return [];
  }

  return [
    ...new Set(
      data.filter(field => field.eventName === eventName).map(({ propertyName }) => propertyName),
    ),
  ];
}

export function getPropertyDataType(
  data: EventDataProperty[] = [],
  eventName?: string,
  propertyName?: string,
): number | undefined {
  return data.find(field => field.eventName === eventName && field.propertyName === propertyName)
    ?.dataType;
}
