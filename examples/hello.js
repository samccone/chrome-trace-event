/*
 * A first example showing trace-event usage.
 * We emit begin/end events for a single call to `doSomething()`.
 */

/*
 * First create the tracer `evt` that we'll use for instrumenting code.
 *
 * Notes:
 * - More realistically we'd stream these to an event log file (see
 *   examples/event-log.js). This just shows you the default output.
 * - By default the emitted 'data' events are make up a JSON array of
 *   event objects, suitable for piping directly to stdout or a file.
 *   This format is as expected by
 *   [`trace2html`](https://github.com/google/trace-viewer#readme).
 * - See examples/object-mode.js for raw event objects.
 * - See examples/child.js for a larger example.
 */
var evt = new (require("../lib/trace-event")).Tracer();

evt.on("data", function(data) {
  console.log("EVENT: %j", data);
});

// Instrument code with evt.{begin|instant|end} calls.
function doSomething(cb) {
  evt.begin({ name: "doSomething", id: "1" });
  // Takes 1s to do all this processing for "something".
  setTimeout(function() {
    evt.end({ name: "doSomething", id: "1" });
    cb();
  }, 1000);
}

console.log("hi");
doSomething(function() {
  console.log("bye");
});
