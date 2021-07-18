var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {

        for (let room in Game.rooms) {
            var roomName = Game.rooms[room];
        }

        if (creep.ticksToLive < 10) {
            creep.say('💀 ' + creep.ticksToLive);
        }

        // Find nearest source and move to it
        var sources = creep.pos.findClosestByPath(FIND_SOURCES);
        if (!creep.memory.moving && creep.harvest(sources) == ERR_NOT_IN_RANGE) {
            creep.memory.moving = true;
            creep.say('moving');
        }
        if (creep.memory.moving && creep.harvest(sources) == OK) {
            creep.memory.moving = false;
            creep.say('here');
        }

        if (creep.memory.moving) {
            console.log(creep.name + ' is moving to source');
            var sources = creep.pos.findClosestByPath(FIND_SOURCES);
            creep.moveTo(sources, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        else {
            // Build a container if there isn't already one there
            var canBuildContainer = creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);


            // If one is there, then work on building it, then filling it
            if (canBuildContainer == ERR_INVALID_TARGET && (target)) {
                if (creep.memory.waiting && creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.waiting = false;
                    creep.say('🔄 harvest');
                }
                if (!creep.memory.waiting && creep.store.getFreeCapacity() == 0) {
                    creep.memory.waiting = true;
                    creep.say('🚧 wait');
                }
                if (creep.memory.building) {
                    var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                    console.log(creep.name + ' is building container');
                    creep.build(target);
                }
                else {
                    var source = creep.pos.findClosestByPath(FIND_SOURCES);
                    console.log(creep.name + ' is harvesting source');
                    creep.harvest(source);
                }
            }
        }
    }
}

module.exports = roleMiner;