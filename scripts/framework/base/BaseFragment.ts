import BaseView from "./BaseView";
import { _decorator, Node, Widget, resources, Prefab, instantiate, UITransform, BlockInputEvents } from 'cc';
import { Logger, LoogerLevel } from "../utils/Logger";
import SceneManager from "../core/SceneManager";

const { ccclass, property } = _decorator;
@ccclass
export default class BaseFragment extends BaseView{

    private childFragments: Array<BaseFragment> = null;
    private _currentFragment:BaseFragment = null;
    public get currentFragment(): BaseFragment {
        return this._currentFragment;
    }

    constructor(){
        super();
    }

    protected onLoad() {
        this.childFragments = [];
    }

    protected start(){

    }

    //界面被隐藏的时候
    protected onPause():void{

    }
    //界面恢复启用的时候
    protected onResume():void{

    }

    //界面无效时调用
    protected onDestroy(){
        for(let ft of this.childFragments){
            ft.destroy();
            ft = null;
        }
        this.childFragments.length = 0;
        this.childFragments = null;
        this._currentFragment = null;
    }

     /**
     * replaceFragment(node,BaseFragment.Class);
     * replaceFragment(fragment,BaseFragment.Class); 
     * replaceFragment(fragment1,fragment2);
     * replaceFragment(node,fragment);
     * @param originFragment 源fragemnt
     * @param targetFragmentClass 目标fragment 
     * @param params 界面参数
     * @param options 可选参数
     * @returns 创建完成会返回一个fragment节点 
     */
      public replaceFragment(originFragment: BaseFragment | Node, targetFragment: BaseFragment | any, params?, options={cache:false}): Promise<BaseFragment> {
        if(targetFragment && this.currentFragment && targetFragment.uniqueID === this.currentFragment.uniqueID){
            Logger.warn(`replaceFragment===>${targetFragment.node._name}已存在 不可重复添加！！！！`,{level:LoogerLevel.FrameWork});
            return;
        }
        let mode = 0;
        let widget: Widget = originFragment.getComponent(Widget);
        if (!widget) {
            Logger.error(`replaceFragment===>widget is ${widget}`,{level:LoogerLevel.FrameWork});
            return;
        }
        if (originFragment instanceof Node) {
            if (!(originFragment as Node).parent) {
                Logger.warn('replaceFragment===>node not parent',{level:LoogerLevel.FrameWork});
                return;
            }
        }

        //如果源是baseFragment 那么必选存在
        if (originFragment instanceof BaseFragment) {
            if (!this.matchFragment(originFragment.uniqueID)) {
                Logger.error('replaceFragment===>没有匹配到要替换的originFragment',{level:LoogerLevel.FrameWork});
                return;
            }
            mode = mode | 2;
        }

        if (targetFragment instanceof BaseFragment) {
            mode = mode | 4;
        }

        SceneManager.getInstance().blockScreenInput(true);
        return new Promise(async res => {
            let node = null;
            let fragment: BaseFragment = null;
            if (0 === mode || 2 === mode) {
                //Node & Function     
                //BaseFragment & Function
                const path = targetFragment.getPath();
                const objects = await this.crateFragment(path);
                fragment = objects[0];
                node = fragment.node;
                let w = node.getComponent(Widget);
                SceneManager.widgetCopy(widget, w);
                if(0 === mode){
                    (originFragment as Node).parent.addChild(node);
                    (originFragment as Node).destroy();
                }else{
                    (originFragment as BaseFragment).node.parent.addChild(node);
                    ////如果不缓存该页面则销毁掉上一个页面
                    if(!options.cache){
                        this.removeFragment(originFragment as BaseFragment);
                    }else{
                        (originFragment as BaseFragment).node.removeFromParent();
                    }
                }
            }else if(4 === mode){
                 //Node & BaseFragment
                fragment = targetFragment;
                node = fragment.node;
                let w = node.getComponent(Widget);
                SceneManager.widgetCopy(widget, w);
                (originFragment as Node).parent.addChild(node);
                (originFragment as Node).destroy();
            }else if (6 === mode) {
                //BaseFragment & BaseFragment
                fragment = targetFragment;
                node = fragment.node;
                let w = node.getComponent(Widget);
                SceneManager.widgetCopy(widget, w);
                //如果不缓存该页面则销毁掉上一个页面
                if(!this.matchFragment(fragment.uniqueID)){
                    (originFragment as BaseFragment).node.parent.addChild(node);
                }else{
                    targetFragment.node.setSiblingIndex((originFragment as any).node.getSiblingIndex()+1); 
                    let cur:any = fragment;
                    while(cur){
                        cur.onResume();
                        cur = cur.currentFragment;
                    }
                    (targetFragment as BaseFragment).node.active = true;
                }
                if(!options.cache){
                    this.removeFragment(originFragment as BaseFragment);
                }else{
                    let cur:any = originFragment;
                    while(cur){
                        cur.onPause();
                        cur = cur.currentFragment;
                    }
                    (originFragment as BaseFragment).node.active = false;
                }
            }
            this._currentFragment = fragment;
            this.addFragment(fragment);
            res(fragment);
            SceneManager.getInstance().blockScreenInput(false);
        })
    }
    public async crateFragment(...paths): Promise<any> {
        return new Promise(async res => {
            const rets = [];
            for (const path of paths) {
                const prefab = await new Promise(cb => {
                    resources.load(path, (e, p: Prefab) => {
                        e ? cb(null) : cb(p);
                    })
                });
                const node: any = instantiate(prefab);
                if (!node.getComponent(Widget)) {
                    Logger.warn('crateFragment===>没有配置widget',{level:LoogerLevel.FrameWork});
                    node.addComponent(Widget);
                }
                if(!node.getComponent(BlockInputEvents)){
                    node.addComponent(BlockInputEvents);
                }
                const fragment = node.getComponent(BaseFragment);
                rets.push(fragment);
            }
            res(rets);
        })
    }

    /**
     * @param id fragment对象的唯一id 
     * @returns true 存在缓存里 false 不存在缓存里
     */
    public matchFragment(id): boolean {
        // in 获取key of获取 值
        for (const ft of this.childFragments) {
            if (id === ft.uniqueID) {
                return true;
            }
        }
        return false;
    }

    private addFragment(fragment: BaseFragment) {
        if (fragment) {
            if (!this.matchFragment(fragment.uniqueID)) {
                this.childFragments.push(fragment);
                return;
            }
        }
    }
    private removeFragment(fragment: BaseFragment) {
        if (fragment) {
            let index = 0;
            for (const ft of this.childFragments) {
                if (ft.uniqueID === fragment.uniqueID) {
                    this.childFragments.splice(index, 1);
                    ft.node.destroy();
                    return;
                }
                index += 1;
            }
        }
    }
}