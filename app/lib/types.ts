// app/lib/types.ts
export interface Department {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
  departmentId: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface EmployeePosition {
  id: number;
  employeeId: number;
  positionId: number;
  startDate: string;
}

export interface Employee {
  id: number;
  name: string;
  userId: number;
}