import cmd from 'child_process';
const cmdPromise = (command) => new Promise((res, rej) => {
    cmd.exec(command, (err, stdout, stderr) => {
        if (err) {
            rej(new Error(stderr));
        }
        res(stdout);
    })
});

export const fetchAllTags = () => cmdPromise("git fetch --prune --tags");
export const isTagged = () => cmdPromise("git describe --exact").then(_ => true).catch(_ => false);
export const previousTag = () => cmdPromise("git describe --tags --abbrev=0").then(x => x.trim());
