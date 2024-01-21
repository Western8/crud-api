import http from 'http';
import { getUsers } from './crud';
import { IUsersResult } from './types';

export const server: http.Server = http.createServer( (req, res) => {
  const method = req.method?.toUpperCase();
  const url = req.url;
  const params = url?.split('/');

  switch(method) {
    case 'GET':
      if (params && params[1] === 'api' && params[2] === 'users') {
        if (params[3]) {
          responseUsers(res, params[3]);
        } else {
          responseUsers(res);
        }
      } else {
        response404(res);
      }
      break;
    
    default: 
  }
  //res.end(JSON.stringify(users));
})

const port: number = (process.env.PORT) && Number.isInteger(+process.env.PORT) ? +process.env.PORT : 4000;
server.listen(port, () => {
  console.log(`Server is running by http://localhost:${port}`);
});

function response404(res: http.ServerResponse) {
  res.writeHead(404, "Resource not found");
  res.end();
}

function responseUsers(res: http.ServerResponse, id?: string) {
  const usersResult: IUsersResult = getUsers(id);
  res.writeHead(usersResult.code);
  res.end(JSON.stringify(usersResult.message || usersResult.users));
}