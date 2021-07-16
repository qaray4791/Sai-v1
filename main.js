module.exports.loop = function () {

    // Let's figure out the room name(s) and Room Controller Level of each
    for (var room in Game.rooms) {
        var roomName = Game.rooms[room];
        var roomControllerLevel = (roomName.controller.level);

        // We also want to know the spawn in the room
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
}