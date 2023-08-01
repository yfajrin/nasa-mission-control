const request = require('supertest');
const app = require('../../app')

describe("Test GET /launches", () => {
    test('It should respond with 200', async () => {
        const response = await request(app)
        .get('/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
});

describe("Test POST /launches", () => {
    const completeLaunchData = {
        mission: 'ID Enterprise',
        rocket: 'SF 2706-d',
        target: 'Kepler-186 f',
        launchDate: 'April 2, 2030'
    }
    
    const incompleteLaunchData = {
        mission: 'ID Enterprise',
        rocket: 'SF 2706-d',
        launchDate: 'April 2, 2030'
    }
    
    const invalidLaunchDate = {
        mission: 'ID Enterprise',
        rocket: 'SF 2706-d',
        target: 'Kepler-186 f',
        launchDate: 'Hello Kitty'
    }

    test('It should respond with 201 created', async () => {
        const response = await request(app)
            .post('/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);

        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();

        expect(responseDate).toBe(requestDate);
    });

    test('It should catch missing required properties', async () => {
        const response = await request(app)
            .post('/launches')
            .send(incompleteLaunchData)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body).toStrictEqual({
            error: "Missing required launch property!"
        })
    });

    test('It should catch invalid launch date', async () => {
        const response = await request(app)
        .post('/launches')
        .send(invalidLaunchDate)
        .expect('Content-Type', /json/)
        .expect(400);

        expect(response.body).toStrictEqual({
            error: "Invalid launch date!"
        })
    });
});