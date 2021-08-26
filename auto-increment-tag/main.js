/* This is a derivative work of https://github.com/jimschubert/query-tag-action by Jim Schubert */

const cmd = require('child_process');
const { getSystemErrorMap } = require('util');
const github = require('@actions/github');
const core = require('@actions/core');

const cmdPromise = (strCmd) => new Promise((res,rej) => {
    cmd.exec(strCmd, (err, stdout, stderr) => {
        if(err){
            rej(new Error(stderr));
        }
        res(stdout);
    })
});

// We're not skipping this
const run = async () => {
    core.info('running');
    await cmdPromise("git fetch --prune --unshallow");
    const isTagged = await cmdPromise("git describe --exact").then(_ => true).catch(_ => false);
    corel.info(isTagged);
    if(isTagged){
        core.error("This commit is already tagged. Do it manually if need be");
        throw Error("Already Tagged");
    }

    const previousTag = cmdPromise("git describe --tags --abbrev=0").then(x => x.trim());
    const isValidTag = !!previousTag.match(/^\d+(.\d+){2}$/);
    if(!isValidTag){
        throw Error("not valid Tag");
    }

    let [x, y, z] = previousTag.split('.').map(x=> parseInt(x,10));

    const isMinorBump = cmdPromise("git log HEAD -n 1  | grep -s '@minor'").then(_ => true).else(_ =>false);

    if(isMinorBump){
        z += 1;
    }
    else {
        x += 1;
    }
    const client = new github.Github(github.context.github.token);
    await client.git.createRef({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: `refs/tags/${x}.${y}.${z}`
    })
}
core.info("whaaaaat???");
core.error("The heck");
run();