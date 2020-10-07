import { SERVER } from "./config";
import io from "socket.io-client";
import {
  SetUserNameCallback,
  NewSessionData,
  NewSessionCallback,
  TryJoinSessionData,
  TryJoinSessionCallback,
  SetUserNameData,
} from "../../shared/types";

// let socket: SocketIOClient.Socket = io.connect(SERVER);
// console.log(`socket connected: ${socket.id}`);

// export const initiateSocket = () => {
//   socket = io.connect(SERVER);
// };

// const emit = (data: any, callback: (p:any) => void, title: string) => {
//     console.log(`socket emitting ${title} with data ${JSON.stringify(data)}`)
//     socket.emit(title, data, callback)
// }

// export const newSession: (data: NewSessionData, callback: NewSessionCallback) => void = (data, callback) => {
//     console.log(`EMITTING NEW SESSION ${JSON.stringify(data)}`)
//     emit(data, callback, "newSession");
// };

// export const tryJoinSession: (data: TryJoinSessionData, callback: TryJoinSessionCallback) => void = (
//   data, callback
// ) => {
//     emit(data, callback, "tryJoinSession");
// };

// export const setUserName: (data: SetUserNameData, params: SetUserNameParams) => void = (
//  data, callback
// ) => {
//     emit(data, callback, "setUserName");
// };

// export const subscribeToVoteAdded = (callback: Function) => {
//   socket.on("addedVote", callback);
// };

// export const subscribeToRestaurantAdded = (callback: Function) => {
//   socket.on("addedRestaurant", callback);
// };
export class Socket {
  socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io.connect(SERVER);
  }
  // console.log(`socket connected: ${socket.id}`);

  emit = (data: any, callback: (p: any) => void, title: string) => {
    console.log(`socket emitting ${title} with data ${JSON.stringify(data)}`);
    this.socket.emit(title, data, callback);
  };

  newSession: (data: NewSessionData, callback: NewSessionCallback) => void = (
    data,
    callback
  ) => {
    console.log(`EMITTING NEW SESSION ${JSON.stringify(data)}`);
    this.emit(data, callback, "newSession");
  };

  tryJoinSession: (
    data: TryJoinSessionData,
    callback: TryJoinSessionCallback
  ) => void = (data, callback) => {
    this.emit(data, callback, "tryJoinSession");
  };

  setUserName: (
    data: SetUserNameData,
    callback: SetUserNameCallback
  ) => void = (data, callback) => {
    this.emit(data, callback, "setUserName");
  };

  subscribeToVoteAdded = (callback: Function) => {
    this.socket.on("addedVote", callback);
  };

  subscribeToRestaurantAdded = (callback: Function) => {
    this.socket.on("addedRestaurant", callback);
  };
}

let socket = new Socket();
console.log('here.')
export default socket;
