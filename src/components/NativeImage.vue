<script setup lang="ts">
import { toRef } from 'vue'
import { useNativeImage } from '../composables/useNativeImage'

const props = withDefaults(defineProps<{
  provider: string
  imageKey: string
  alt?: string
}>(), { alt: '' })
const emit = defineEmits<{ load: []; error: [message: string] }>()
const { src, status, error } = useNativeImage({
  provider: toRef(props, 'provider'),
  imageKey: toRef(props, 'imageKey'),
  onLoad: () => emit('load'),
  onError: (message) => emit('error', message),
})
</script>

<template>
  <div class="native-image" :data-state="status">
    <img v-if="src" :src="src" :alt="alt">
    <slot v-if="status === 'loading'" name="loading" />
    <slot v-else-if="status === 'error'" name="error">{{ error }}</slot>
    <slot v-if="status === 'ready'" />
  </div>
</template>

<style scoped>
.native-image {
  position: relative;
  display: inline-block;
}

.native-image img {
  display: block;
  max-width: 100%;
}

.native-image :slotted(*) {
  position: absolute;
  inset: 0;
}
</style>
