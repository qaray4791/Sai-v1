var roleHauler = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.ticksToLive < 10) {
            creep.say('💀 ' + creep.ticksToLive);
        }

        if (creep.store.getFreeCapacity() > 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER);
                }
            });
            if (targets.length > 0) {
                console.log(creep.name + ' is withdrawing from container');
                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
        else {
            var energyDump = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if (energyDump.length > 0) {
                console.log(creep.name + ' is filling things');
                if (creep.transfer(energyDump[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyDump[0], { visualizePathStyle: { stroke: '#ffffff'} });
                }
            }
        }
    }
}

module.exports = roleHauler;