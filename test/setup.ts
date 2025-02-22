import { config } from 'dotenv';

config({ path: '.env.test' });

console.log('Test environment loaded:', process.env.DATABASE_URL);
