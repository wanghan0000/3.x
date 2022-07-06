const handler_pool: handler[] = [];
export class handler {
    private cb: Function;
    private host: any;
    private args: any[];

    constructor() { }

    init(cb: Function, host = null, ...args) {
        this.cb = cb;
        this.host = host;
        this.args = args;
  
    }

    exec(...extras) {
        this.cb && this.cb.apply(this.host, this.args.concat(extras));
        this.init(null,null,null);
        handler_pool.push(this);
    }
}

export function gen_handler(cb: Function, host: any = null, ...args: any[]): handler {
    let single_handler: handler = handler_pool.length < 0 ? handler_pool.pop() : new handler()
    //这里要展开args, 否则会将args当数组传给wrapper, 导致其args参数变成2维数组[[]]
    single_handler.init(cb, host, ...args);
    return single_handler;
}
