import { defineComponent, h } from 'vue'

const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'layout'])

function finalValue(value) {
  return Array.isArray(value) ? value[value.length - 1] : value
}

function appendTransform(parts, name, value, unit = '') {
  if (value === undefined || value === null) return
  parts.push(`${name}(${value}${unit})`)
}

function applyAnimate(clean, animate) {
  if (!animate || typeof animate !== 'object' || Array.isArray(animate)) return
  const style = { ...(typeof clean.style === 'object' && clean.style ? clean.style : {}) }
  const transforms = []
  for (const [key, raw] of Object.entries(animate)) {
    const value = finalValue(raw)
    if (key === 'opacity' || key === 'width' || key === 'height' || key === 'filter') {
      style[key] = value
      continue
    }
    if (key === 'x') appendTransform(transforms, 'translateX', value, typeof value === 'number' ? 'px' : '')
    if (key === 'y') appendTransform(transforms, 'translateY', value, typeof value === 'number' ? 'px' : '')
    if (key === 'scale') appendTransform(transforms, 'scale', value)
    if (key === 'scaleX') appendTransform(transforms, 'scaleX', value)
    if (key === 'scaleY') appendTransform(transforms, 'scaleY', value)
    if (key === 'rotate') appendTransform(transforms, 'rotate', value, typeof value === 'number' ? 'deg' : '')
  }
  if (transforms.length) style.transform = transforms.join(' ')
  if (Object.keys(style).length) clean.style = style
}

function plainMotion(tag) {
  return defineComponent({
    name: `Motion${String(tag)}`,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const clean = {}
        for (const [key, value] of Object.entries(attrs)) {
          if (!MOTION_PROPS.has(key)) clean[key] = value
        }
        applyAnimate(clean, attrs.animate)
        return h(tag, clean, slots.default ? slots.default() : [])
      }
    },
  })
}

export const motion = new Proxy({}, { get(_target, tag) { return plainMotion(tag) } })
export const AnimatePresence = defineComponent({ name: 'AnimatePresence', setup(_, { slots }) { return () => slots.default ? slots.default() : [] } })
