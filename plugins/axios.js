export default function({ $axios, redirect, app }) {
  $axios.onRequest(config => {
    if (app.$auth && app.$auth.token) {
      config.headers.Authorization = `Bearer ${app.$auth.token}`;
    }
    console.log("Making request to " + config.url);
  });

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    if (code === 400) {
      redirect("/400");
    }
  });
}
