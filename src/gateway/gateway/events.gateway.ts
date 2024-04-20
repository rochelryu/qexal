import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  WsResponse,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { Socket, Server } from 'socket.io';
import { randomTime } from 'src/common/functions/helper';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway(parseInt(process.env.SOCKET_PORT), {
  cors: true,
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UsersService) {}

  private logger: Logger = new Logger('AppGateWay');

  afterInit(server: Server) {
    this.logger.debug(
      `initialize of Socket ${process.env.APP_HOST}:${process.env.SOCKET_PORT}`,
    );
    this.getLastTransaction();
  }

  // une fois la connexion avec le client etablie
  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    this.server.of('/').adapter.nsp._events.connection(client);
  }

  // une fois la connexion avec le client perdu
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const id = Object.values(client.rooms);
  }

  async getLastTransaction() {
    const lastTransaction = await this.userService.getLatestTransactions();
    if (lastTransaction.etat) {
      const amount_usd = await this.userService.convertEthToUsd(
        parseFloat(lastTransaction.result.amount),
      );
      const result = {
        ...lastTransaction.result,
        amount_usd: amount_usd.result,
      };

      if (Math.floor(result.amount_usd) >= 50) {
        this.server.emit('receiveInfo', result);
      }
    }
    const time = randomTime();
    setTimeout(() => {
      this.getLastTransaction();
    }, time);
  }
}
