<template>
    <div class="p-2 space-y-1">
        
        <!-- Updated text colors with new design system -->
        <p class="px-2 pt-1 pb-2 text-xs font-semibold text-primary border-b border-border">
            Filtrer par type
        </p>

        <button class="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                       hover:bg-accent hover:text-accent-foreground text-foreground font-medium">
            Documents (12)
        </button>
        
        <button class="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                       hover:bg-accent hover:text-accent-foreground text-foreground font-medium">
            Images (4)
        </button>

        <button class="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                       hover:bg-accent hover:text-accent-foreground text-foreground font-medium">
            Projets (8)
        </button>

        <p class="px-2 pt-2 pb-1 text-xs font-semibold text-primary border-t mt-2 border-border">
            Trier par
        </p>
        
        <a href="#" class="block px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                          hover:bg-accent hover:text-accent-foreground text-foreground font-medium">
            Date de modification
        </a>

        <a href="#" class="block px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                          hover:bg-accent hover:text-accent-foreground text-foreground font-medium">
            Nom (A-Z)
        </a>

    </div>
</template>

<script setup lang="ts">

</script>
