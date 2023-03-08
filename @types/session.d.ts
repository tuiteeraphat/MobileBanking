import 'express-session';
declare module 'express-session' {
    interface SessionData {
        customer_id: string;
    }
}