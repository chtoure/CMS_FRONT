<script setup lang="ts">
  interface Props {
    checked: boolean
    id?: string
  }

  defineProps<Props>()

  // On définit les émissons pour le parent
  const emit = defineEmits<{
    (e: 'update:checked', value: boolean): void
  }>()

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:checked', target.checked)
  }
</script>

<template>
  <div class="relative flex items-center justify-center w-5 h-5 shrink-0">
    <input
      type="checkbox"
      :id="id"
      :checked="checked"
      @change="handleChange"
      class="
        /* Reset et Taille */
        appearance-none w-full h-full cursor-pointer rounded-sm

        /* Style Bordure et Fond (Décoché) */
        border border-primary bg-background

        /* État Coché : Fond bleu + Icône SVG blanche */
        checked:bg-primary
        checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiPjwvcG9seWxpbmU+PC9zdmc+')]
        bg-no-repeat bg-center bg-[length:80%_80%]

        /* Focus & Accessibilité */
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        transition-all duration-200
        z-10
      "
    />
  </div>
</template>
