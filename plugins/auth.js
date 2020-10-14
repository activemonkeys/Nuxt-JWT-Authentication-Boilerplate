export default ({ app, store }, inject) => {
  inject("auth", {
    // auth
    async login(payload) {
      return await store.dispatch("auth/login", payload);
    },
    async logout() {
      return await store.dispatch("auth/logout");
    },
    async refresh(fetchUser = false) {
      return await store.dispatch("auth/refresh", fetchUser);
    },
    // computed
    get fullname() {
      return (
        store.getters["auth/getUser"].user?.identity?.full_name || "Unknown"
      );
    },
    get isAuthenticated() {
      return store.state.auth.isAuthenticated;
    },
    get user() {
      return store.getters["auth/getUser"];
    },
    async setUser(payload) {
      return await store.commit("auth/setUser", payload);
    },
    async fetchUser(payload = true) {
      return await store.dispatch("auth/fetchUser", payload);
    },
    syncTokens(payload) {
      return store.commit("auth/syncTokens", payload);
    },
    removeTokens() {
      app.$cookies.remove("access_token");
      app.$cookies.remove("refresh_token");
    },
    resetJWT(payload) {
      return store.commit("auth/resetJWT", payload);
    }
  });
};
