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

        for (let room in Game.rooms) {
            var roomName = Game.rooms[room];
            var roomControllerLevel = (roomName.controller.level);
        }

        var numberContainers = roomName.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER);
            }
        });

        // find things that need energy
        var targetStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    // structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        // find things that need to be built
        var targetSites = creep.room.find(FIND_CONSTRUCTION_SITES);

        // find things that need repair
        var targetRepairs = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });
        targetRepairs.sort((a, b) => a.hits - b.hits);

        // console.log('----TASKS----');
        // console.log('Needs Energy: ' + targetStructures.length);
        // console.log('Needs Repair: ' + targetRepairs.length);
        // console.log('Needs Built: ' + targetSites.length);      

        if (creep.memory.working) {

            // if things need energy go fill them
            if (targetStructures.length) {
                console.log(creep.name + ' is filling things');
                if (creep.transfer(targetStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetStructures[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }

            // if things need repair go repair them
            if (!targetStructures.length && targetRepairs.length) {
                console.log(creep.name + ' is repairing things');
                if (creep.repair(targetRepairs[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetRepairs[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }

            // if things need building go build them
            if (!targetStructures.length && !targetRepairs.length && targetSites.length) {
                console.log(creep.name + ' is building things // progress: ' + targetSites[0].progress + '/' + targetSites[0].progressTotal);
                if (creep.build(targetSites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }

            // if there are no tasks go upgrade the controller
            if (!targetStructures.length && !targetRepairs.length && !targetSites.length) {
                console.log(creep.name + ' is upgrading controller');
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });

                }
            }
        }

        // if there are no tasks and creep has no energy to upgrade controller it goes to harvest
        else {
            if (creep.spawning) {
                console.log(creep.name + ' is spawning');
            }
            else {
                if (!numberContainers.length) {
                    var sources = creep.pos.findClosestByPath(FIND_SOURCES);
                    console.log(creep.name + ' is harvesting from source');
                    if (creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
                else {
                    var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER &&
                                structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
                        }
                    });
                    console.log(creep.name + ' is harvesting from container');
                    if (creep.withdraw(container) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
                
            }
        }
    }
};

module.exports = roleWorker;