/* This is a derivative work of https://github.com/jimschubert/query-tag-action by Jim Schubert */

const cmd = require('child_process');
const { getSystemErrorMap } = require('util');
const github = require('@actions/github');
const core = require('@actions/core');
const { context } = require('./dist');

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
    const token = core.getInput('git-token');

    const octokit = github.getOctokit(token);
    console.log(github.context.sha);
    await octokit.rest.git.createRef({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: `refs/tags/${x}.${y}.${z}`,
        sha: github.context.sha
    })
}
console.log('cooool!!!!');
core.info("whaaaaat???");
core.error("The heck");
run().catch(err => { core.setFailed(); core.error(err); });