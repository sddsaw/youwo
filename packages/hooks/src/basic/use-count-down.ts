import { useRafFn } from '@vueuse/core'
import { computed, onScopeDispose, ref } from 'vue'

/**
 * A hook for implementing a countdown timer. It uses `requestAnimationFrame` for smooth and accurate timing,
 * independent of the screen refresh rate.
 *
 * @param initialSeconds - The total number of seconds for the countdown.
 */
export default function useCountDown(initialSeconds: number) {
  const remainingSeconds = ref(0)
  let endTime = 0

  const count = computed(() => Math.ceil(remainingSeconds.value))

  const isCounting = computed(() => remainingSeconds.value > 0)

  const { pause, resume } = useRafFn(
    () => {
      const remaining = (endTime - Date.now()) / 1000

      if (remaining <= 0) {
        remainingSeconds.value = 0
        pause()
        return
      }

      remainingSeconds.value = remaining
    },
    { immediate: false }, // The timer does not start automatically.
  )

  /**
   * Starts the countdown.
   *
   * @param [updatedSeconds] - Optionally, start with a new duration. Default is `initialSeconds`
   */
  function start(updatedSeconds: number = initialSeconds) {
    endTime = Date.now() + updatedSeconds * 1000
    remainingSeconds.value = updatedSeconds
    resume()
  }

  /** Stops the countdown and resets the remaining time to 0. */
  function stop() {
    endTime = 0
    remainingSeconds.value = 0
    pause()
  }

  // Ensure the rAF loop is cleaned up when the component is unmounted.
  onScopeDispose(() => {
    pause()
  })

  return {
    count,
    isCounting,
    start,
    stop,
  }
}
