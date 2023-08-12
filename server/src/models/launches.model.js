const launchesDB = require('./launches.mongo');
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date("December 27, 2030"),
    target: 'Kepler-442 b',
    customers: ['ZTM', 'NASA', 'BRIN'],
    upcoming: true,
    success: true

}

saveLaunch(launch);

let latestFlightNumber = 100

//launches.set(launch.flightNumber, launch);
async function saveLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    if(!planet) {
        throw new Error('No matching planet is found')
    }

    await launchesDB.updateOne({
        flightNumber:launch.flightNumber
    }, launch, {
        upsert:true
    })
}


async function existsLaunchWithId(launchId) {
    return await launchesDB.findOne({
        flightNumber: launchId
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDB
        .findOne({})
        .sort('-flightNumber')

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    
    return latestLaunch.flightNumber;
}

async function getAllLaunches() {
    return await launchesDB.find({}, {
        '_id':0, '__v':0
    });
}

async function scheduleNewLaunch() {
    const newFlightNumber = await  getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber
    }); 
   
    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
   const aborted = await launchesDB.updateOne({
        flightNumber: launchId
   }, {
        upcoming: false,
        success: false
   });
   
   return aborted.ok === 1 && aborted.nModified === 1;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}