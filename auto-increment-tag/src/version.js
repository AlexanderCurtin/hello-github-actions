export const bump = {
    major: 'major',
    minor: 'minor',
    patch: 'patch'
}

const VersionBumpMap = {
    [bump.major]: ([x]) => [x + 1, 0, 0],
    [bump.minor]: ([x, y]) => [x, y + 1, 0],
    [bump.patch]: ([x, y, z]) => [x, y, z + 1]
};

export const parseVersion = (tag) => {
    if (!tag.match(/^\d+(.\d+){2}$/)) {
        throw Error("not valid Tag");
    }

    return tag.split('.').map(x => parseInt(x, 10));
}


export const bumpVersion = (bumpType, version) => VersionBumpMap[bumpType](version);