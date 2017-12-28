/*
 * Show `evt.child()` usage for more practical usage. `.child(fields)`
 * allows you to bind common fields to emited events.
 */

var fs = require("fs");

var EVT = new (require("../lib/trace-event")).Tracer();
EVT.pipe(process.stdout);

function doSubTaskA(opts, cb) {
  var evt = EVT.child({ id: opts.id, name: "doSubTaskA" });
  evt.begin();
  setTimeout(function() {
    // ...
    evt.end();
    cb();
  }, Math.floor(Math.random() * 2000));
}

function doSomething(opts, cb) {
  var evt = EVT.child({ id: opts.id, name: "doSomething" });
  evt.begin();
  setTimeout(function() {
    // ...
    doSubTaskA(opts, function() {
      evt.end();
      cb();
    });
  }, Math.floor(Math.random() * 2000));
}

for (var i = 0; i < 5; i++) {
  doSomething({ id: i }, function() {});
}
