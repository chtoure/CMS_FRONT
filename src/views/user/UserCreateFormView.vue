<script setup lang="ts">
import { useAddUser } from '../../hook/user';
import CompositionError from '../../components/composition/CompositionError.vue';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import UserFormView from './UserFormView.vue';
import type { AddUserData } from '../../type/user';
import { showToast } from '../../lib/toast';
import { getErrorMessage } from '../../lib/errorMessage';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import { ArrowLeft } from 'lucide-vue-next';


const {
  isError:is_error,
  error:error,
  mutate: addUser,
  isPending: isAdding,
} = useAddUser();

const handleSubmit = (user? : AddUserData) => {

    if (!user) return

    addUser(user, {
      onSuccess: () => {
        showToast('success', 'utilisateur ajouté avec succès');
      },
      onError: (error: Error) => {
        showToast('error', getErrorMessage(error));
      }

    });
};
</script>

<template>
    <CompositionError v-if="is_error" :error="error?.message" />
    <CompositionLoading v-else-if="isAdding" />

    <div v-else class="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-10">
        <CompositionPageHeader>
            <template #content>
                <div class="flex gap-4 items-center">
                    <div
                        class="hover:cursor-pointer hover:text-primary"
                        @click="$router.back()"
                    >
                        <ArrowLeft />
                    </div>
                    <div class="space-y-2">
                        <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Ajouter un utilisateur</span></h1>
                        <p class="text-background text-sm font-medium">Ajoutez un nouvel utilisateur avec précision.</p>
                    </div>
                </div>
            </template>
        </CompositionPageHeader>
        <div class="card rounded-none overflow-hidden">
            <UserFormView
                :is-editing="false"
                v-model:is_loading="isAdding"
                :handleSubmit="handleSubmit"
            />
        </div>
    </div>
</template>