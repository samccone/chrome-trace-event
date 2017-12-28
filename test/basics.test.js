/*
 * Catch all test file for trace-event.
 */

var test = require("tape");
var trace_event = require("../lib/trace-event");

// --- Tests
test("exports", function(t) {
  t.ok(new trace_event.Tracer(), "");
  t.end();
});
