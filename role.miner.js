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
        if (!creep.memory.moving && creep.store.getFreeCapacity() > 0) {
            creep.memory.moving = true;
            creep.say('moving');
        }
        if (creep.memory.moving && creep.store.getFreeCapacity() == 0) {
            creep.memory.moving = false;
            creep.say('here');
        }

        // console.log(creep.memory.moving);

        if (creep.memory.moving) {
            var sources = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        else {
            var canBuildContainer = creep.pos.createConstructionSite(STRUCTURE_CONTAINER);

            if (canBuildContainer == -7) {
                if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.building = false;
                    creep.say('🔄 harvest');
                }
                if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
                    creep.memory.building = true;
                    creep.say('🚧 build');
                }
                console.log('building? ' + creep.memory.building);
                if (creep.memory.building) {
                    var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                    creep.build(target);
                }
                else {
                    var source = creep.pos.findClosestByPath(FIND_SOURCES);
                    creep.harvest(source);
                }
            }
        }
    }
}

module.exports = roleMiner;