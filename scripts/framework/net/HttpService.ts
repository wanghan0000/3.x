import { sys } from "cc";
import {gen_handler, handler} from "../utils/Handler";
type ResponseObject = {
    code: number | string,
    success: boolean,
    msg: string,
    data: any
}
type ResultCodeCombine = {
    code: HttpCode,
    data: ResponseObject
}

const responseObject: ResponseObject = {
    code: 0,
    success: false,
    msg: '',
    data: {}
}

export class HttpService {
    private static TAG = 'HttpService'
    private static _inst: HttpService

    public baseUrl = ''
    // public baseUrl = 'http://localhost:10000'
    public version = '1.33.0'
    public originDomain = ''
    public token = ''
    private constructor() {}
    private xhrList: Array<XMLHttpRequest> = new Array()
    static getInst(): HttpService {
        if (!this._inst) {
            this._inst = new HttpService()
        }
        return this._inst
    }
    request(requestParam): Promise<ResultCodeCombine> {
        let {
            url = '',
            method = 'POST',
            headers = null,
            params = null,
            joinUrl = true,
            contentType = { 'Content-Type': 'application/json;charset=UTF-8' },
            // cb ,
            fromData = null,
        } = requestParam
        if (method.toLocaleLowerCase() == 'get') {
            if (params) {
                if (url.indexOf('?') == -1) {
                    url += '?'
                }
                url += this.getQueryString(params)
            }
            if (joinUrl) {
                url = this.baseUrl + url
            }
            params = {}
        } else {
            url = this.baseUrl + url
        }
        let showLoading = false
        let xhr;
        let promise: Promise<ResultCodeCombine>  = new Promise((resolve, reject) => {
            // console.log(this);
            try {
                xhr = this.doHttp(
                    url,
                    headers,
                    params,
                    method,
                    gen_handler((code, data) => {
                        if (code == HttpCode.kSuccess) {
                            resolve({
                                code: code,
                                data: data,
                            })
                        } else {
                            reject({
                                code: code,
                                data: data,
                            })
                        }
                    }),
                    contentType,
                    fromData,
                    showLoading,
                )
                // console.log(res)
            } catch (e) {
                // console.log(e)
                // reject(e)
            }

            
        });
        promise['xhr'] = xhr;
        return promise;
    }

    doGet(url: string, headers, params, cb: handler, joinUrl = true) {
        if (params) {
            if (url.indexOf('?') == -1) {
                url += '?'
            }
            url += this.getQueryString(params)
        }
        if (joinUrl) {
            url = this.baseUrl + url
        }
        this.doHttp(url, headers, null, 'GET', cb, {
            'Content-Type': 'application/json;charset=UTF-8',
        })
    }

    doPost(
        url: string,
        headers,
        params,
        cb: handler,
        contentType = { 'Content-Type': 'application/json;charset=UTF-8' },
        fromData?,
    ): XMLHttpRequest {
        url = this.baseUrl + url
        let showLoading = false
        return this.doHttp(url, headers, params, 'POST', cb, contentType, fromData, showLoading)
    }

    public checkIp(url: string, cb: handler): XMLHttpRequest {
        const xhr = new XMLHttpRequest()
        xhr.responseType = 'text'
        xhr.timeout = 12 * 1000
        xhr.onreadystatechange = this.onReadyStateChange.bind(this, xhr, '', '', cb)
        xhr.ontimeout = this.onTimeout.bind(this, xhr, url, cb)
        xhr.onerror = this.onError.bind(this, xhr, url, cb)
        xhr.onabort = this.onAbort.bind(this, xhr, url, cb)
        xhr.open('POST', url, true)

        let Authorization = 'aW9zOmlvc19zZWNyZXQ='
        if (sys.OS.ANDROID === sys.os) {
            Authorization = 'YW5kcm9pZDphbmRyb2lkX3NlY3JldA=='
        } else if (sys.OS.WINDOWS === sys.os) {
            Authorization = 'cGM6cGNfc2VjcmV0'
        }

        this.setHttpHeaders(xhr, { Authorization: `Basic ${Authorization}` })
        this.setHttpHeaders(xhr, { 'Saas-Auth': `bearer` })
        this.setHttpHeaders(xhr, { 'saas-version': this.version })
        this.setHttpHeaders(xhr, { 'Origin-Domain': this.originDomain })
        this.setHttpHeaders(xhr, { 'Identity-Type': 'player' })
        this.setHttpHeaders(xhr, { 'Content-Type': 'application/json;charset=UTF-8' })
        if (sys.isNative) {
            this.setHttpHeaders(xhr, { 'Accept-Encoding': 'gzip,deflate' })
        }
        xhr.send()
        return xhr
    }

    public requestHotUrl(url: string, cb: handler): XMLHttpRequest {
        const xhr = new XMLHttpRequest()
        xhr.responseType = 'text'
        xhr.timeout = 12 * 1000
        xhr.onreadystatechange = this.onReadyStateChange.bind(this, xhr, url, '', cb)
        xhr.ontimeout = this.onTimeout.bind(this, xhr, url, cb)
        xhr.onerror = this.onError.bind(this, xhr, url, cb)
        xhr.onabort = this.onAbort.bind(this, xhr, url, cb)
        xhr.open('GET', url, true)
        this.setHttpHeaders(xhr, { 'Content-Type': 'application/json;charset=UTF-8' })
        if (sys.isNative) {
            this.setHttpHeaders(xhr, { 'Accept-Encoding': 'gzip,deflate' })
        }
        xhr.send()
        return xhr
    }

    private doHttp(
        url: string,
        headers,
        params,
        method: string,
        cb: handler,
        contentType,
        fromData?,
        showLoading?,
    ): XMLHttpRequest {
        const xhr = new XMLHttpRequest()
        xhr.responseType = 'text'
        xhr.timeout = 30 * 1000
        xhr.onreadystatechange = this.onReadyStateChange.bind(
            this,
            xhr,
            url,
            params,
            cb,
            showLoading,
        )
        xhr.ontimeout = this.onTimeout.bind(this, xhr, url, cb)
        xhr.onerror = this.onError.bind(this, xhr, url, cb)
        xhr.onabort = this.onAbort.bind(this, xhr, url, cb)

        console.log(`HttpService, doHttp url=${url}, method=${method}, parmas=${params}`)
        xhr.open(method, url, true)

        let Authorization = 'aW9zOmlvc19zZWNyZXQ='
        if (sys.OS.ANDROID === sys.os) {
            Authorization = 'YW5kcm9pZDphbmRyb2lkX3NlY3JldA=='
        } else if (sys.OS.WINDOWS === sys.os) {
            Authorization = 'cGM6cGNfc2VjcmV0'
        }

        this.setHttpHeaders(xhr, { Authorization: `Basic ${Authorization}` })
        if (this.token) {
            this.setHttpHeaders(xhr, { 'Saas-Auth': `bearer ${this.token}` })
        } else {
            this.setHttpHeaders(xhr, { 'Saas-Auth': `bearer` })
        }
        this.setHttpHeaders(xhr, { 'saas-version': this.version })
        this.setHttpHeaders(xhr, { 'Origin-Domain': this.originDomain })
        this.setHttpHeaders(xhr, { 'Identity-Type': 'player' })
        this.setHttpHeaders(xhr, contentType)
        if (headers) {
            this.setHttpHeaders(xhr, headers)
        }
        if (sys.isNative) {
            this.setHttpHeaders(xhr, { 'Accept-Encoding': 'gzip,deflate' })
        }
        if (params && typeof params === 'object') {
            params = JSON.stringify(params)
        }
        if (fromData) {
            xhr.send(fromData)
        } else {
            xhr.send(params)
        }
        this.xhrList.push(xhr)

        return xhr
    }

    public onabortAll() {
        this.xhrList.forEach((v) => {
            v.abort()
            v = null
        })
        this.xhrList.length = 0
    }

    private onReadyStateChange(xhr: XMLHttpRequest, url: string, params, cb: handler) {
        if (!xhr) {
            return
        }

        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
            console.log(`HttpService, onReadyStateChange, responseText=${xhr.responseText}`)
            let data
            let code = HttpCode.kUnknown
            let response = responseObject

            try {
                response = JSON.parse(xhr.responseText)
            } catch (error) {
                // response = {};
            }
            console.log(`HttpService response${xhr.responseText}`)
            code = HttpCode.kSuccess
            data = response
            this.notifyCallback(cb, code, data)
            this.removeXhrEvent(xhr)
        } else if (xhr.readyState === 4) {
            let data
            let code = HttpCode.kUnknown
            let response = responseObject

            try {
                response = JSON.parse(xhr.responseText)
            } catch (error) {
                // console.log(`error${error}`);
                // response = {};
            }
            // console.log(`HttpService response${xhr.responseText}`);
            // code = HttpCode.kSuccess;
            data = response
            this.notifyCallback(cb, code, data)
            this.removeXhrEvent(xhr)
        }
    }

    private onTimeout(xhr: XMLHttpRequest, url: string, cb: handler) {
        if (!xhr) {
            return
        }
        console.log(`${url}, request ontimeout`)
        this.removeXhrEvent(xhr)
        this.notifyCallback(cb, HttpCode.kTimeout, null)
    }

    private onError(xhr: XMLHttpRequest, url: string, cb: handler) {
        if (!xhr) {
            return
        }
        console.log(`${url}, request onerror`)
        this.removeXhrEvent(xhr)
        this.notifyCallback(cb, HttpCode.kUnknown, null)
    }

    private onAbort(xhr: XMLHttpRequest, url: string, cb: handler) {
        if (!xhr) {
            return
        }
        console.log(`${url}, request onabort`)
        this.removeXhrEvent(xhr)
        this.notifyCallback(cb, HttpCode.kUnknown, null)
    }

    private removeXhrEvent(xhr: XMLHttpRequest) {
        if (!xhr) {
            return
        }

        this.xhrList.forEach((v, index) => {
            if (v == xhr) {
                this.xhrList.slice(index, 1)
            }
        })
        xhr.ontimeout = null
        xhr.onerror = null
        xhr.onabort = null
        xhr.onreadystatechange = null
        xhr = null
    }

    private notifyCallback(cb: handler, code: number, data?) {
        if (cb) {
            cb.exec(code, data)
        }
    }

    private setHttpHeaders(xhr: XMLHttpRequest, headers) {
        for (let key in headers) {
            xhr.setRequestHeader(key, headers[key])
        }
    }

    private getQueryString(params) {
        const tmps: string[] = []
        for (let key in params) {
            tmps.push(`${key}=${params[key]}`)
        }
        return tmps.join('&')
    }

    codeByText(code) {
        if (code == HttpCode.kSuccess) {
            return '请求成功'
        } else if (code == HttpCode.kTimeout) {
            return '请求超时'
        } else if (code == HttpCode.KAchievement) {
            return '存款通道繁忙，请稍后再试！'
        } else {
            return '网络异常'
        }
    }
}

export enum HttpCode {
    kSuccess = 0,
    KAchievement = 400,
    kTimeout = 10000,
    kUnknown = 10001,
    kSessionTimeout = -8,
    kIAmInBlocklist = -3013,
    kUserIsInMyBlocklist = -3014
}