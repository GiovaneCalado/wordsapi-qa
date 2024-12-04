import Ajv from 'ajv';
import path from 'path';
import fs from 'fs';
import { expect } from '@playwright/test';

export async function validateContract(responseBody: object, schemaName: string) {
    try {
        const schemaPath = path.resolve(__dirname, `../schemas/${ schemaName }`);
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        const ajv = new Ajv()
        const validate = ajv.compile(schema)

        expect(validate(responseBody)).toBeTruthy()
        console.log('The response body:', JSON.stringify(responseBody, null, 2))
        console.log('Matches the schema:', JSON.stringify(schema, null, 2))
    } catch (error) {
        console.error('The response body does not match the schema.', error.message);
        throw error;
    }
}