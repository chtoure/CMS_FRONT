<script setup lang="ts">
import   {User,
    FileText,
    LogOut,
    Settings,
} from 'lucide-vue-next'

</script>

<template>
    <div class="p-4 bg-background border border-border rounded-lg shadow-sm">
        <div class="flex items-center gap-3 p-2">
            <div class="h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/20">
            <img src="/userIcon.png" alt="John Smilga" class="object-cover w-full h-full" />
            </div>
            <div class="flex flex-col">
            <span class="font-semibold text-sm text-foreground">John Smilga</span>
            <span class="text-xs text-muted-foreground">Admin</span>
            </div>
        </div>
        <div class="my-2 h-px bg-border" />
        <!-- Updated text colors and hover states with new design system -->
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200">
            <User class="w-4 h-4" /> MyProfile
        </a>
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200">
            <FileText class="w-4 h-4" /> Reports
        </a>
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200">
            <Settings class="w-4 h-4" /> Settings
        </a>
        <div class="my-2 h-px bg-border" />
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-destructive hover:bg-destructive/10 focus:text-destructive rounded-lg transition-all duration-200 font-medium">
            <LogOut class="w-4 h-4" /> Logout
        </a>
    </div>
</template>
