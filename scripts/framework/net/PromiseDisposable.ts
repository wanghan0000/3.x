export default class PromiseDisposable{
    
    private promises:Array<Promise<any>> = [];
    
    addPromise(promise:Promise<any>){
        let p = this.bindAbort(promise);
        this.promises.push(p);
        return p;
    }

    abort(){
        this.promises.forEach((v)=>{
            v['xhr']?.abort();
            if(v['abort']){
                v['abort']();
            }
        })
        this.promises.length = 0;
    }


    private bindAbort(p):Promise<any>{
        let abort;
        let p1 = new Promise((resolve, reject) => (abort = reject));
        let p2 = Promise.race([p, p1])
        p2['abort'] = abort;
        p2['xhr'] = p['xhr'];
        return p2;
    }
}