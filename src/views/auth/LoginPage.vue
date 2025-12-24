
<script setup>
    
    import BaseInput from '@/components/base/BaseInput.vue';
    import { ref } from 'vue';

    const userEmail =  ref('');
    const userPassword = ref('');

</script>


<template>
    <p>login page</p>
    <BaseInput label="Username" v-model="userEmail"/>
    <p>{{ userEmail }}</p>
</template>