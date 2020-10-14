import https from "https";

export default function({ $axios, redirect, app, error, route }) {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  $axios.onRequest(config => {
    if (process.env.NODE_ENV === "development") {
      // allowed to use local API
      config.httpsAgent = agent;
    }

    // if (!process.server)
    //   $axios.setHeader("Accept-Language", app.i18n?.locale || "en");
  });

  $axios.onResponseError(async err => {
    const code = parseInt(err?.response?.status);
    const statusText = parseInt(err?.response?.statusText);

    const originalRequest = err.config;

    if (
      code === 401 &&
      !originalRequest._retry &&
      err.config.url !== "refresh-token" &&
      err.config.url !== "login"
    ) {
      originalRequest._retry = true;

      try {
        await app.$auth.refresh();
        return $axios(originalRequest);
      } catch (e) {
        redirect("/login");
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  });
}
