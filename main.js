module.exports.loop = function () {

    // Pick a room and place your spawn down. This is done manually for now.

    // Once you have placed a spwn, we figure out the Room Name, Room Controller Level, and Spawn Name
    for (let room in Game.rooms) {
        var roomName = Game.rooms[room];
        var roomControllerLevel = (roomName.controller.level);
    }
    
    var spawns = roomName.find(FIND_MY_SPAWNS, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_SPAWN);
        }
    });

    for (let spawn of spawns) {
        var spawnName = spawn.name;
        console.log('Room Name: ' + roomName.name + ' -- RCL: ' + roomControllerLevel + ' -- Spawn Name: ' + spawnName);
    }
}