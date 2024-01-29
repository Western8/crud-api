import http from 'http';
import { getUsers, createUser, isUUID, updateUser, deleteUser } from './crud';
import { IUser, IUserNew, IUsersResult, IUsersMessage } from './types';
import { users } from './index';
import { modeMulti } from './index';
import cluster, { Cluster, Worker } from 'cluster';
import os from 'os';
export let server: http.Server;

const numCPU = os.availableParallelism();
const port: number = (process.env.PORT) && Number.isInteger(+process.env.PORT) ? +process.env.PORT : 4000;
let portCounter = port;

if (modeMulti && cluster.isPrimary) {
  const workers: Worker[] = [];
  for (let i = 1; i < numCPU; i++) {
    const worker = cluster.fork({ PORT: port + i });
    workers.push(worker);
  }

  cluster.on('message', (worker, message) => {
    if (message.users) {
      const usersFromWorker: IUser[] = message.users;
      users.length = 0;
      usersFromWorker.forEach((item) => users.push(item));

      workers.forEach(worker => {
        worker.send({ users });
      });
    }
  });

  server = http.createServer((req, res) => {
    console.log(`come request primary on port ${req.socket.localPort}`);
    portCounter = (portCounter < port + numCPU - 1) ? portCounter + 1 : port + 1;

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    const options: http.RequestOptions = {
      port: portCounter,
      path: req.url,
      method: req.method?.toUpperCase(),
    };

    // Sending the request
    const request = http.request(options, (resChild) => {
      let data = '';
      resChild.on('data', (chunk) => {
        data += chunk;
      });
      const statusCode = resChild.statusCode;

      // Ending the response 
      resChild.on('end', () => {
        if (resChild.statusCode) {
          res.writeHead(resChild.statusCode, resChild.statusMessage);
        }        
        res.end(data);
      });

    }).on("error", (err) => {
      console.log("Error: ", err)
    });

    req.on('end', () => {
      request.write(body);
      request.end();
    })
   });

  server.listen(port, () => {
    console.log(`Server (primary) is running by http://localhost:${port}`);
  });

} else {
  server = http.createServer((req, res) => {
    const method = req.method?.toUpperCase();
    const url = req.url;
    const params = url?.split('/');

    console.log(`come request child on port ${req.socket.localPort}`);

    if (!(params && params[1] === 'api' && params[2] === 'users')) {
      response404(res);
      return;
    }

    try {
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

    } catch (err) {
      response500(res, (err instanceof Error) ? err.message : '');
    }

    req.on('end', () => {
      cluster.worker?.send({ users });
    });

  });

  process.on('message', (message: IUsersMessage) => {
    if (message.users) {
      const usersFromPrimary: IUser[] = message.users;
      users.length = 0;
      usersFromPrimary.forEach((item) => users.push(item));
    }
  });

  server.listen(port, () => {
    console.log(`Server (child) is running by http://localhost:${port}`);
  });
}

function response404(res: http.ServerResponse) {
  res.writeHead(404, "Resource not found");
  res.end();
}

function response500(res: http.ServerResponse, err: string) {
  res.writeHead(500, "Error on the server side");
  res.end(err);
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
