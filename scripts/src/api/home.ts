import { HttpService } from '../../framework/net/HttpService';
// import {gen_handler} from "../../framework/utils/Handler";
export function apiHomeLogo(params) {
    // const request = HttpService.getInst().request
    return HttpService.getInst().request({
        url: '/api/saas-system/front/tenantPlatLogoManage/get',
        params: params,
        // methods: 'get'
    });
}

//
export function apiHomeMenuList(params){
    return HttpService.getInst().request({
        url: '/api/saas-system/front/platTemplateHomeMenu/list',
        params: params,
    })
}