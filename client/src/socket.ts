import { SERVER } from "./config";
import io from "socket.io-client";
import {
  SetUserNameCallback,
  NewSessionData,
  NewSessionCallback,
  TryJoinSessionData,
  TryJoinSessionCallback,
  Business,
} from "../../shared/types";
import axios from "axios";

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
    console.log(`running socket constructor.`)
    this.socket = io.connect(SERVER);
  }

  search = (sessionId: string, searchTerm: string): Promise<Business[]> =>
    new Promise((resolve, reject) =>
      axios
        .get(`${SERVER}/search/${sessionId}/${searchTerm}`)
        .then((result) => resolve(result.data))
    );

  setUserName = (
    sessionId: string,
    userId: string,
    userName: string
  ): Promise<boolean> =>
    new Promise((resolve, reject) =>
      axios
        .post(`${SERVER}/setUserName/${sessionId}/${userId}/${userName}`)
        .then((result) => resolve(result.data))
    );

  addVote = (
    sessionId: string,
    userId: string,
    restaurantId: string,
    voteNum: number
  ): Promise<boolean> =>
    new Promise((resolve, reject) =>
      axios
        .post(
          `${SERVER}/addVote/${sessionId}/${userId}/${restaurantId}/${voteNum}`
        )
        .then((result) => resolve(result.data))
    );

  addRestaurant = (
    sessionId: string,
    userId: string,
    restaurantId: string
  ): Promise<boolean> =>
    new Promise((resolve, reject) =>
      axios
        .post(`${SERVER}/addRestaurant/${sessionId}/${userId}/${restaurantId}`)
        .then((result) => resolve(result.data))
    );

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

  // setUserName: (
  //   data: SetUserNameData,
  //   callback: SetUserNameCallback
  // ) => void = (data, callback) => {
  //   this.emit(data, callback, "setUserName");
  // };

  subscribeToVoteAdded = (callback: Function) => {
    this.socket.on("addedVote", callback);
  };

  unSubscribeToVoteAdded = () => {
    this.socket.off("addedVote")
  }  

  subscribeToRestaurantAdded = (callback: Function) => {
    console.log(`socket class: got addedRestaurant`)
    this.socket.on("addedRestaurant", callback);
  };

  unSubscribeToRestaurantAdded = () => {
    this.socket.off("addedRestaurant")
  }
}



let socket = new Socket();
console.log("here.");
export default socket;
