import { defineStore } from "pinia";
import { ref } from "vue";


export const useTheme= defineStore("theme", ()=> {

    const darkTheme= ref(false);

    const swithTheme = () => {
        darkTheme.value = !darkTheme.value;
        
        if (darkTheme.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    return {
        isDark: darkTheme,
        swithTheme
    }
},{persist:true})