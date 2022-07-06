import { HttpService } from "../../framework/net/HttpService";

export function apiPlatInfo(){
    return HttpService.getInst().request({
        url: '/api/saas-player/h5/player/search/platInfo',
    })
}