import { writable } from 'svelte/store';

export const toasts = writable([]);

let toastId = 0;

export function showToast(message, type = 'success', duration = 5000) {
  const id = toastId++;
  const toast = { id, message, type, duration };
  
  toasts.update(currentToasts => [...currentToasts, toast]);
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
}

export function removeToast(id) {
  toasts.update(currentToasts => currentToasts.filter(toast => toast.id !== id));
}