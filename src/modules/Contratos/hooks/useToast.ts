import { toast } from "sonner"

type ToastOptions = {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  
  const success = (message: string | ToastOptions) => {
    if (typeof message === "string") {
      toast.success(message, { duration: 3000 })
    } else {
      toast.success(message.title ?? "Sucesso", {
        description: message.description,
        duration: message.duration ?? 3000,
        action: message.action
      })
    }
  }

  const error = (message: string | ToastOptions) => {
    if (typeof message === "string") {
      toast.error(message, { duration: 4000 })
    } else {
      toast.error(message.title ?? "Erro", {
        description: message.description,
        duration: message.duration ?? 4000,
        action: message.action
      })
    }
  }

  const info = (message: string | ToastOptions) => {
    if (typeof message === "string") {
      toast.info(message, { duration: 3000 })
    } else {
      toast.info(message.title ?? "Info", {
        description: message.description,
        duration: message.duration ?? 3000,
        action: message.action
      })
    }
  }

  const warning = (message: string | ToastOptions) => {
    if (typeof message === "string") {
      toast.warning(message, { duration: 3500 })
    } else {
      toast.warning(message.title ?? "Atenção", {
        description: message.description,
        duration: message.duration ?? 3500,
        action: message.action
      })
    }
  }

  return {
    success,
    error,
    info,
    warning
  }
}

