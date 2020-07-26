export const state = () => ({
  user: null,
  tokens: null
});

export const getters = {
  getUser(state) {
    return state.user;
  },
  getTokens(state) {
    return state.tokens;
  }
};

export const mutations = {
  setTokens(state, payload) {
    state.tokens = payload;
  },
  setUser(state, payload) {
    state.user = payload;
  },
  // remove data from store
  resetJWT(state) {
    state.user = null;
    state.tokens = null;

    if (process.env.NODE_ENV === "development")
      this.$cookies.remove("refresh_token");
  },
  saveRefreshToken(state, payload) {
    // set refresh token to cookie
    if (process.env.NODE_ENV === "development")
      this.$cookies.set("refresh_token", payload, {
        maxAge: 60 * 60 * 24
      });
  }
};

export const actions = {
  // set tokens and refresh token and get fetch user
  async initializeAuth({ commit, dispatch, getters }, payload) {
    const accessToken = payload?.data?.data?.access_token;
    const refreshToken = payload?.data?.data?.refresh_token;

    if (!accessToken || !refreshToken) return;

    commit("setTokens", {
      access: accessToken,
      refresh: refreshToken
    });

    await dispatch("fetchUser");
    // save refresh token to cookie
    commit("saveRefreshToken", refreshToken);
  },
  async login({ commit, dispatch }, payload) {
    const jwt = await this.$axios.post("/login", payload);
    await dispatch("initializeAuth", jwt);

    return jwt;
  },
  async refresh({ commit, dispatch }) {
    const jwt = await this.$axios.post("/refresh-token");

    await dispatch("initializeAuth", jwt);
    return jwt;
  },
  async logout({ commit }) {
    await this.$axios.post("/logout");
    this.$cookies.remove("refresh_token");

    return commit("resetJWT");
  },
  async fetchUser({ commit, getters }) {
    // set token in header
    this.$axios.setToken(getters.getTokens.access, "Bearer");
    // get /me
    const me = await this.$axios.get("/me");
    if (me) commit("setUser", me.data.data);

    return me;
  }
};
