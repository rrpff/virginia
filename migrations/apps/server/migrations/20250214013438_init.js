"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    down: function() {
        return down;
    },
    up: function() {
        return up;
    }
});
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _tagged_template_literal(strings, raw) {
    if (!raw) {
        raw = strings.slice(0);
    }
    return Object.freeze(Object.defineProperties(strings, {
        raw: {
            value: Object.freeze(raw)
        }
    }));
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
function _templateObject() {
    var data = _tagged_template_literal([
        '\n    CREATE TABLE "Feed" (\n        "id" TEXT NOT NULL PRIMARY KEY\n      , "name" TEXT\n      , "iconUrl" TEXT\n    );\n  '
    ]);
    _templateObject = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject1() {
    var data = _tagged_template_literal([
        '\n    CREATE TABLE "Source" (\n        "id" TEXT NOT NULL PRIMARY KEY\n      , "feedId" TEXT NOT NULL\n      , "url" TEXT NOT NULL\n      , "name" TEXT\n      , "iconUrl" TEXT\n      , "lastId" TEXT\n      , "lastHash" TEXT\n      , "insertedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n      , "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n      , CONSTRAINT "Source_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE CASCADE ON UPDATE CASCADE\n    );\n  '
    ]);
    _templateObject1 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject2() {
    var data = _tagged_template_literal([
        '\n    CREATE TABLE "Item" (\n        "id" TEXT NOT NULL PRIMARY KEY\n      , "sourceId" TEXT NOT NULL\n      , "url" TEXT NOT NULL\n      , "title" TEXT NOT NULL\n      , "description" TEXT\n      , "imageUrl" TEXT\n      , "timestamp" DATETIME NOT NULL\n      , CONSTRAINT "Item_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE\n    );\n  '
    ]);
    _templateObject2 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject3() {
    var data = _tagged_template_literal([
        '\n    CREATE TABLE "Category" (\n        "id" TEXT NOT NULL PRIMARY KEY\n      , "name" TEXT NOT NULL\n      , "vanity" TEXT NOT NULL\n      , "icon" TEXT NOT NULL\n      , "position" INTEGER NOT NULL\n    );\n  '
    ]);
    _templateObject3 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject4() {
    var data = _tagged_template_literal([
        '\n    CREATE TABLE "_CategoryToFeed" (\n        "A" TEXT NOT NULL\n      , "B" TEXT NOT NULL\n      , CONSTRAINT "_CategoryToFeed_A_fkey" FOREIGN KEY ("A") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE\n      , CONSTRAINT "_CategoryToFeed_B_fkey" FOREIGN KEY ("B") REFERENCES "Feed" ("id") ON DELETE CASCADE ON UPDATE CASCADE\n    );\n  '
    ]);
    _templateObject4 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject5() {
    var data = _tagged_template_literal([
        '\n    CREATE UNIQUE INDEX "_CategoryToFeed_AB_unique" ON "_CategoryToFeed" ("A", "B");\n  '
    ]);
    _templateObject5 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject6() {
    var data = _tagged_template_literal([
        '\n    CREATE INDEX "_CategoryToFeed_B_index" ON "_CategoryToFeed" ("B");\n  '
    ]);
    _templateObject6 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject7() {
    var data = _tagged_template_literal([
        'DROP TABLE "Item";'
    ]);
    _templateObject7 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject8() {
    var data = _tagged_template_literal([
        'DROP TABLE "Source";'
    ]);
    _templateObject8 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject9() {
    var data = _tagged_template_literal([
        'DROP TABLE "Feed";'
    ]);
    _templateObject9 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject10() {
    var data = _tagged_template_literal([
        'DROP TABLE "Category";'
    ]);
    _templateObject10 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject11() {
    var data = _tagged_template_literal([
        'DROP TABLE "_CategoryToFeed";'
    ]);
    _templateObject11 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject12() {
    var data = _tagged_template_literal([
        'DROP INDEX "_CategoryToFeed_AB_unique";'
    ]);
    _templateObject12 = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject13() {
    var data = _tagged_template_literal([
        'DROP INDEX "_CategoryToFeed_B_index";'
    ]);
    _templateObject13 = function _templateObject() {
        return data;
    };
    return data;
}
var sql = function(t) {
    var _t_;
    return (_t_ = t[0]) !== null && _t_ !== void 0 ? _t_ : "";
};
function up(knex) {
    return _up.apply(this, arguments);
}
function _up() {
    _up = _async_to_generator(function(knex) {
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        knex.raw(sql(_templateObject()))
                    ];
                case 1:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject1()))
                    ];
                case 2:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject2()))
                    ];
                case 3:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject3()))
                    ];
                case 4:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject4()))
                    ];
                case 5:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject5()))
                    ];
                case 6:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject6()))
                    ];
                case 7:
                    _state.sent();
                    return [
                        2
                    ];
            }
        });
    });
    return _up.apply(this, arguments);
}
function down(knex) {
    return _down.apply(this, arguments);
}
function _down() {
    _down = _async_to_generator(function(knex) {
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        knex.raw(sql(_templateObject7()))
                    ];
                case 1:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject8()))
                    ];
                case 2:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject9()))
                    ];
                case 3:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject10()))
                    ];
                case 4:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject11()))
                    ];
                case 5:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject12()))
                    ];
                case 6:
                    _state.sent();
                    return [
                        4,
                        knex.raw(sql(_templateObject13()))
                    ];
                case 7:
                    _state.sent();
                    return [
                        2
                    ];
            }
        });
    });
    return _down.apply(this, arguments);
}
