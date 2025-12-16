<template>
    <div>
        <label for="">{{ label }}</label>
        <input type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
    </div>
</template>

<script setup>

    defineProps({
        label: {
            type: String,
            default: ''
        },
        modelValue: {
            type: String,
            default: ''
        }
    })

</script>