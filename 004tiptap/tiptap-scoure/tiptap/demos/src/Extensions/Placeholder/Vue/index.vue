<template>
  <editor-content :editor="editor" />
</template>

<script>
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          // Use a placeholder:
          placeholder: 'Write something …',
          // Use different placeholders depending on the node type:
          // placeholder: ({ node }) => {
          //   if (node.type.name === 'heading') {
          //     return 'What’s the title?'
          //   }

          //   return 'Can you add some further context?'
          // },
        }),
      ],
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }
}

/* Placeholder (at the top) */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Placeholder (on every new line) */
/*.tiptap p.is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}*/
</style>
