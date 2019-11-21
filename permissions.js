var permText = {
    ADMIN: 'Full admin',
    SERVER: 'Server admin',
    MUSIC: 'Manage music',
    NOTES: 'Manage notes'
}

var permNums = {};
var counter = 1;
for (var perm in permText) {
    permNums[perm] = counter;
    counter *= 2;
}

module.exports = { permText, permNums, getPermNum, getPerms, all, any };

function getPermNum() {
    var num = 0;
    for (var perm of arguments) {
        if (!permNums[perm]) continue;
        num |= permNums[perm];
    }
    return num;
}

function getPerms(num) {
    var perms = [];
    for (var perm in permNums) {
        if (num & permNums[perm]) {
            perms.push(perm);
        }
    }
    return perms;
}

function all(permsNeeded, permsHad) {
    if (permsNeeded instanceof Array) permsNeeded = getPermNum(...permsNeeded);
    if (permsHad instanceof Array) permsHad = getPermNum(...permsHad);
    return permsNeeded == (permsHad & permsNeeded);
}

function any(permsNeeded, permsHad) {
    if (permsNeeded instanceof Array) permsNeeded = getPermNum(permsNeeded);
    if (permsHad instanceof Array) permsHad = getPermNum(permsHad);
    return permsHad & permsNeeded > 0;
}