import session, { SessionData } from 'express-session';
import mongoDbSession from 'connect-mongodb-session';
import dotenv from 'dotenv';

dotenv.config();

const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: process.env.MONGO_URI ?? 'mongodb://localhost:27017',
    collection: 'sessions',
    databaseName: 'Bobkes',
});

mongoStore.on('error', (error) => {
    console.error(error);
});

declare module 'express-session' {
    export interface SessionData {
        user?: { username: string };
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? 'my-super-secret-secret',
    store: mongoStore,
    resave: false,
    saveUninitialized: false,
});