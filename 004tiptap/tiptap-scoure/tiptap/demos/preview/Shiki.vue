<template>
  <div v-if="html" v-html="html" />
  <pre v-else><code>{{ code }}</code></pre>
</template>

<script>
// this import is a bugfix
// otherwise the `onig.wasm` file is missing in the dist folder
import 'shiki/dist/onig.wasm?url'

import Worker from './shiki.worker.js?worker'

export default {
  props: {
    code: {
      default: '',
      type: String,
    },

    language: {
      default: 'js',
      type: String,
    },
  },

  data() {
    return {
      worker: new Worker(),
      html: null,
      highlighter: window?.highlighter,
    }
  },

  watch: {
    code: {
      immediate: true,
      handler() {
        this.render()
      },
    },

    highlighter: {
      immediate: true,
      handler() {
        this.render()
      },
    },
  },

  methods: {
    render() {
      this.worker.postMessage({
        code: this.code,
        language: this.language,
      })
    },
  },

  created() {
    this.worker.addEventListener('message', event => {
      const { html } = event.data

      this.html = html
    })
  },
}
</script>

<style>
.shiki {
  background-color: transparent !important;
}
</style>
