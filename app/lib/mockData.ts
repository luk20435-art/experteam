// app/lib/mockData.ts
import {
  Department,
  Position,
  User,
  EmployeePosition,
  Employee,
} from './types';

export let mockDepartments: Department[] = [
  { id: 1, name: 'IT' },
  { id: 2, name: 'HR' },
  { id: 3, name: 'Finance' },
];

export let mockPositions: Position[] = [
  { id: 1, name: 'Developer', departmentId: 1 },
  { id: 2, name: 'HR Manager', departmentId: 2 },
  { id: 3, name: 'Accountant', departmentId: 3 },
];

export let mockUsers: User[] = [
  { id: 1, username: 'john', email: 'john@company.com' },
  { id: 2, username: 'jane', email: 'jane@company.com' },
  { id: 3, username: 'bob', email: 'bob@company.com' },
];

export let mockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', userId: 1 },
  { id: 2, name: 'Jane Smith', userId: 2 },
  { id: 3, name: 'Bob Wilson', userId: 3 },
];

export let mockEmployeePositions: EmployeePosition[] = [
  { id: 1, employeeId: 1, positionId: 1, startDate: '2024-01-01' },
  { id: 2, employeeId: 2, positionId: 2, startDate: '2024-02-01' },
];