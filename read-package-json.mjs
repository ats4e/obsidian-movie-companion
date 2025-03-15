import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export const version = packageJson.version;
export const name = packageJson.name;
export const homepage = packageJson.homepage;
