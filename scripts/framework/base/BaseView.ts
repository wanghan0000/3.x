import { Component } from "cc";
import PromiseDisposable from "../net/PromiseDisposable";

export default abstract class BaseView extends Component {
    //界面是否存活
    protected isActive: boolean = true;
    
    protected promiseDisposable:PromiseDisposable = new PromiseDisposable();

    //唯一ID
    public uniqueID = Symbol();

    public static getPath() {
        return ''
    }

    protected onDestroy(){
        this.promiseDisposable.abort();
        this.promiseDisposable = null;
        this.isActive = false;
    }
}