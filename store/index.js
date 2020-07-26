export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async nuxtServerInit({ commit, dispatch }, { req, app }) {
    let redirectPath =
      route.path === "/" ? "/login" : `/login?redirect=${route.path}`;

    if (process.server && (!app.$auth.user || !app.$auth.tokens)) {
      try {
        await this.$auth.refresh();
      } catch (e) {
        this.$auth.resetJWT();
        return this.$router.push(redirectPath);
      }
    }
  }
};
