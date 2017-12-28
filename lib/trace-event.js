/**
 * trace-event - A library to create a trace of your node app per
 * Google's Trace Event format:
 * // JSSTYLED
 *      https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU
 */

var assert = require("assert-plus");
var stream = require("stream");
var util = require("util");
// ---- internal support stuff

function evCommon() {
  var hrtime = process.hrtime(); // [seconds, nanoseconds]
  var ts = hrtime[0] * 1000000 + Math.round(hrtime[1] / 1000); // microseconds
  return {
    ts,
    pid: process.pid,
    tid: process.pid // no meaningful tid for node.js
  };
}

// ---- Tracer

class Tracer extends stream.Readable {
  constructor(opts = {}) {
    super();
    assert.object(opts, "opts");
    assert.optionalObject(opts.parent, "opts.parent");
    assert.optionalObject(opts.fields, "opts.fields");
    assert.optionalBool(opts.objectMode, "opts.objectMode");

    this.parent = opts.parent;

    if (this.parent) {
      this.fields = Object.assign({}, opts.parent.fields);
    } else {
      this.fields = {};
    }
    if (opts.fields) {
      Object.assign(this.fields, opts.fields);
    }
    if (!this.fields.cat) {
      // trace-viewer *requires* `cat`, so let's have a fallback.
      this.fields.cat = "default";
    } else if (Array.isArray(this.fields.cat)) {
      this.fields.cat = this.fields.cat.join(",");
    }
    if (!this.fields.args) {
      // trace-viewer *requires* `args`, so let's have a fallback.
      this.fields.args = {};
    }

    if (this.parent) {
      // TODO: Not calling Readable ctor here. Does that cause probs?
      //      Probably if trying to pipe from the child.
      //      Might want a serpate TracerChild class for these guys.
      this._push = this.parent._push.bind(this.parent);
    } else {
      this._objectMode = Boolean(opts.objectMode);
      var streamOpts = { objectMode: this._objectMode };
      if (this._objectMode) {
        this._push = this.push;
      } else {
        this._push = this._pushString;
        streamOpts.encoding = "utf8";
      }

      stream.Readable.call(this, streamOpts);
    }
  }

  _read(size) {}

  _pushString(ev) {
    if (!this.firstPush) {
      this.push("[");
      this.firstPush = true;
    }
    this.push(JSON.stringify(ev, "utf8") + ",\n", "utf8");
  }

  // TODO Perhaps figure out getting a trailing ']' without ',]' if helpful.
  //Tracer.prototype._flush = function _flush() {
  //    if (!this._objectMode) {
  //        this.push(']')
  //    }
  //};

  child(fields) {
    return new Tracer({
      parent: this,
      fields: fields
    });
  }

  begin(...args) {
    return this.mkEventFunc("b")(...args);
  }

  instant(...args) {
    return this.mkEventFunc("n")(...args);
  }

  end(...args) {
    return this.mkEventFunc("e")(...args);
  }

  mkEventFunc(ph) {
    return fields => {
      var ev = evCommon();
      ev.ph = ph;
      for (const k of Object.keys(this.fields)) {
        ev[k] = this.fields[k];
      }

      if (fields) {
        if (typeof fields === "string") {
          ev.name = fields;
        } else {
          for (const k of Object.keys(fields)) {
            ev[k] = fields[k];
          }

          if (fields.cat) {
            ev.cat = fields.cat.join(",");
          }
        }
      }
      this._push(ev);
    };
  }
}

/*
 * These correspond to the "Async events" in the Trace Events doc.
 *
 * Required fields:
 * - name
 * - id
 *
 * Optional fields:
 * - cat (array)
 * - args (object)
 * - TODO: stack fields, other optional fields?
 *
 * Dev Note: We don't explicitly assert that correct fields are
 * used for speed (premature optimization alert!).
 */

module.exports.Tracer = Tracer;
