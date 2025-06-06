import { describe, it, expect, vi } from 'vitest';
import { createResponse, ok, created, noContent, badRequest, notFound, internalServerError } from './response';

// Mock the config module
vi.mock('./config', () => ({
  config: {
    CORS_ALLOW_ORIGIN: '*',
  },
}));

describe('Response Utils', () => {
  describe('createResponse', () => {
    it('should create a response with the given status code and body', () => {
      // Arrange
      const statusCode = 200;
      const body = { data: 'test' };

      // Act
      const response = createResponse(statusCode, body);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify(body));
      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
    });
  });

  describe('helper functions', () => {
    it('should create a 200 OK response with CORS headers', () => {
      // Arrange
      const body = { data: 'test' };

      // Act
      const response = ok(body);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify(body));
      expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should create a 201 Created response with CORS headers', () => {
      // Arrange
      const body = { id: '123' };

      // Act
      const response = created(body);

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toBe(JSON.stringify(body));
      expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should create a 204 No Content response with CORS headers', () => {
      // Act
      const response = noContent();

      // Assert
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('{}');
      expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should create a 400 Bad Request response with custom message and CORS headers', () => {
      // Arrange
      const message = 'Invalid input';

      // Act
      const response = badRequest(message);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toBe(JSON.stringify({ message }));
      expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should create a 404 Not Found response with custom message and CORS headers', () => {
      // Arrange
      const message = 'Task not found';

      // Act
      const response = notFound(message);

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.body).toBe(JSON.stringify({ message }));
      expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should create a 500 Internal Server Error response with custom message and CORS headers', () => {
      // Arrange
      const message = 'Something went wrong';

      // Act
      const response = internalServerError(message);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ message }));
      expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should use default messages when none provided', () => {
      // Act & Assert
      expect(JSON.parse(badRequest().body).message).toBe('Bad Request');
      expect(JSON.parse(notFound().body).message).toBe('Not Found');
      expect(JSON.parse(internalServerError().body).message).toBe('Internal Server Error');
    });
  });
});
