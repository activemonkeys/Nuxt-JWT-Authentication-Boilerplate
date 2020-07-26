export default function({ store, redirect, app }) {
  // If the user is not authenticated
  if (!app.$auth.user || !app.$auth.tokens) {
    return redirect("/login");
  }
}
