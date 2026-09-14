# Sal's Pass — hosted questionnaire

Everyone with the link sees and edits the same master answer set.
Answers are stored in a Redis database attached to the Vercel project.

## Deploy (one time, ~10 min)

1. From this folder:
       npm i -g vercel
       vercel --prod
   Accept the defaults. (Or push the folder to a Git repo and import it
   at vercel.com/new.)

2. In the Vercel dashboard -> this project -> **Storage** ->
   **Create Database** -> **Upstash Redis** (Marketplace) -> connect it.
   That auto-injects the KV_REST_API_URL / KV_REST_API_TOKEN env vars.

3. Redeploy: `vercel --prod` (or the Redeploy button).

4. Recommended: Settings -> Environment Variables -> add ACCESS_KEY
   with any string (e.g. mgmtnation26), redeploy, and share the link as
       https://your-app.vercel.app/?k=mgmtnation26
   Without the key the page loads but can't read or write answers.

## Day to day

- Send Alan the link. His (and Sal's) responses save automatically,
  stamped with name + time; the page also pulls in new answers every
  20 seconds, so you can watch live from the same link.
- Your view IS the master record — open the link any time to see
  everything; "Review & send" compiles it into one copyable block.
- Reset: delete the `sal-pass-master-v1` key in the Upstash console.
