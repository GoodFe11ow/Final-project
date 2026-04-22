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
};