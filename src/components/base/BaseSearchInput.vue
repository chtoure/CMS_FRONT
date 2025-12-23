<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';
    import CompositionFilterPanel from '@/components/composition/CompositionFilterPanel.vue';
    import { cn } from '../../lib/utils';

    defineEmits(['update:modelValue']);

    defineProps({
        modelValue: { type: [String, Number], default: '' },
        type: { type: String, default: 'search' },
        placeholder: { type: String, default: 'Search' },
        containerClass: { type: String, default: 'max-w-md' },
        id: { type: String, default: () => `search-input-${Math.random().toString(36).substring(2, 9)}` }
    });

    const inputBaseClasses = cn(
        'h-8 w-full rounded-md border text-[13px]',
        'bg-background px-2.5 py-1.5',
        'border-border ring-offset-background',
        'file:border-0 file:bg-transparent file:text-[13px] file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50'
    );

    const iconLeftClasses = cn(
        'absolute left-2.5 top-1/2 -translate-y-1/2',
        'flex items-center text-muted-foreground'
    );

    const shortcutRightClasses = cn(
        'absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors',
        'flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground',
        'px-1.5 py-0.5 border border-border rounded hover:bg-muted bg-transparent'
    );

    const dropdownClasses = cn(
        'absolute right-0 mt-1',
        'rounded-md shadow-lg ring-1 ring-border',
        'z-10 bg-popover'
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
                    $slots.iconLeft ? 'pl-8' : 'pl-2.5',
                    $slots.shortcutRight ? 'pr-14' : 'pr-2.5',
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
