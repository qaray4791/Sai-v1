var roleWorker = require('role.worker');
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

    var numberExtensions = roomName.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION);
        }
    });

    for (let spawn of spawns) {
        var spawnName = spawn.name;
        // simply here to prove it's working
        console.log('Room Name: ' + roomName.name + ' -- RCL: ' + roomControllerLevel + ' -- Spawn Name: ' + spawnName + ' -- Ext: ' + numberExtensions.length + ' -- Tick: ' + Game.time);
    }

    // Detect hostile creeps in room and raise the alarm
    var enemyAtTheGate = roomName.find(FIND_HOSTILE_CREEPS);
    if (enemyAtTheGate.length > 0) {
        console.log('There are ' + enemyAtTheGate.length + ' enemies at the gate!');
    }

    // find things that need energy
    var taskStructures = roomName.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    // find things that need to be built
    var taskSites = roomName.find(FIND_CONSTRUCTION_SITES);

    // find things that need repair
    var taskRepairs = roomName.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    });
    taskRepairs.sort((a, b) => a.hits - b.hits);

    console.log('----TASKS----');
    console.log('Needs Energy: ' + taskStructures.length);
    console.log('Needs Repair: ' + taskRepairs.length);
    console.log('Needs Built: ' + taskSites.length);   

    // Determine desired creep roles and number of each based on Room Controller Level

    // RC1: Build workers to fill spawn and get to RC2 as quickly as possible.
    if (roomControllerLevel == 1) {
        var desiredWorkers = 2;
        var desiredMiners = 0;
        var desiredHaulers = 0;
    }

    // RC2: Build extensions and then, once built, create miner and hauler
    if (roomControllerLevel == 2) {
        if (numberExtensions.length < 5) {
            var desiredWorkers = 4;
            var desiredMiners = 0;
            var desiredHaulers = 0;
        }
        if (numberExtensions.length == 5) {
            var desiredWorkers = 4;
            var desiredMiners = 1;
            var desiredHaulers = 1;
        }
    }

    // Spawn desired number of upgraders based on Room Controller Level
    var workers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');
    if (workers.length < desiredWorkers) {
        var newName = 'Worker' + Game.time;
        var canSpawnWorker = Game.spawns[spawnName].spawnCreep([WORK, CARRY, MOVE, MOVE], newName,
            { memory: { role: 'worker', dryRun: true } });
        if (canSpawnWorker == 0) {
            console.log('Spawning new worker: ' + newName);
            Game.spawns[spawnName].spawnCreep[WORK, CARRY, MOVE, MOVE], newName,
                { memory: { role: 'worker' } };
        }
    }

    // Spawn desired number of miners based on Room Controller Level
    // Confirms there are the desired number of workers built first
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    if (miners.length < desiredMiners &&
        workers.length == desiredWorkers) {
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
    // Confirms there are the desired number of miners and workers built first
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    if (haulers.length < desiredHaulers &&
        miners.length == desiredMiners &&
        workers.length == desiredWorkers) {
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
        if (creep.memory.role == 'worker') {
            roleWorker.run(creep);
        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
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
}