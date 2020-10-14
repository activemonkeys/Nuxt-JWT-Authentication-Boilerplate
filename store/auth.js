export const state = () => ({
  isAuthenticated: false,
  user: null
});

export const getters = {
  getUser(state) {
    return state.user;
  }
};

export const mutations = {
  authenticate(state, payload) {
    state.isAuthenticated = payload;
  },

  setUser(state, payload) {
    state.user = payload;
  },

  // remove data from store
  resetJWT(state) {
    // state.user = null
    state.isAuthenticated = false;

    if (process.env.NODE_ENV !== "production") {
      this.$cookies.remove("access_token");
      this.$cookies.remove("refresh_token");
    }
  },

  syncTokens(
    state,
    { access, refresh, expires_in, rt_expires_in, token_type }
  ) {
    if (process.client && process.env.NODE_ENV !== "production") {
      this.$cookies.set("refresh_token", refresh, {
        maxAge: this.$cookies.get("remember_me") ? rt_expires_in : undefined,
        path: "/"
      });

      this.$cookies.set("access_token", access, {
        maxAge: expires_in,
        path: "/"
      });
    }

    if (process.server) {
      this.$axios.setToken(access, token_type);
      this.$cookies.set("refresh_token", refresh, {
        maxAge: this.$cookies.get("remember_me") ? rt_expires_in : undefined,
        domain:
          process.env.NODE_ENV === "production" ? ".laradev.xyz" : undefined,
        path: "/",
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production"
      });

      this.$cookies.set("access_token", access, {
        maxAge: expires_in,
        domain:
          process.env.NODE_ENV === "production" ? ".laradev.xyz" : undefined,
        path: "/",
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production"
      });
    }
  }
};

export const actions = {
  async login({ commit, dispatch, getters }, payload) {
    const {
      data: {
        access_token,
        refresh_token,
        expires_in,
        rt_expires_in,
        token_type
      }
    } = await this.$axios.$post("login", payload);

    if (payload.remember_me && process.env.NODE_ENV !== "production")
      this.$cookies.set("remember_me", 1, {
        maxAge: 60 * 60 * 24 * 30
      });

    if (!access_token || !refresh_token) return;

    commit("syncTokens", {
      access: access_token,
      refresh: refresh_token,
      expires_in,
      rt_expires_in,
      token_type
    });

    await dispatch("fetchUser");
  },

  async refresh({ commit, dispatch, getters, state }, fetchUser = false) {
    try {
      const refreshToken = this.$cookies.get("refresh_token");

      if (!refreshToken) return Promise.reject();

      const {
        data: {
          access_token,
          refresh_token,
          expires_in,
          rt_expires_in,
          token_type
        }
      } = await this.$axios.$post("refresh-token", {
        refresh_token: refreshToken
      });

      if (!access_token || !refresh_token) return;

      commit("syncTokens", {
        access: access_token,
        refresh: refresh_token,
        expires_in,
        rt_expires_in,
        token_type
      });

      if (fetchUser) await dispatch("fetchUser");
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async logout({ commit }) {
    try {
      await this.$axios.post("logout");
    } catch (e) {}

    commit("resetJWT");

    this.$router.go("/login");
  },

  async fetchUser(
    { state, commit, getters, dispatch, rootState },
    withPortrait
  ) {
    // get /me
    let me = await this.$axios.get("me");

    if (Object.keys(this.$util.settings)?.length === 0)
      try {
        await this.$util.fetchSettings();
      } catch (e) {}

    if (me) {
      const { permissions, roles, config, user } = me.data.data;
      const _permissions = permissions.reduce(
        (obj, perm) => ({ ...obj, [perm]: true }),
        {}
      );
      const _roles = roles.reduce(
        (obj, role) => ({ ...obj, [role]: true }),
        {}
      );

      const _config = {
        ...config,
        school_env_data:
          this.$util.settings.school_types?.find(
            type => type.id === config.school_env
          )?.data || ""
      };

      commit("setUser", {
        ...me.data.data,
        permissions: _permissions,
        config: _config,
        roles: _roles
      });
      commit("authenticate", true);

      let portrait = getters.getUser?.user?.portrait || "";

      try {
        if (withPortrait && user.portrait_url) {
          let portraitRes = await this.$axios.get(
            `users/${this.$auth.user?.user?.id}/portrait`,
            {
              responseType: "arraybuffer"
            }
          );

          portrait = this.$image.decode(portraitRes);

          await this.$auth.setUser({
            ...this.$auth.user,
            portrait
          });
        }
      } catch (e) {}
    }

    return me;
  }
};
