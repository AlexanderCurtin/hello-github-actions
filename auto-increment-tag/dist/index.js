/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 852:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 691:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 669:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/* This is a derivative work of https://github.com/jimschubert/query-tag-action by Jim Schubert */

const cmd = __nccwpck_require__(129);
const { getSystemErrorMap } = __nccwpck_require__(669);
const github = __nccwpck_require__(691);
const core = __nccwpck_require__(852);

const cmdPromise = (strCmd) => new Promise((res, rej) => {
    cmd.exec(strCmd, (err, stdout, stderr) => {
        if (err) {
            rej(new Error(stderr));
        }
        res(stdout);
    })
});

// We're not skipping this
const run = async () => {
    core.info('running');
    await cmdPromise("git fetch --prune --tags");
    const isTagged = await cmdPromise("git describe --exact").then(_ => true).catch(_ => false);
    core.info(isTagged);
    if (isTagged) {
        core.error("This commit is already tagged. Do it manually if need be");
        throw Error("Already Tagged");
    }

    const previousTag = await cmdPromise("git describe --tags --abbrev=0").then(x => x.trim());
    core.info(previousTag);
    const isValidTag = !!previousTag.match(/^\d+(.\d+){2}$/);
    if (!isValidTag) {
        throw Error("not valid Tag");
    }

    let [x, y, z] = previousTag.split('.').map(x => parseInt(x, 10));

    const isMinorBump = await cmdPromise("git log HEAD -n 1  | grep -s '@minor'").then(_ => true).catch(_ => false);

    if (isMinorBump) {
        z += 1;
    }
    else {
        x += 1;
    }
    const client = new github.Github();
    await client.git.createRef({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: `refs/tags/${x}.${y}.${z}`
    })
}
console.log('cooool!!!!');
core.info("whaaaaat???");
core.error("The heck");
run().catch(err => { core.setFailed(); core.error(err); });
})();

module.exports = __webpack_exports__;
/******/ })()
;