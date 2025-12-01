export function setItem(key: string, data: any, session?: boolean): void {
  if (typeof window !== 'undefined' && data) {
    return (session ? sessionStorage : localStorage).setItem(key, JSON.stringify(data));
  }
}

export function getItem(key: string, session?: boolean): any {
  if (typeof window !== 'undefined') {
    const value = (session ? sessionStorage : localStorage).getItem(key);

    if (value !== 'undefined' && value !== null) {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
  }
}

export function removeItem(key: string, session?: boolean): void {
  if (typeof window !== 'undefined') {
    return (session ? sessionStorage : localStorage).removeItem(key);
  }
}
