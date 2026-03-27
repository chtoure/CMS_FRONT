import { defineStore } from "pinia";
import { ref } from "vue";
import type { Parameter } from "../type/parameter";


const useParameter= defineStore("parameter", ()=> {

    const parameter= ref<Parameter>();

    const setParameter = (value: Parameter) => {
        parameter.value = value;
    }

    return {
        parameter,
        setParameter
    }
},{persist:true})


export {
    useParameter
}