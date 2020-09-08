import io from "socket.io-client";
import { SERVER } from "./config";
import axios from 'axios';
import { Business } from "./YelpInterfaces";
import { of, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators'

class ServerService {
    private socket = io.connect(SERVER);
    sessionId: string = "";

    newSession = (params: { userName: string, location: string }): void => {
        this.socket.emit("newSession", params, (id: string) => this.sessionId = id)
    }

    addRestaurant = (restaurant: Business): void => {
        this.socket.emit("addRestaurant", { restaurant, sessionId: this.sessionId });
    }

    search = (term: string): Observable<Business[]> => {
        return from(axios
            .get(`${SERVER}/search/${term}`)).pipe(map((d: any) => {
                console.log(`recieved ${JSON.stringify(d.data)}`);
                return d.data.businesses as Business[];
            }))
        //   .catch((e: Error) => console.log(`error: ${e}`));
        // return of([]);
    };

}
let serverService = new ServerService;
export default serverService;