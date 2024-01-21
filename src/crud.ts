import crypto from 'crypto';
import { users } from './index.ts';
import { IUser, IUserNew, IUsersResult } from './types.ts';

export function getUsers(id: string | null = null): IUsersResult {
  const result: IUsersResult = {
    code: 200,
    message: '',
    users: users,
  }
  if (id) {
    if (!isUUID(id)) {
      result.code = 400;
      result.message = 'Invalid user id';
      result.users = [];
      return result;
    }
    const usersFilter: IUser[] = users.filter(item => item.id === id);
    if (usersFilter.length === 0) {
      result.code = 404;
      result.message = `User with id ${id} doesn't exist`;
      result.users = [];
    } else {
      result.users = usersFilter;
    }
  }
  return result;
}

export function createUser(objUser: IUserNew): IUser {
  const newUser: IUser = {
    id: crypto.randomUUID(),
    username: objUser.username,
    age: objUser.age,
    hobbies: objUser.hobbies,
  }
  users.push(newUser);
  return newUser;
}

export function updateUser(objUser: IUserNew, user: IUser): IUser {
  user.username = objUser.username;
  user.age = objUser.age;
  user.hobbies = objUser.hobbies;
  return user;
}

export function deleteUser(user: IUser): void {
  const index = users.findIndex(item => item.id === user.id);
  if (index > -1) {
    users.splice(index, 1);
  }
}

export function isUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}