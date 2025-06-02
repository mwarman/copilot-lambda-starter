import { describe, it, expect } from 'vitest';
import { createResponse, ok, created, noContent, badRequest, notFound, internalServerError } from './response';

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
      expect(response.headers).toEqual({ 'Content-Type': 'application/json' });
    });
  });

  describe('helper functions', () => {
    it('should create a 200 OK response', () => {
      // Arrange
      const body = { data: 'test' };

      // Act
      const response = ok(body);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify(body));
    });

    it('should create a 201 Created response', () => {
      // Arrange
      const body = { id: '123' };

      // Act
      const response = created(body);

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toBe(JSON.stringify(body));
    });

    it('should create a 204 No Content response', () => {
      // Act
      const response = noContent();

      // Assert
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('{}');
    });

    it('should create a 400 Bad Request response with custom message', () => {
      // Arrange
      const message = 'Invalid input';

      // Act
      const response = badRequest(message);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toBe(JSON.stringify({ message }));
    });

    it('should create a 404 Not Found response with custom message', () => {
      // Arrange
      const message = 'Task not found';

      // Act
      const response = notFound(message);

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.body).toBe(JSON.stringify({ message }));
    });

    it('should create a 500 Internal Server Error response with custom message', () => {
      // Arrange
      const message = 'Something went wrong';

      // Act
      const response = internalServerError(message);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ message }));
    });

    it('should use default messages when none provided', () => {
      // Act & Assert
      expect(JSON.parse(badRequest().body).message).toBe('Bad Request');
      expect(JSON.parse(notFound().body).message).toBe('Not Found');
      expect(JSON.parse(internalServerError().body).message).toBe('Internal Server Error');
    });
  });
});
