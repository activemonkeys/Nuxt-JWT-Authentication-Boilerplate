export const actions = {
  async nuxtServerInit(
    { commit, dispatch },
    {
      app,
      redirect,
      error,
      $auth,
      $axios,
      $util,
      $i18n,
      route,
      req,
      res,
      store
    }
  ) {
    if (!route.name) return error({ statusCode: 404 }); // routes not available

    const unprotectedRoutes = ["login", "register"]; // can be accessed only when unauthenticated

    const unprotectedAllowedRoutes = []; // can be accessed with or without authentication

    try {
      await $util.fetchSettings(); // fetch logo and school names....
    } catch (e) {}

    if (unprotectedAllowedRoutes.includes(route.name))
      return redirect(route.fullPath); // let them in

    let redirectPath = unprotectedRoutes.includes(route.name)
      ? route.fullPath
      : route.path === "/" || route.name === "login"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(route.fullPath)}`; // set redirect path

    const access = app.$cookies.get("access_token"); // get refresh token
    const refresh = app.$cookies.get("refresh_token"); // get refresh token

    if (!refresh) {
      app.$auth.removeTokens();
      return redirect(redirectPath);
    }

    if (access) {
      try {
        await app.$auth.fetchUser(true);
        if (unprotectedRoutes.includes(route.name)) return redirect("/");
        return;
      } catch (e) {}
    }

    // try to refresh
    try {
      await app.$auth.refresh(true);
      app.$auth.setImpersonate(false);
      if (unprotectedRoutes.includes(route.name)) return redirect("/");
    } catch (e) {
      // cannot refresh
      app.$auth.removeTokens();
      return redirect(redirectPath);
    }
  }
};
