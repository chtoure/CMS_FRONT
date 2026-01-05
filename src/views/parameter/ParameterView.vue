<script setup lang="ts">

import { Pencil, Save } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement | null>(null)

const profileImage = ref('/userIcon.png')
const triggerFileInput = () => {
  if (!fileInput.value) return
  fileInput.value.click()
}

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    profileImage.value = URL.createObjectURL(file)
  }
}

const handleSave = () => {
  console.log('les Kpataux de chebo')
}
</script>

<template>
  <div class="card rounded-none p-6">
    <main class="">
      <div class="mx-auto max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-2">

        <div class="card p-8 bg-background">
          <div class="mb-6">
            <h2 class="text-text text-h1 font-semibold">Logo</h2>
          </div>

          <div class="flex flex-col items-start gap-6">
            <div class="w-full">
              <div class="relative">
                <img
                  :src="profileImage"
                  alt="Profile picture"
                  class="rounded-lg w-full pl-6 pr-6 h-auto object-cover border border-border"
                />
                <div class="absolute -bottom-1 -right-1 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                  LOGO
                </div>
              </div>
            </div>

            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept="image/*"
              @change="handleFileChange"
            />

            <Button class="h-10" @click="triggerFileInput">
              <Pencil class="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        <div class="card bg-background p-8">
          <div class="mb-6">
            <h2 class="text-text text-h1 font-semibold">Paramètres</h2>
          </div>
          <div class="space-y-8">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

              <div>
                <label class="block text-text font-medium mb-3">
                  les oreilles
                </label>
                <input type="text" class="input-custom" placeholder="les oreilles">
              </div>

              <div>
                <label class="block text-text font-medium mb-3">Femme de chebo</label>
                <input type="text" class="input-custom" placeholder="Femme de chebo">
              </div>

              <div>
                <label class="block text-text font-medium mb-3">Chebo</label>
                <input type="text" class="input-custom" placeholder="Chebo">
              </div>

              <div>
                <label class="block text-text font-medium mb-3">Katites</label>
                <input type="text" class="input-custom" placeholder="Katites">
              </div>
            </div>

            <Button
              @click="handleSave"
              class="h-10"
            >
              <Save class="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
