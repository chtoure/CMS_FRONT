<script setup lang="ts">
import   {User,
    FileText,
    LogOut,
    Settings,
} from 'lucide-vue-next'
import { useLogout } from "../../hook/user";
import { userStore } from '../../stores/user';
import router from '../../router';


// Initialisations
const storeUser = userStore();

// Logout hook
const {
  mutate: logout,
  isPending: isLoggingOut,
} = useLogout();






const handleLogout = () => {
  logout(void 0, {

    onSuccess() {
      storeUser.setUserInfo(null);
      router.push({ name: 'auth.login' });
    },
    onError(err) {
      console.error('Erreur de déconnexion :', err);
      storeUser.setUserInfo(null);
      router.push({ name: 'auth.login' });
    }
  });
};



</script>

<template>
    <div class="p-4 bg-background border border-border rounded-lg shadow-sm">
        <div class="flex items-center gap-3 p-2">
            <div class="h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/20">
            <img src="/userIcon.png" :alt="storeUser.userInfo?.full_name" class="object-cover w-full h-full" />
            </div>
            <div class="flex flex-col">
            <span class="font-semibold text-sm text-foreground">{{ storeUser.userInfo?.full_name }}</span>
            <span class="text-xs text-muted-foreground">{{ storeUser.userInfo?.role }}</span>
            </div>
        </div>
        <div class="my-2 h-px bg-border" />
        <!-- Updated text colors and hover states with new design system -->
        <RouterLink :to="{name:'admin.settings'}" class="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-primary hover:text-white rounded-lg transition-all duration-200">
            <User class="w-4 h-4" /> Profile
        </RouterLink>
        <!-- <a href="#" class="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-primary hover:text-white rounded-lg transition-all duration-200">
            <User class="w-4 h-4" /> Profile
        </a> -->
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-primary hover:text-white rounded-lg transition-all duration-200">
            <FileText class="w-4 h-4" /> Reports
        </a>
        <a href="#" class="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-primary hover:text-white rounded-lg transition-all duration-200">
            <Settings class="w-4 h-4" /> Settings
        </a>
        <Button
          variant="ghost"
          size="sm"
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="flex items-center gap-2 p-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive rounded-lg transition-all duration-200 font-medium w-full justify-start"
        >
          <LogOut class="w-4 h-4 mr-2" />{{ isLoggingOut ? 'Déconnexion...' : 'Se déconnecter' }}
      </Button>
    </div>
</template>
