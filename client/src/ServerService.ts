import io from "socket.io-client";
import { SERVER } from "./config";
import axios from 'axios';
import { Business, BusinessWithVotes } from "./YelpInterfaces";
import { of, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators'
import { stringify } from "querystring";

class ServerService {
    // private socket = io.connect(SERVER);
    // sessionId: string = "";
    // addedRestaurants: {[id: string]: BusinessWithVotes} = {};

    // constructor(){
    //   this.socket.on("addedRestaurant", (restaurant: Business) => {
    //       console.log(`someone added ${JSON.stringify(restaurant)}`)
    //     this.addedRestaurants[restaurant.id] = {business: restaurant, votes: {}};
    //   });  

    //   this.socket.on("addedVote", (restaurantId:string, vote: {level: number, names: string[]}) => {
    //       this.addedRestaurants[restaurantId].votes = {
    //           [vote.level]: vote.names
    //       }
    //     // let currentVotes = this.addedRestaurants[restaurantId].votes[vote];
    //     // if(currentVotes){
    //     //     currentVotes.push(userName);
    //     // } else {
    //     //     currentVotes = [userName];
    //     // }
    //   })
    // }

    // joinSession = (params: {sessionId: string, userName: string}) => {
    //     this.socket.emit("joinSession", params)
    // }

    // newSession = (params: { userName: string, location: string }): void => {
    //     this.socket.emit("newSession", params, (id: string) => this.sessionId = id)
    // }

    // addRestaurant = (restaurant: Business): void => {
    //     this.socket.emit("addRestaurant", { restaurant, sessionId: this.sessionId });
    // }

    // search = (term: string): Observable<Business[]> => {
    //     return from(axios
    //         .get(`${SERVER}/search/${term}`)).pipe(map((d: any) => {
    //             console.log(`recieved ${JSON.stringify(d.data)}`);
    //             return d.data.businesses as Business[];
    //         }))
    //     //   .catch((e: Error) => console.log(`error: ${e}`));
    //     // return of([]);
    // };

}
let serverService = new ServerService;
export default serverService;