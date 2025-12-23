<script setup lang="ts">
  import Tabs from '@/components/ui/tabs/Tabs.vue';
  import TabsList from '@/components/ui/tabs/TabsList.vue';
  import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue';
  import Button from '@/components/ui/button/Button.vue';
  import TabsContent from '@/components/ui/tabs/TabsContent.vue';
</script>

<template>
  <div class="card border-border overflow-hidden ">
    <div class="border-b border-border p-3 bg-background">
      <div class="flex justify-between items-center">
        <p class="text-sm font-semibold text-text">Edition image</p>
        <Button size="sm">Appliquer</Button>
      </div>
    </div>

    <Tabs default-value="left11" class="flex flex-col md:grid md:grid-cols-12 min-h-[400px]">
      <div class="border-b md:border-b-0 md:border-r border-border bg-muted/20 md:col-span-2 lg:col-span-1">
        <TabsList class="flex flex-row md:flex-col justify-start h-auto p-2 bg-transparent space-x-2 md:space-x-0 md:space-y-2">
          <TabsTrigger class="flex-1 md:w-full justify-center md:justify-start" value="left11">lt11</TabsTrigger>
          <TabsTrigger class="flex-1 md:w-full justify-center md:justify-start" value="left12">lt12</TabsTrigger>
          <TabsTrigger class="flex-1 md:w-full justify-center md:justify-start" value="left13">lt13</TabsTrigger>
          <TabsTrigger class="flex-1 md:w-full justify-center md:justify-start" value="left14">lt14</TabsTrigger>
        </TabsList>
      </div>
      <div class="md:col-span-10 lg:col-span-11">
        <TabsContent
          v-for="i in [11, 12, 13, 14]"
          :key="i"
          :value="'left' + i"
          class="m-0 h-full focus-visible:outline-none"
        >
          <div class="grid grid-cols-1 md:grid-cols-7 h-full">
            <div class="col-span-1 md:col-span-2 border-b md:border-b-0 md:border-r border-border p-4">
              <span class="text-xs uppercase text-muted-foreground font-bold">Réglages {{ i }}</span>
              <div class="mt-4">middle{{ i }}</div>
            </div>

            <div class="col-span-1 md:col-span-5 p-4 bg-muted/5 flex items-center justify-center">
              middle2
            </div>
          </div>
        </TabsContent>
      </div>

    </Tabs>
  </div>
</template>
