import "dotenv/config";

function requireEnv(name:string): string {
    const value = process.env[name];

    if(!value) {
        throw new Error(`${name} is not set`);
    }

    return value;
};

const port = Number(process.env.PORT ?? "3000");

if(Number.isNaN(port)) {
    throw new Error("Port must be a valid number");
}

export const env = {
    PORT: port,
    DATABASE_URL: requireEnv("DATABASE_URL"),
    APP_JWT_SECRET: requireEnv("APP_JWT_SECRET"),
    DEMO_MODE: process.env.DEMO_MODE === "true",
    GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
    VAPID_PUBLIC_KEY: requireEnv("VAPID_PUBLIC_KEY"),
    VAPID_PRIVATE_KEY: requireEnv("VAPID_PRIVATE_KEY"),
    VAPID_SUBJECT: requireEnv("VAPID_SUBJECT"),
};
