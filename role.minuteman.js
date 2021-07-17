var roleMinuteman = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.ticksToLive < 10) {
            creep.say('Death: ' + creep.ticksToLive);
        }

        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (creep.memory.attacking && !closestHostile) {
            creep.memory.attacking = false;
            creep.say('☮︎ peace');
        }
        if (!creep.memory.attacking && closestHostile) {
            creep.memory.attacking = true;
            creep.say('⚔️ attack')
        }

        if (closestHostile) {
            console.log(creep.name + ' is attacking hostile');
            
            if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile);
            }
        }
        else {
            console.log(creep.name + ' is standing down')
            creep.moveTo(Game.flags.Flag1, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }

};

module.exports = roleMinuteman;