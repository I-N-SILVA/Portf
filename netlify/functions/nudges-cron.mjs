// Netlify scheduled function — runs the hourly nudge evaluation.
//
// The evaluation itself lives in the Next.js route at /api/cron/nudges (it
// needs the Supabase service client and the app's own libraries). This
// function is just the scheduler: Netlify has no equivalent of vercel.json
// `crons`, so the trigger has to live here.
//
// Environment variables (Netlify → Site settings → Environment variables):
//   CRON_SECRET – same value the route checks; sent as a bearer token.
//   URL         – set by Netlify automatically to the site's primary URL.

export const config = {
  schedule: "0 * * * *", // hourly, on the hour (UTC)
};

export default async () => {
  const base = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) {
    console.error("nudges-cron: no site URL available; skipping");
    return new Response("no site url", { status: 500 });
  }

  const headers = {};
  if (process.env.CRON_SECRET) {
    headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;
  }

  const res = await fetch(`${base}/api/cron/nudges`, { headers });
  const body = await res.text();

  if (!res.ok) {
    console.error(`nudges-cron: ${res.status} ${body}`);
    return new Response(body, { status: res.status });
  }

  console.log(`nudges-cron: ${body}`);
  return new Response(body, { status: 200 });
};
