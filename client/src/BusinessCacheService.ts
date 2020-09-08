import {Business} from "./YelpInterfaces"

interface Cache {
    [id: string]: Business;
}

class BusinessCacheService {
    private cache:Cache = {};

    add = (arr: Business[]) => {
        arr.forEach(b => {
            this.cache[b.id] = b;
        })
        console.log(`added buinesses to cache. cache is now ${JSON.stringify(this.cache)}`)
    }

    search = (id: any) => {
        return this.cache[id];
    }
}

let businessCacheService = new BusinessCacheService;
export default businessCacheService;