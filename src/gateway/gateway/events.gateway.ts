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
  
  @WebSocketGateway(parseInt(process.env.SOCKET_PORT))
  export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        
      ) {}

    private logger: Logger = new Logger('AppGateWay');

    afterInit(server: Server) {
        this.logger.debug(`initialize of Socket `);
      }

      // une fois la connexion avec le client etablie
  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    this.logger.debug(`client conntected:  ${client.id}, ${args}`);
  }

  // une fois la connexion avec le client perdu
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const id = Object.values(client.rooms);
    this.logger.debug(`client disconntected:  ${client.id}`);
    this.logger.debug(id);
  }

    @SubscribeMessage('identity')
    handleJoinToRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: {email:string},
    ): void {
        client.join(payload.email); // for to insert client on a discution
        this.logger.debug(client.rooms);
    }

    async handleExchangeReception(email: string) {
      this.logger.debug(email);
      this.server.to(email).emit('reponseExchangeReception');
    }
  }