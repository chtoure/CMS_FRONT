<script setup lang="ts">
  import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue';
  import AlertDialogAction from '@/components/ui/alert-dialog/AlertDialogAction.vue';
  import AlertDialogCancel from '@/components/ui/alert-dialog/AlertDialogCancel.vue';
  import AlertDialogContent from '@/components/ui/alert-dialog/AlertDialogContent.vue';
  import AlertDialogDescription from '@/components/ui/alert-dialog/AlertDialogDescription.vue';
  import AlertDialogFooter from '@/components/ui/alert-dialog/AlertDialogFooter.vue';
  import AlertDialogHeader from '@/components/ui/alert-dialog/AlertDialogHeader.vue';
  import AlertDialogTitle from '@/components/ui/alert-dialog/AlertDialogTitle.vue';

  interface DialogProps {
    header: string;
    description: string;
    cancelText: string;
    actionText: string;
    open: boolean;
  }

  defineProps<DialogProps>();

  const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
    (e: 'update:open', value: boolean): void;
  }>();

</script>

<template>
  <AlertDialog :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ header }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          @click="emit('cancel')"
        >{{ cancelText }}</AlertDialogCancel>
        <AlertDialogAction
          @click="emit('confirm')"
        >{{ actionText }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
