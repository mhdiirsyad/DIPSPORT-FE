import { ref } from 'vue'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
}

const modalRef = ref<any>(null)

export const useConfirmation = () => {
  const registerModal = (ref: any) => {
    modalRef.value = ref
  }

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    if (!modalRef.value) {
      console.error('ConfirmationModal not registered. Make sure to add <ConfirmationModal ref="confirmModal" /> to your layout and register it.')
      return Promise.resolve(false)
    }
    return modalRef.value.open(options)
  }

  return {
    registerModal,
    confirm
  }
}
