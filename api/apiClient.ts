import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL: baseURL,
    });
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }
}

export default ApiClient;
