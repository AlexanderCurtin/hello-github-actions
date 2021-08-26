/* This is a derivative work of https://github.com/jimschubert/query-tag-action by Jim Schubert */

const github = require('@actions/github');
const core = require('@actions/core');
const cliHelpers = require('./cli-helpers');
const {bumpVersion, parseVersion, bump} = require('./version.js');



const getBumpFromLabels = (labels) => {
    if (labels.includes(bump.major)) {
        return bump.major;
    }
    if (labels.includes(bump.minor)) {
        return bump.minor;
    }
    return bump.patch;
}

const getLabelsForCommit = async (octokit, commit_sha) => {
    const prs = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        commit_sha
    }).then(x => x.data);
    return prs.filter(x => x.merge_commit_sha == commit_sha)
        .flatMap(x => x.labels)
        .flatMap(x => x.name)
        .filter(n => !!n);
}


// We're not skipping this
const run = async () => {
    core.info('running');
    await cliHelpers.fetchAllTags();
    if (await cliHelpers.isTagged()) {
        core.error("This commit is already tagged. Do it manually if need be");
        throw Error("Already Tagged");
    }

    const previousTag = await cliHelpers.previousTag();
    core.info(`Bumping from previous tag: ${previousTag}`);

    const token = core.getInput('git-token');

    const octokit = github.getOctokit(token);

    const labels = await getLabelsForCommit(octokit, github.context.sha);

    const bumpType = getBumpFromLabels(labels);

    const previousVersion = parseVersion(previousTag);
    const version = bumpVersion(bumpType, previousVersion);

    await octokit.rest.git.createRef({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: `refs/tags/${version.join('.')}`,
        sha: github.context.sha
    });
}
run().catch(err => { console.log(err); core.setFailed(err); core.error(err); });