import { apply, isSupported } from '@oddbird/popover-polyfill/fn'

if (!isSupported()) {
  apply()
}
