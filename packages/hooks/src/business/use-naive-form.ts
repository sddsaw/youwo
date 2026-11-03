import type { FormInst } from 'naive-ui'
import { ref } from 'vue'

/**
 * use naive-ui form
 */
export default function useNaiveForm() {
  const formRef = ref<FormInst | null>(null)

  async function validate() {
    await formRef.value?.validate()
  }

  async function restoreValidation() {
    formRef.value?.restoreValidation()
  }

  return {
    formRef,
    validate,
    restoreValidation,
  }
}
