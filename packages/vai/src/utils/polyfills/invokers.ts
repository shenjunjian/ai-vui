import { isSupported, isPolyfilled, apply } from 'invokers-polyfill/fn'
if (!isSupported() && !isPolyfilled()) apply()
