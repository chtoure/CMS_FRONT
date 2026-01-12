<script setup lang="ts">
    import { ref, onMounted, onUnmounted, watch } from 'vue';
    import { cn } from '../../lib/utils';
    import { type SearchItem } from '../../constants/searchItems';

    const emit = defineEmits(['update:modelValue', 'select']);

    const props = defineProps({
        modelValue: { type: [String, Number], default: '' },
        type: { type: String, default: 'search' },
        placeholder: { type: String, default: 'Search' },
        containerClass: { type: String, default: 'max-w-md' },
        id: { type: String, default: () => `search-input-${Math.random().toString(36).substring(2, 9)}` },
        results: { type: Array as () => SearchItem[], default: () => [] }
    });

    const inputBaseClasses = cn(
        'w-full',
        'px-2.5 py-1.5',
        'input-custom transition-all duration-300 focus:ring-1 focus:ring-primary/20',
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
        'absolute left-0 right-0 mt-12',
        'rounded-2xl shadow-2xl ring-1 ring-border border border-border/50',
        'z-[100] bg-background backdrop-blur-xl max-h-[400px] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200'
    );

    const showDropdown = ref(false);
    const containerRef = ref<HTMLElement | null>(null);
    const selectedIndex = ref(-1);

    const onClickOutside = (event: MouseEvent) => {
        if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
            showDropdown.value = false;
        }
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (!showDropdown.value) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex.value = (selectedIndex.value + 1) % props.results.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex.value = selectedIndex.value <= 0 ? props.results.length - 1 : selectedIndex.value - 1;
        } else if (e.key === 'Enter' && selectedIndex.value !== -1 && props.results[selectedIndex.value]) {
            e.preventDefault();
            selectItem(props.results[selectedIndex.value] as SearchItem);
        } else if (e.key === 'Escape') {
            showDropdown.value = false;
        }
    };

    const selectItem = (item: SearchItem) => {
        emit('select', item);
        showDropdown.value = false;
        emit('update:modelValue', '');
    };

    watch(() => props.results, (newResults) => {
        if (newResults.length > 0) {
            showDropdown.value = true;
            selectedIndex.value = 0;
        } else {
            if (!props.modelValue) selectedIndex.value = -1;
        }
    });

    onMounted(() => {
        document.addEventListener('click', onClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', onClickOutside);
    });
</script>

<template>
    <div :class="cn('relative w-full', containerClass)" ref="containerRef" @keydown="handleKeydown">

        <div class="relative flex items-center">

            <div v-if="$slots.iconLeft" :class="iconLeftClasses">
                <slot name="iconLeft" />
            </div>

            <input
                :id="id"
                :type="type"
                :value="modelValue"
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value ?? '')"
                @focus="showDropdown = true"
                :placeholder="placeholder"
                autocomplete="off"
                :class="[
                    inputBaseClasses,
                    $slots.iconLeft ? 'pl-8' : 'pl-2.5',
                    $slots.shortcutRight ? 'pr-14' : 'pr-2.5',
                ]"
            />

            <div
                v-if="$slots.shortcutRight"
                :class="shortcutRightClasses"
                @click="showDropdown = !showDropdown"
            >
                <slot name="shortcutRight" />
            </div>

        </div>

        <div v-if="showDropdown && (results.length > 0 || !modelValue)" :class="dropdownClasses" class="border border-border">
            <div v-if="results.length > 0" class="p-2 space-y-1">
                <div v-for="(item, index) in results"
                    :key="item.id"
                    @click="selectItem(item)"
                    @mouseenter="selectedIndex = index"
                    :class="cn(
                        'flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group',
                        selectedIndex === index ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:bg-secondary'
                    )"
                >
                    <div :class="cn(
                        'p-2 rounded-lg transition-colors',
                        selectedIndex === index ? 'bg-white/20' : 'bg-primary/10 text-primary'
                    )">
                        <component :is="item.icon" class="w-4 h-4" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p :class="cn('text-sm font-bold truncate', selectedIndex === index ? 'text-white' : 'text-foreground')">
                            {{ item.label }}
                        </p>
                        <p :class="cn('text-xs truncate', selectedIndex === index ? 'text-white/70' : 'text-muted-foreground')">
                            {{ item.description }}
                        </p>
                    </div>
                    <div v-if="selectedIndex === index" class="text-[10px] font-black uppercase tracking-widest opacity-50">
                        Entrer
                    </div>
                </div>
            </div>
            <div v-else class="p-8 text-center space-y-2">
                <p class="text-sm font-bold text-muted-foreground">Aucun résultat pour "{{ modelValue }}"</p>
                <p class="text-xs text-muted-foreground/60">Essayez de rechercher une page ou une action.</p>
            </div>
        </div>

    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
