var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');

module.exports.loop = function () {

    // Pick a room and place your spawn down. This is done manually for now.

    // Once you have placed a spawn, we figure out the Room Name, Room Controller Level, and Spawn Name
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
        // simply here to prove it's working
        console.log('Room Name: ' + roomName.name + ' -- RCL: ' + roomControllerLevel + ' -- Spawn Name: ' + spawnName + ' -- Tick: ' + Game.time);
    }

    // Detect hostile creeps in room and raise the alarm
    var enemyAtTheGate = roomName.find(FIND_HOSTILE_CREEPS);
    if (enemyAtTheGate.length > 0) {
        console.log('There are ' + enemyAtTheGate.length + ' enemies at the gate!');
    }


    // Clear dead creeps from memory
    if (Game.time % 100 == 0) {
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    // Determine desired creep roles and number of each based on Room Controller Level
    // RC1: We just want to start static mining and hauling
    if (roomControllerLevel == 1) {
        var desiredMiners = 3;
        var desiredHaulers = 1;
    }

    // Spawn desired number of miners based on Room Controller Level
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    if (miners.length < desiredMiners) {
        var newName = 'Miner' + Game.time;
        var canSpawnMiner = Game.spawns[spawnName].spawnCreep([WORK, WORK, CARRY, MOVE], newName,
            { memory: { role: 'miner', dryRun: true } });
        if (canSpawnMiner == 0) {
            console.log('Spawning new miner: ' + newName);
            Game.spawns[spawnName].spawnCreep[WORK, WORK, CARRY, MOVE], newName,
                { memory: { role: 'miner' } };
        }
    }

    // Spawn desired number of haulers based on Room Controller Level.
    // Confirms there are the desired number of miners built first
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    if (haulers.length < desiredHaulers && miners.length == desiredMiners) {
        var newName = 'Hauler' + Game.time;
        var canSpawnHauler = Game.spawns[spawnName].spawnCreep([WORK, CARRY, MOVE, MOVE], newName,
            { memory: { role: 'hauler', dryRun: true } });
        if (canSpawnHauler == 0) {
            console.log('Spawning new hauler: ' + newName);
            Game.spawns[spawnName].spawnCreep[WORK, CARRY, MOVE, MOVE], newName,
                { memory: { role: 'hauler' } };
        }
    }

    // Run role modules based on creeps memory.role value
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
    }
}