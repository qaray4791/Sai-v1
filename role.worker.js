var roleWorker = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.ticksToLive < 10) {
            creep.say('💀 ' + creep.ticksToLive);
        }

        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('⚡ work');
        }

        if (creep.memory.working) {
            var targetStructures = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_CONTAINER ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            var targetSites = creep.room.find(FIND_CONSTRUCTION_SITES);
            var targetRepairs = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax
            });
            targetRepairs.sort((a, b) => a.hits - b.hits);
            
            console.log('targetStructures: ' + targetStructures.length);
            console.log('targetRepairs: ' + targetRepairs.length);
            console.log('targetSites: ' + targetSites.length);            

            if (targetStructures.length > 0) {
                if (creep.transfer(targetStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetStructures[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            if (targetStructures.length == 0 && targetRepairs.length) {
                if (creep.repair(targetRepairs[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetRepairs[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            if (targetStructures.length == 0 && !targetRepairs.length) {
                if (creep.build(targetSites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }            
            else {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
        else {
            var sources = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleWorker;