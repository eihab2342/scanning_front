/** A plain top-level redirect helper — Stripe Checkout/Portal URLs are full-page navigations, never client-side routes. */
export function redirectTo(url: string): void {
  window.location.href = url;
}
