import request from "supertest";
import { getUsers, createUser, deleteUser } from "./crud";
import { server } from "./server";

const url = 'http://localhost:4000/'
const newUser = {
  id: '',
  username: 'Bob',
  age: 99,
  hobbies: [
    'football',
    'ski',
  ]
};
const newUser2 = {
  id: '',
  username: 'Bobby',
  age: 77,
  hobbies: [
    'bobsley',
  ]
};

afterAll(() => {
  server.close();
});

describe('Test for API (scenario 1)', () => {
  let user = {
    id: '',
    username: '',
    age: 0,
    hobbies: []
  };

  test('for init GET users it should return 3 records', async () => {
    const response = await request(url).get('api/users/');
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.text)).toHaveLength(3);
  });

  test('send POST request api/users should return 201 code & new user object', async () => {
    const response = await request(url)
      .post('api/users/')
      .send(newUser);
    user = JSON.parse(response.text);
    expect(response.statusCode).toEqual(201);
    expect(user.username).toEqual(newUser.username);
    expect(user.age).toEqual(newUser.age);
  });

  test('send GET request with new user id should return new user object', async () => {
    const response = await request(url).get(`api/users/${user.id}`);
    const users = JSON.parse(response.text);
    expect(response.statusCode).toEqual(200);
    expect(users[0].id).toEqual(user.id);
    expect(users[0].username).toEqual('Bob');
    expect(users[0].age).toEqual(99);
  });

  test('send PUT request with new user id should return updated user object', async () => {
    const response = await request(url)
      .put(`api/users/${user.id}`)
      .send(newUser2);
    const updatedUser = JSON.parse(response.text);
    expect(updatedUser.username).toEqual(newUser2.username);
    expect(updatedUser.age).toEqual(newUser2.age);
  });

  test('send DELETE request with new user id should delete object', async () => {
    const response = await request(url)
      .delete(`api/users/${user.id}`);
    expect(response.statusCode).toEqual(204);
  });

  test('send DELETE request with new user id once again should return 404', async () => {
    const response = await request(url)
      .delete(`api/users/${user.id}`);
    expect(response.statusCode).toEqual(404);
  });
})

describe('Test for CRUD operation (scenario 2)', () => {
  test('for init getting users it should return 3 records', () => {
    const users = getUsers().users;
    expect(users).toHaveLength(3);
  });

  test('send create user shold return new user', () => {
    const user = createUser(newUser);
    newUser.id = user.id;
    expect(user.username).toEqual('Bob');
  });

  test('for getting users it should return 4 records', () => {
    const users = getUsers().users;
    expect(users).toHaveLength(4);
  });

  test('for getting users it should return array that contains new user', () => {
    const users = getUsers().users;
    expect(users).toContainEqual(newUser);
  });

  test('after deleting new user, get users should return 3 records and no contain new user', () => {
    deleteUser(newUser);
    const users = getUsers().users;
    expect(users).toHaveLength(3);
    expect(users).not.toContainEqual(newUser);
  });
})






describe('Test for API errors (scenario 3)', () => {
  const uuidValid = 'f4db092e-0086-46c5-a084-6fe7deb5662e';
  const uuidInvalid = '12345-6789';
  const userInvalid = {
    username: 'Unknown',
    age: 0,
    invalidField: 'test',
  }

  test('send GET request with invalid uuid should return 400', async () => {
    const response = await request(url).get(`api/users/${uuidInvalid}`);
    expect(response.statusCode).toEqual(400);
  });

  test('send GET request with valid uuid that doesn\'t exist should return 404', async () => {
    const response = await request(url).get(`api/users/${uuidValid}`);
    expect(response.statusCode).toEqual(404);
  });

  test('send POST request api/users with invalid user should return 400', async () => {
    const response = await request(url)
      .post('api/users/')
      .send(userInvalid);
    expect(response.statusCode).toEqual(400);
  });

  test('send PUT request with invalid uuid should return 400', async () => {
    const response = await request(url).put(`api/users/${uuidInvalid}`);
    expect(response.statusCode).toEqual(400);
  });

  test('send PUT request with valid uuid that doesn\'t exist should return 404', async () => {
    const response = await request(url).put(`api/users/${uuidValid}`);
    expect(response.statusCode).toEqual(404);
  });

  test('send DELETE request with invalid uuid should return 400', async () => {
    const response = await request(url).delete(`api/users/${uuidInvalid}`);
    expect(response.statusCode).toEqual(400);
  });

  test('send request to invalid url should return 404', async () => {
    const response = await request(url).delete('api/noturl/users/');
    expect(response.statusCode).toEqual(404);
  });
})
