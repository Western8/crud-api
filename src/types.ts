import { UUID } from "crypto";

export interface IUser {
  id: string | UUID;
  username: string;
  age: number;
  hobbies: string[];
}

export interface IUserNew {
  username: string;
  age: number;
  hobbies: string[];
}

export interface IUsersResult {
  code: number;
  message?: string;
  users: IUser[];
}

export interface IUsersMessage {
  users: IUser[];
}

export const usersDefault: IUser[] = [
  {
    id: '013dba00-8969-4c97-8de7-528738d1f295',
    username: 'John',
    age: 35,
    hobbies: [
      'singer',
      'musician',
    ],
  },
  {
    id: 'a0248dcc-4228-4bab-b8a1-387d9125cea2',
    username: 'Lehnon',
    age: 120,
    hobbies: [],
  },
  {
    id: 'ea82e269-486b-4757-a74e-5b4348111fd5',
    username: 'Smith',
    age: 22,
    hobbies: [
      'mushrooms',
      'singer',
      'fishing',
    ],
  },
];