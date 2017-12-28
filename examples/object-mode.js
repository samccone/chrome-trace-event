/*
 * Show that `{objectMode: true}` is available on a Tracer
 * to get raw JSON event object output.
 */

var evt = new (require("../lib/trace-event")).Tracer({ objectMode: true });
evt.on("data", function(ev) {
  console.log('EVENT (type "%s"): %j', typeof ev, ev);
});

evt.begin({ name: "doSomething", id: "abc" });
evt.end({ name: "doSomething", id: "abc" });
