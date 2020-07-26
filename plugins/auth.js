export default ({ app, store }, inject) => {
  inject("auth", {
    // auth
    async login(payload) {
      return await store.dispatch("auth/login", payload);
    },
    async logout() {
      return await store.dispatch("auth/logout");
    },
    async refresh() {
      return await store.dispatch("auth/refresh");
    },
    // computed
    get tokens() {
      return store.getters["auth/getTokens"];
    },
    get user() {
      return store.getters["auth/getUser"];
    },
    async setUser(payload) {
      return await store.commit("auth/setUser", payload);
    },
    async resetJWT(payload) {
      return await store.commit("auth/resetJWT", payload);
    }
  });
};
