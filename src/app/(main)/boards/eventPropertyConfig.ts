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
