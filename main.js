var roleWorker = require('role.worker');
var roleUpgrader = require('role.upgrader');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
const roleMinuteman = require('role.minuteman');

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

    // Find how many extensions there are in the room
    var numberExtensions = roomName.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION);
        }
    });

    for (let spawn of spawns) {
        var spawnName = spawn.name;
        var spawnPos = spawn.pos;
        // simply here to prove it's working and debugging purposes if needed. Comment out when not needed. Probably not useful for multiple rooms due to how it would display.
        // TODO: Set this up in a way where user can input which room they want to view and debug when there are multiple rooms.
        console.log('-------------------------------------------------------------------------------');
        console.log('Room Name: ' + roomName.name + ' -- RCL: ' + roomControllerLevel + ' // ' 
        + roomName.controller.progress + '/' + roomName.controller.progressTotal 
        + ' -- Spawn Name: ' + spawnName + ' -- Ext: ' + numberExtensions.length + ' -- Tick: ' + Game.time);
    }

    // Detect hostile creeps in room and raise the alarm
    var enemyAtTheGate = roomName.find(FIND_HOSTILE_CREEPS);
    if (enemyAtTheGate.length > 0) {
        console.log('There are ' + enemyAtTheGate.length + ' enemies at the gate!');
        console.log('Rallying the troops!');
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

    // Display the number of each type of tasks
    console.log('----TASKS----');
    console.log('Needs Energy: ' + taskStructures.length);
    console.log('Needs Repair: ' + taskRepairs.length);
    console.log('Needs Built: ' + taskSites.length);
    console.log('----CREEPS----');

    // Determine desired creep roles and number of each based on Room Controller Level

    // RC1: Build workers to fill spawn and get to RC2 as quickly as possible.
    if (roomControllerLevel == 1) {
        var desiredWorkers = 2;
        var desiredMiners = 0;
        var desiredHaulers = 0;
    }

    // RC2
    // Construct extensions based on spawn position once you hit RC2
    if (roomControllerLevel > 1) {
        roomName.createConstructionSite(spawnPos.x, (spawnPos.y + 2), STRUCTURE_EXTENSION);
        roomName.createConstructionSite((spawnPos.x - 2), (spawnPos.y + 2), STRUCTURE_EXTENSION);
        roomName.createConstructionSite((spawnPos.x + 2), (spawnPos.y + 2), STRUCTURE_EXTENSION);
        roomName.createConstructionSite((spawnPos.x - 1), (spawnPos.y + 3), STRUCTURE_EXTENSION);
        roomName.createConstructionSite((spawnPos.x + 1), (spawnPos.y + 3), STRUCTURE_EXTENSION);

    }
    // More workers to fill spawn and build extensions then get to RC3
    // Add a couple of upgraders so RCL doesn't revert while building occurs
    if (roomControllerLevel == 2) {
        var desiredWorkers = 4;
        var desiredUpgraders = 2;
        var desiredMiners = 0;
        var desiredHaulers = 0;
    }

    // RC3: Get tower placed and built
    // Place tower at RC3 relative to spawn
    if (roomControllerLevel == 3) {
        roomName.createConstructionSite(spawnPos.x, (spawnPos.y - 3), STRUCTURE_TOWER);
    }
    // Keep workers and upgraders the same f
    if (roomControllerLevel == 3) {
        var desiredWorkers = 4;
        var desiredUpgraders = 2;
        var desiredMiners = 0;
        var desiredHaulers = 0;
    }

    // RC4: Spawn Minutemen if there are hostiles
    // Will lower levels of non essential creeps until hostiles are gone
    if (roomControllerLevel == 4) {
        if (enemyAtTheGate.length > 0) {
            
            var desiredMinutemen = 0 * (enemyAtTheGate.length);
            var desiredWorkers = 2;
            var desiredUpgraders = 1;
            var desiredMiners = 1;
            var desiredHaulers = 1;
        }
        if (enemyAtTheGate.length == 0) {
            var desiredWorkers = 4;
            var desiredUpgraders = 2;
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

    // Spawn desired numbers of upgraders based on Room Controller Level
    // Will make sure the number of desired harvesters exist before spawning new upgraders
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if (upgraders.length < desiredUpgraders &&
        workers.length == desiredWorkers) {
        var newName = 'Upgrader' + Game.time;
        var canSpawnUpgrader = Game.spawns[spawnName].spawnCreep([WORK, CARRY, MOVE, MOVE], newName,
            { memory: { role: 'upgrader', dryRun: true } });
        // console.log(canSpawnUpgrader);
        if (canSpawnUpgrader == 0) {
            console.log('Spawning new upgrader: ' + newName);
            Game.spawns[spawnName].spawnCreep([WORK, CARRY, MOVE, MOVE], newName,
                { memory: { role: 'upgrader', debug: false } });
        }
    }

    // Spawn desired number of miners based on Room Controller Level
    // Confirms there are the desired number of workers built first
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    if (miners.length < desiredMiners &&
        (workers.length == desiredWorkers || workers.length > desiredWorkers)) {
        var newName = 'Miner' + Game.time;
        var canSpawnMiner = Game.spawns[spawnName].spawnCreep([WORK, WORK, WORK, CARRY, MOVE, MOVE], newName,
            { memory: { role: 'miner', dryRun: true } });
        if (canSpawnMiner == 0) {
            console.log('Spawning new miner: ' + newName);
            Game.spawns[spawnName].spawnCreep[WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], newName,
                { memory: { role: 'miner' } };
        }
    }

    // Spawn desired number of haulers based on Room Controller Level.
    // Confirms there are the desired number of miners and workers built first
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    if (haulers.length < desiredHaulers &&
        miners.length == desiredMiners &&
        (workers.length == desiredWorkers || workers.length > desiredWorkers)) {
        var newName = 'Hauler' + Game.time;
        var canSpawnHauler = Game.spawns[spawnName].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
            { memory: { role: 'hauler', dryRun: true } });
        if (canSpawnHauler == 0) {
            console.log('Spawning new hauler: ' + newName);
            Game.spawns[spawnName].spawnCreep[WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
                { memory: { role: 'hauler' } };
        }
    }

    // Spawn desired number of minutemen based on number of hostiles in room
    // Room Controller Level must be 3 or higher
    var minutemen = _.filter(Game.creeps, (creep) => creep.memory.role == 'grunt');
    if (enemyAtTheGate.length > 0 && minutemen.length < desiredMinutemen) {
        var newName = 'Minuteman' + Game.time;
        var canSpawnMinuteman = Game.spawns[spawnName].spawnCreep([ATTACK, ATTACK, MOVE, MOVE], newName,
            { memory: { role: 'minuteman', dryRun: true } });
        // console.log(canSpawnMinuteman);
        if (canSpawnMinuteman == 0) {
            console.log('Spawning new minuteman: ' + newName);
            Game.spawns[spawnName].spawnCreep([ATTACK, ATTACK, MOVE, MOVE], newName,
                { memory: { role: 'minuteman', debug: false } });
        }
    }

    // Run role modules based on creeps memory.role value
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'worker') {
            roleWorker.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        if (creep.memory.role == 'minuteman') {
            roleMinuteman.run(creep);
        }
    }

    // Get info for towers if they exist and give them instructions
    var towers = roomName.find(FIND_STRUCTURES, {
        filter: (s) =>
            s.structureType == STRUCTURE_TOWER
    });
    for (let tower of towers) {
        if (tower) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure && tower.store[RESOURCE_ENERGY] > 500) {
                tower.repair(closestDamagedStructure);
            }

            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            }
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