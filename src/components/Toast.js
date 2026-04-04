"use client"

import { toast as sonnerToast } from 'sonner'

export const toast = {
    success: (msg) => sonnerToast.success(msg),
    error: (msg) => sonnerToast.error(msg),
    info: (msg) => sonnerToast.info(msg),
    warning: (msg) => sonnerToast.warning(msg),
}

export const useToast = () => {
    return {
        showToast: (message, type = 'success') => {
            if (type === 'success') sonnerToast.success(message)
            else if (type === 'error') sonnerToast.error(message)
            else if (type === 'warning') sonnerToast.warning(message)
            else sonnerToast.info(message)
        }
    }
}

export function ToastProvider({ children }) {
    return children
}
