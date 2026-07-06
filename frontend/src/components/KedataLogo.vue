<script lang="tsx">
import { h } from 'vue'
import kedataLogo from '../assets/kedata-logo.png'
export default function KedataLogo(props: { class?: string; className?: string; alt?: string }) {
  return <img src={kedataLogo} alt={props.alt || 'Logo PT Kedata Indonesia Digital'} class={props.class || props.className || 'w-8 h-8'} style={{ objectFit: 'contain' }} />
}

</script>
