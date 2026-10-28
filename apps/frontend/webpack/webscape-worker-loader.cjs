// webscape-wanderer spawns its worker with `new Worker(new URL(...).href)`.
// The trailing `.href` hides the worker from webpack, which then copies the
// worker file as a static asset without its imported chunks, so it 404s.
// Stripping `.href` lets webpack bundle the worker and its dependencies.
//
// This is a temporary workaround. A longer-term fix is to change the library
// itself to `new Worker(new URL(...), { type: "module" })` without the `.href`.
// Then this loader isn't needed.
module.exports = function webscapeWorkerLoader(source) {
  return source.replace(
    /new URL\(("worker-[\w-]+\.js"), import\.meta\.url\)\.href/g,
    "new URL($1, import.meta.url)",
  );
};
