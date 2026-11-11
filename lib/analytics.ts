/**
 * Umami Cloud: cookieless analytics, so no consent banner.
 *
 * The website ID is public by design (it ships in every page's HTML). The
 * script loads only in production builds, so local dev and tests don't
 * pollute the numbers.
 *
 * Clicks are tracked declaratively: any element with `data-umami-event`
 * becomes an event, and `data-umami-event-<key>` attributes become its
 * properties. Use `track()` to build those attributes.
 */
export const UMAMI = {
  script: "https://cloud.umami.is/script.js",
  websiteId: "0403fd75-b679-48cc-83f7-a1eb20d0f587",
  /** Origins the script loads from and reports to; mirrored in the CSP. */
  origins: ["https://cloud.umami.is", "https://gateway.umami.is"],
} as const;

export const ANALYTICS_ENABLED = process.env.NODE_ENV === "production";

/** Attributes that make an element report a click as a named Umami event. */
export function track(
  event: string,
  props: Record<string, string> = {},
): Record<string, string> {
  return {
    "data-umami-event": event,
    ...Object.fromEntries(
      Object.entries(props).map(([k, v]) => [`data-umami-event-${k}`, v]),
    ),
  };
}
