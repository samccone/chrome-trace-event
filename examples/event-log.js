/*
 * A simple example showing piping event traces to a 'events.log' file.
 *
 * Usage:
 *      $ node event-log.js
 *      hi
 *      bye
 *      $ cat events.log
 *      [{"ts":213699797444,"pid":42628,"tid":42628,"ph":"b","cat":"default","args":{},"name":"doSomething","id":"abc"},
 *      {"ts":213700798563,"pid":42628,"tid":42628,"ph":"e","cat":"default","args":{},"name":"doSomething","id":"abc"},
 */

var fs = require("fs");

var evt = new (require("../lib/trace-event")).Tracer();
evt.pipe(fs.createWriteStream("events.log"));
console.log('Streaming events to "events.log"');

// Instrument code with evt.{begin|instant|end} calls.
function doSomething(cb) {
  evt.begin({ name: "doSomething", id: "abc" });
  // Takes 1s to do all this processing for "something".
  setTimeout(function() {
    evt.end({ name: "doSomething", id: "abc" });
    cb();
  }, 1000);
}

console.log("hi");
doSomething(function() {
  console.log("bye");
});
