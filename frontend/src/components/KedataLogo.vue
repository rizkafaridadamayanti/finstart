<script lang="tsx">
import { defineComponent } from 'vue'
import kedataLogo from '../assets/kedata-logo.png'

export default defineComponent({
  name: 'KedataLogo',
  props: {
    class: { type: String, default: '' },
    className: { type: String, default: '' },
    alt: { type: String, default: 'Logo PT Kedata Indonesia Digital' },
    size: { type: [Number, String], default: 36 },
  },
  setup(props) {
    return () => {
      const requestedSize = Number(props.size)
      const size = Number.isFinite(requestedSize) && requestedSize > 0 ? requestedSize : 36
      return (
        <img
          src={kedataLogo}
          alt={props.alt}
          class={props.class || props.className || ''}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            minWidth: `${size}px`,
            maxWidth: `${size}px`,
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
          }}
        />
      )
    }
  },
})
</script>
