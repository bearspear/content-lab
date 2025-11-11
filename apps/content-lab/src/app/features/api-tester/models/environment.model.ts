export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  type: 'string' | 'secret' | 'number' | 'boolean';
  description?: string;
}
