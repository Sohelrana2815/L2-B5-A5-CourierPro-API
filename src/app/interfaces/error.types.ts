// Interface defining the structure of detailed Zod validation issues.
export interface ZodIssue {
  expected: string;
  code: string;
  path: (string | number)[];
  message: string;
}

// Interface defining the structure for a single error source (used in response).
export interface TErrorSource {
  path: string | number;
  message: string;
}

// Interface for the standardized generic error response format.
export interface TGenericErrorResponse {
  statusCode: number;
  message: string;
  errorSources?: TErrorSource[];
}
