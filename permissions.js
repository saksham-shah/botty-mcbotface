var permText = {
    ADMIN: 'Full admin',
    SERVER: 'Server admin',
    MUSIC: 'Manage music',
    NOTES: 'Manage notes',
    GIVE: 'Give roles'
}

module.exports = { permText, getPermNum, getPerms, all, any };

var permissions = {};
var counter = 1;
for (var perm in permText) {
    permissions[perm] = counter;
    counter *= 2;
}

function getPermNum() {
    var num = 0;
    for (var perm of arguments) {
        if (!permissions[perm]) continue;
        num |= permissions[perm];
    }
    return num;
}

function getPerms(num) {
    var perms = [];
    for (var perm in permissions) {
        if (num & permissions[perm]) {
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