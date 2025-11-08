/**
 * Infers JSON Schema type from a JavaScript value
 */
function inferType(value: any): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Converts a sample body object to JSON Schema format
 * @param sampleBody - Sample body data (can be object, array, or primitive)
 * @returns JSON Schema object
 */
export function convertSampleBodyToSchema(sampleBody: any): {
  type: string;
  properties?: Record<string, any>;
  items?: any;
  [key: string]: any;
} {
  if (sampleBody == null) {
    return {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Input data for the API call",
        },
      },
      additionalProperties: true,
    };
  }

  const type = inferType(sampleBody);

  // Handle objects
  if (type === "object" && !Array.isArray(sampleBody)) {
    const properties: Record<string, any> = {};

    for (const [key, value] of Object.entries(sampleBody)) {
      const valueType = inferType(value);

      if (valueType === "object" && value !== null) {
        properties[key] = convertSampleBodyToSchema(value);
      } else if (valueType === "array") {
        properties[key] = {
          type: "array",
          items:
            Array.isArray(value) && value.length > 0
              ? convertSampleBodyToSchema(value[0])
              : { type: "string" },
        };
      } else {
        properties[key] = {
          type: valueType === "null" ? "string" : valueType,
        };
      }
    }

    return {
      type: "object",
      properties,
      additionalProperties: true,
    };
  }

  // Handle arrays
  if (type === "array") {
    return {
      type: "array",
      items:
        Array.isArray(sampleBody) && sampleBody.length > 0
          ? convertSampleBodyToSchema(sampleBody[0])
          : { type: "string" },
    };
  }

  // Handle primitives
  return {
    type: type === "null" ? "string" : type,
  };
}

/**
 * Generates a complete MCP tool input schema from endpoint data
 * @param sampleBody - Sample body from endpoint configuration
 * @param httpMethod - HTTP method (GET, POST, etc.)
 * @returns Complete input schema for MCP tool
 */
export function generateToolInputSchema(
  sampleBody: any,
  httpMethod: string
): any {
  // For GET requests, we typically don't have a body
  if (httpMethod.toUpperCase() === "GET") {
    return {
      type: "object",
      properties: {
        query: {
          type: "object",
          description: "Query parameters for the GET request",
          additionalProperties: true,
        },
      },
    };
  }

  // For other methods, convert sampleBody to schema
  return convertSampleBodyToSchema(sampleBody);
}
