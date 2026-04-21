<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useGetUserById, useUpdateProfile } from '../../hook/user';
import { computed } from 'vue';
import CompositionError from '../../components/composition/CompositionError.vue';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import UserFormView from './UserFormView.vue';
import type { UpdateProfileData } from '../../type/user';
import { showToast } from '../../lib/toast';
import { getErrorMessage } from '../../lib/errorMessage';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import { ArrowLeft } from 'lucide-vue-next';


const route= useRoute()
const id = computed(() => Number(route.params.id))

const {data:user,isLoading,isError,error} = useGetUserById(id)
const {
  mutate: updateProfile,
  isPending:isUpdateProfiling,
} = useUpdateProfile();

const handleSubmit = (profileData?: UpdateProfileData) => {
    if (!profileData) return;

    if (!user.value?.id) {
      showToast('error', "ID utilisateur manquant pour la modification.");
      return;
    }

    updateProfile({ profileData, id: user.value?.id }, {
      onSuccess: () => {
        showToast('success', 'utilisateur modifié avec succès');
      },
      onError: (error: Error) => {
        showToast('error', getErrorMessage(error));
      }
    });
};
</script>

<template>
    <CompositionError v-if="isError" :error="error?.message" />
    <CompositionLoading v-else-if="isLoading" />


    <div v-else class="animate-in fade-in slide-in-from-bottom-4 space-y-10">
        <CompositionPageHeader>
            <template #content>
              <div class="flex gap-4 items-center">
                  <div class="hover:cursor-pointer p-3 bg-primary rounded-2xl" @click="$router.back()">
                      <ArrowLeft stroke-width="1" class="w-8 h-8" />
                  </div>
                  <div>
                      <h1 class="text-3xl font-black tracking-tighter leading-none">
                          <span class="text-primary italic">Modifier un utilisateur</span>
                      </h1>
                      <p class="text-muted-foreground text-sm font-medium mt-1 italic">Modifiez les informations de l'utilisateur avec précision.</p>
                  </div>
              </div>
            </template>
        </CompositionPageHeader>
        <UserFormView
          :initial-data="user"
          :is-editing="true"
          v-model:is_loading="isUpdateProfiling"
          :handleSubmit="handleSubmit"
        />
    </div>
</template>