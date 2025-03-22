import axios from 'axios';
import { get, post } from '@/services/api';

// Mock axios
jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    create: jest.fn(() => mockInstance),
    default: mockInstance, // Optional, for direct axios usage
  };
});

describe('API Client', () => {
  let mockAxiosInstance: ReturnType<typeof axios.create>;

  beforeAll(() => {
    // Get the mocked instance created by axios.create
    mockAxiosInstance = axios.create();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('GET requests', () => {
    it('should successfully handle GET requests', async () => {
      const mockData = { id: 1, name: 'Test User' };
      (mockAxiosInstance.get as jest.Mock).mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await get('/users/1');
      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/1', undefined);
    });

    it('should handle GET request errors', async () => {
      const error = new Error('Network Error');
      (mockAxiosInstance.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(get('/users/1')).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('GET request failed for /users/1'),
        error
      );
    });
  });

  describe('POST requests', () => {
    it('should successfully handle POST requests', async () => {
      const requestData = { name: 'New User' };
      const responseData = { id: 1, name: 'New User' };

      (mockAxiosInstance.post as jest.Mock).mockResolvedValueOnce({
        data: responseData,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {},
      });

      const result = await post('/users', requestData);
      expect(result).toEqual(responseData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', requestData, undefined);
    });

    it('should handle POST request errors', async () => {
      const requestData = { name: 'New User' };
      const error = new Error('Bad Request');

      (mockAxiosInstance.post as jest.Mock).mockRejectedValueOnce(error);

      await expect(post('/users', requestData)).rejects.toThrow('Bad Request');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('POST request failed for /users'),
        error
      );
    });
  });
});