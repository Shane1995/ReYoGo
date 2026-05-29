const GROUP_KEY = 'reyogo:logo:group';
const ENTITY_KEY_PREFIX = 'reyogo:logo:entity:';

export function getGroupLogo(): string | null {
  return localStorage.getItem(GROUP_KEY);
}

export function setGroupLogo(dataUrl: string): void {
  localStorage.setItem(GROUP_KEY, dataUrl);
}

export function clearGroupLogo(): void {
  localStorage.removeItem(GROUP_KEY);
}

export function getEntityLogo(entityId: string): string | null {
  return localStorage.getItem(`${ENTITY_KEY_PREFIX}${entityId}`);
}

export function setEntityLogo(entityId: string, dataUrl: string): void {
  localStorage.setItem(`${ENTITY_KEY_PREFIX}${entityId}`, dataUrl);
}

export function clearEntityLogo(entityId: string): void {
  localStorage.removeItem(`${ENTITY_KEY_PREFIX}${entityId}`);
}

export function pickImageFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
