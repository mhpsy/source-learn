<template>
    <div v-if="editor">
        <button @click="editor.chain().focus().toggleBold().run()"
            :disabled="!editor.can().chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
            bold
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()"
            :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }">
            italic
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()"
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }">
            strike
            
        </button>
        <button @click="editor.chain().focus().toggleCode().run()"
            :disabled="!editor.can().chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
            code
        </button>
        <button @click="editor.chain().focus().unsetAllMarks().run()">
            clear marks
        </button>
        <button @click="editor.chain().focus().clearNodes().run()">
            clear nodes
        </button>
        <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
            paragraph
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
            h1
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
            h2
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
            h3
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
            h4
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
            h5
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
            h6
        </button>
        <button @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }">
            bullet list
        </button>
        <button @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'is-active': editor.isActive('orderedList') }">
            ordered list
        </button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()"
            :class="{ 'is-active': editor.isActive('codeBlock') }">
            code block
        </button>
        <button @click="editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'is-active': editor.isActive('blockquote') }">
            blockquote
        </button>
        <button @click="editor.chain().focus().setHorizontalRule().run()">
            horizontal rule
        </button>
        <button @click="editor.chain().focus().setHardBreak().run()">
            hard break
        </button>
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()">
            undo
        </button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()">
            redo
        </button>
        <button @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'is-active': editor.isActive('orderedList') }">
            toggleOrderedList
        </button>
        <button @click="editor.chain().focus().splitListItem('listItem').run()"
            :disabled="!editor.can().splitListItem('listItem')">
            splitListItem
        </button>
        <button @click="editor.chain().focus().sinkListItem('listItem').run()"
            :disabled="!editor.can().sinkListItem('listItem')">
            sinkListItem
        </button>
        <button @click="editor.chain().focus().liftListItem('listItem').run()"
            :disabled="!editor.can().liftListItem('listItem')">
            liftListItem
        </button>
        <button @click="setLink" :class="{ 'is-active': editor.isActive('link') }">
            setLink
        </button>
        <button @click="editor.chain().focus().unsetLink().run()" :disabled="!editor.isActive('link')">
            unsetLink
        </button>
    </div>
    <editor-content :editor="editor" />
</template>

<script setup>
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/vue-3'

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(["update:modelValue"])
const editor = useEditor({
    extensions: [
        StarterKit,
        Document,
        Paragraph,
        Text,
        OrderedList,
        ListItem,
        Link.configure({
            openOnClick: false,
            //这个玩意有很多的属性 看文档吧
        }),
    ],
    content: `
        <h2>
          Hi there,
        </h2>
      `,
    onUpdate: () => {
        // HTML
        console.log(editor);
        emit('update:modelValue', editor.value.getHTML())

        // JSON
        // this.$emit('update:modelValue', this.editor.getJSON())
    },
})


const setLink = () => {
    const previousUrl = editor.value.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
        return
    }

    // empty
    if (url === '') {
        editor.value
            .chain()
            .focus()
            .extendMarkRange('link')
            .unsetLink()
            .run()

        return
    }

    // update link
    editor.value
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run()
}


</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
    height: 300px;
    background-color: #fff;
    padding: 1rem;
    overflow: auto;

    >*+* {
        margin-top: 0.75em;
    }

    ul,
    ol {
        padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        line-height: 1.1;
    }

    code {
        background-color: rgba(#616161, 0.1);
        color: #616161;
    }

    pre {
        background: #0D0D0D;
        color: #FFF;
        font-family: 'JetBrainsMono', monospace;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;

        code {
            color: inherit;
            padding: 0;
            background: none;
            font-size: 0.8rem;
        }
    }

    img {
        max-width: 100%;
        height: auto;
    }

    blockquote {
        padding-left: 1rem;
        border-left: 2px solid rgba(#0D0D0D, 0.1);
    }

    hr {
        border: none;
        border-top: 2px solid rgba(#0D0D0D, 0.1);
        margin: 2rem 0;
    }
}
</style>