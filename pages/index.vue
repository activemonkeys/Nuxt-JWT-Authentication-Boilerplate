<template>
  <div class="w-full h-screen flex items-center justify-center bg-gray-800">
    <div class="max-w-sm rounded overflow-hidden shadow-lg">
      <div class="px-6 py-4">
        <div class="text-white font-bold text-xl mb-2">The Coldest Sunset</div>
        <p class="text-white text-base">{{ JSON.stringify($auth.user) }}</p>
      </div>
      <div class="px-6 py-4">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          @click="onLogout"
        >Logout</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: ["auth"],
  methods: {
    async onLogout() {
      try {
        await this.$auth.logout();
        this.$router.push("/login");
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<style>
</style>
