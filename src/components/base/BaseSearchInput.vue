<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';
    import CompositionFilterPanel from '@/components/composition/CompositionFilterPanel.vue';
    import { cn } from '../../lib/utils';

    defineEmits(['update:modelValue']);

    // const props =

    defineProps({
        modelValue: { type: [String, Number], default: '' },
        type: { type: String, default: 'search' },
        placeholder: { type: String, default: 'Search' },
        containerClass: { type: String, default: 'max-w-md' },
        id: { type: String, default: () => `search-input-${Math.random().toString(36).substring(2, 9)}` }
    });

    const inputBaseClasses = cn(
        'h-10 w-full rounded-md border',
        'bg-background px-3 py-2 text-sm',
        'border-border ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50'
    );

    const iconLeftClasses = cn(
        'absolute left-3 top-1/2 -translate-y-1/2',
        'flex items-center text-muted-foreground'
    );

    const shortcutRightClasses = cn(
        'absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors',
        'flex items-center gap-1 text-xs text-muted-foreground hover:text-gray-900 dark:hover:text-gray-50',
        'p-1 border border-border rounded-md hover:bg-accent bg-transparent'
    );

    const dropdownClasses = cn(
        'absolute right-0 mt-2 w-56',
        'rounded-md shadow-lg ring-1 ring-black ring-opacity-5',
        'z-10 bg-background'
    );

    const filterPanelOpen = ref(false);
    const containerRef = ref<HTMLElement | null>(null);

    const onClickOutside = (event:MouseEvent) => {
        if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
            filterPanelOpen.value = false;
        }
    };

    onMounted(() => {
        document.addEventListener('click', onClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', onClickOutside);
    });
</script>

<template>
    <div :class="cn('relative w-full', containerClass)" ref="containerRef">

        <div class="relative flex items-center">

            <div v-if="$slots.iconLeft" :class="iconLeftClasses">
                <slot name="iconLeft" />
            </div>

            <input
                :id="id"
                :type="type"
                :value="modelValue"
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value ?? '')"
                :placeholder="placeholder"
                :class="[
                    inputBaseClasses,
                    $slots.iconLeft ? 'pl-10' : 'pl-3',
                    $slots.shortcutRight ? 'pr-16' : 'pr-3',
                ]"
            />

            <div
                v-if="$slots.shortcutRight"
                :class="shortcutRightClasses"
                @click="filterPanelOpen = !filterPanelOpen"
            >
                <slot name="shortcutRight" />
            </div>

        </div>

        <div v-if="filterPanelOpen" :class="dropdownClasses">
            <CompositionFilterPanel />
        </div>

    </div>
</template>
