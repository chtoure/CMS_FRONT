<script setup lang="ts">
import { Webhook, Scaling } from 'lucide-vue-next';
import { ref } from 'vue';

const paddingValue = ref(10);
</script>

<template>
  <div class="flex flex-col gap-1.5 font-sans w-fit p-4">
    <label class="text-gray-400 text-xs font-medium uppercase tracking-wider">
      Padding
    </label>
    
    <div class="flex items-center bg-[#1e1e1e] border border-[#333] rounded-md px-2 py-1 
                transition-all duration-200 group
                focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      
      <Scaling class="text-gray-500 mr-2" :size="14" />
      
      <input 
        type="number" 
        v-model="paddingValue" 
        class="bg-transparent border-none text-gray-100 text-sm w-12 outline-none
               [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button 
        class="ml-auto p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        title="Settings"
      >
        <Webhook :size="14" />
      </button>
    </div>
  </div>
</template>