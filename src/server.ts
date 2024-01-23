import http from 'http';
import { getUsers, createUser, isUUID, updateUser, deleteUser } from './crud';
import { IUser, IUserNew, IUsersResult } from './types';

export const server: http.Server = http.createServer((req, res) => {
  const method = req.method?.toUpperCase();
  const url = req.url;
  const params = url?.split('/');

  if (!(params && params[1] === 'api' && params[2] === 'users')) {
    response404(res);
    return;
  }

  switch (method) {
    case 'GET':
      if (params[3]) {
        responseUsers(res, params[3]);
      } else {
        responseUsers(res);
      }
      break;

    case 'POST':
      responseNewUser(req, res);
      break;

    case 'PUT':
      responseUpdateUser(req, res, params[3]);
      break;

    case 'DELETE':
      responseDeleteUser(req, res, params[3]);
      break;

    //default:
  }
})

const port: number = (process.env.PORT) && Number.isInteger(+process.env.PORT) ? +process.env.PORT : 4000;
server.listen(port, () => {
  console.log(`Server is running by http://localhost:${port}`);
});

function response404(res: http.ServerResponse) {
  res.writeHead(404, "Resource not found");
  res.end();
}

function responseUsers(res: http.ServerResponse, id?: string): void {
  const usersResult: IUsersResult = getUsers(id);
  res.writeHead(usersResult.code);
  res.end(JSON.stringify(usersResult.message || usersResult.users));
}

function responseNewUser(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let objUser: IUserNew = {
      username: '',
      age: 0,
      hobbies: [],
    };
    let keys: string[] = [];
    try {
      objUser = JSON.parse(body);
      keys = Object.keys(objUser);
    } catch {
      res.writeHead(400, "Incorrect users fields");
      res.end();
      return;
    }

    if (!(keys.includes('username') && keys.includes('age') && keys.includes('hobbies'))) {
      res.writeHead(400, "Incorrect users fields");
      res.end();
      return;
    }

    const newUser: IUser = createUser(objUser);
    res.writeHead(201);
    res.end(JSON.stringify(newUser));
  })
}

function responseUpdateUser(req: http.IncomingMessage, res: http.ServerResponse, id: string): void {
  if ((id === undefined) || !isUUID(id)) {
    res.writeHead(400, "Invalid user id");
    res.end();
    return;
  }

  const usersResult: IUsersResult = getUsers(id);
  if (usersResult.code === 404) {
    res.writeHead(usersResult.code);
    res.end(usersResult.message);
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    let objUser: IUserNew = {
      username: '',
      age: 0,
      hobbies: [],
    };
    let keys: string[] = [];
    try {
      objUser = JSON.parse(body);
      keys = Object.keys(objUser);
    } catch {
      res.writeHead(400, "Incorrect users fields");
      res.end();
      return;
    }

    if (!(keys.includes('username') && keys.includes('age') && keys.includes('hobbies'))) {
      res.writeHead(400, "Incorrect users fields");
      res.end();
      return;
    }

    const updatedUser: IUser = updateUser(objUser, usersResult.users[0]);
    res.writeHead(201);
    res.end(JSON.stringify(updatedUser));
  })
}

function responseDeleteUser(req: http.IncomingMessage, res: http.ServerResponse, id: string): void {
  if ((id === undefined) || !isUUID(id)) {
    res.writeHead(400, "Invalid user id");
    res.end();
    return;
  }

  const usersResult: IUsersResult = getUsers(id);
  if (usersResult.code === 404) {
    res.writeHead(usersResult.code);
    res.end(usersResult.message);
    return;
  }

  deleteUser(usersResult.users[0]);
  res.writeHead(204, 'User has been deleted');
  res.end();
}
