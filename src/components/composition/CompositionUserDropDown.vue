<script setup lang="ts">
import   {User,
    FileText,
    LogOut,
    Settings,
} from 'lucide-vue-next'

</script>

<template>
    <div class="p-2">
        <div class="flex items-center gap-3 p-2">
            <div class="h-10 w-10 rounded-full overflow-hidden">
            <img src="/userIcon.png" alt="John Smilga" class="object-cover w-full h-full" />
            </div>
            <div class="flex flex-col">
            <span class="font-medium text-sm">John Smilga</span>
            <span class="text-xs text-muted-foreground">Admin</span>
            </div>
        </div>
        <div class="my-2 h-px " />
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
            <User class="w-4 h-4" /> MyProfile
        </a>
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
            <FileText class="w-4 h-4" /> Reports
        </a>
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
            <Settings class="w-4 h-4" /> Settings
        </a>
        <div class="my-2 h-px " />
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-destructive hover:bg-red-50 focus:text-destructive rounded-md">
            <LogOut class="w-4 h-4" /> Logout
        </a>
    </div>
</template>