<template>
    <div class="p-8 ">
        <BaseSearchInput v-model="searchTerm" placeholder="Rechercher des fichiers..." containerClass="max-w-xl">
            
            <template v-slot:iconLeft>
                <SearchIcon class="w-4 h-4" />
            </template>
            
            <template v-slot:shortcutRight>
                <CommandIcon class="w-3 h-3" />
                <span>K</span>
            </template>
            
        </BaseSearchInput>
        <p class="mt-4">Recherche actuelle: {{ searchTerm }}</p>

    </div>
</template>

<script setup lang="ts" >
import { ref } from 'vue';
// 💡 Assurez-vous d'importer votre composant
import BaseSearchInput from '@/components/base/BaseSearchInput.vue';

// 💡 Assurez-vous d'importer vos composants d'icônes (simulés ici)
// Import SearchIcon from 'lucide-vue-next/search';
// Import CommandIcon from 'lucide-vue-next/command'; 

// Simulation des composants d'icônes pour l'exemple
const SearchIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' };
const CommandIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>' };

const searchTerm = ref('');
</script>