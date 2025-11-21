import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const schema = z.object({
  id: z.string(),
});

const result = zodToJsonSchema(schema, {
  target: 'jsonSchema7',
  $refStrategy: 'none',
});

console.log('zodToJsonSchema result:');
console.log(JSON.stringify(result, null, 2));
