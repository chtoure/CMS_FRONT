<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { Label } from '../../components/ui/label'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Strikethrough,
  Code
} from 'lucide-vue-next'
import { Button } from '../../components/ui/button'
import { type IFieldDefinition } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
}>()

const emit = defineEmits(['update:modelValue'])


const editor = useEditor({
  content: (props.modelValue ?? '') as string,
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Sync external value changes to editor
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue
  if (isSame) return
  editor.value?.commands.setContent((newValue ?? '') as string, { emitUpdate: false })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label :for="config.name" class="block text-text font-medium mb-2" :class="{ 'text-destructive': error }">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <div
      class="w-full border border-border bg-background shadow-sm overflow-hidden"
      :class="{ 'border-destructive ring-1 ring-destructive': error }"
    >
      <!-- Toolbar -->
      <div v-if="editor" class="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'bg-muted': editor.isActive('bold') }"
          title="Gras"
        >
          <Bold class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'bg-muted': editor.isActive('italic') }"
          title="Italique"
        >
          <Italic class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'bg-muted': editor.isActive('strike') }"
          title="Barré"
        >
          <Strikethrough class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleCode().run()"
          :class="{ 'bg-muted': editor.isActive('code') }"
          title="Code"
        >
          <Code class="h-4 w-4" />
        </Button>

        <div class="w-[1px] h-4 bg-border mx-1" />

        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'bg-muted': editor.isActive('heading', { level: 1 }) }"
          title="Titre 1"
        >
          <Heading1 class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'bg-muted': editor.isActive('heading', { level: 2 }) }"
          title="Titre 2"
        >
          <Heading2 class="h-4 w-4" />
        </Button>

        <div class="w-[1px] h-4 bg-border mx-1" />

        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'bg-muted': editor.isActive('bulletList') }"
          title="Liste à puces"
        >
          <List class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'bg-muted': editor.isActive('orderedList') }"
          title="Liste ordonnée"
        >
          <ListOrdered class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm" type="button"
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'bg-muted': editor.isActive('blockquote') }"
          title="Citation"
        >
          <Quote class="h-4 w-4" />
        </Button>

        <div class="ml-auto flex items-center gap-1">
          <Button
            variant="ghost" size="sm" type="button"
            @click="editor.chain().focus().undo().run()"
            title="Annuler"
          >
            <Undo class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" type="button"
            @click="editor.chain().focus().redo().run()"
            title="Rétablir"
          >
            <Redo class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Editor Content -->
      <EditorContent :editor="editor" />
    </div>

    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

:deep(.tiptap) {
  @apply min-h-[150px];
}

:deep(.tiptap:focus) {
  outline: none;
}

/* Custom Prose Styles since @tailwindcss/typography is missing */
:deep(.tiptap) {
  font-size: 0.875rem;
  line-height: 1.5;
}

:deep(.tiptap p) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}

:deep(.tiptap h1) {
  font-size: 1.5em;
  font-weight: 700;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.tiptap h2) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.tiptap ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 1em 0;
}

:deep(.tiptap ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 1em 0;
}

:deep(.tiptap blockquote) {
  border-left: 3px solid #e2e8f0;
  padding-left: 1em;
  font-style: italic;
  margin: 1em 0;
}

:deep(.tiptap code) {
  background-color: #f1f5f9;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-family: monospace;
}
</style>
