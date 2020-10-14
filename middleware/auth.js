export default function({ store, redirect, app, error }) {
  if (!app.$auth.user || !app.$auth.isAuthenticated) {
    return error({ statusCode: 403 });
  }
}
