import { _decorator, Component, Node, Tween, view, screen, ResolutionPolicy, tween, v3, resources, instantiate, Prefab, Widget, UITransform, BlockInputEvents, Sprite, UIOpacity, Color, SpriteFrame, Mask } from 'cc';
import BaseActivity from '../base/BaseActivity';
import BaseDialog, { Options } from '../base/BaseDialog';
import { Logger, LoogerLevel } from '../utils/Logger';

export default class SceneManager {

    private static _instance: SceneManager = null;

    //根节点
    private _root: Node = null;
    public get root() : Node {
        return this._root;
    }
    

    private top: Node = null;

    private blockInput: Node = null;

    private currentActivity: BaseActivity = null;

    private baseActivitys: Array<BaseActivity> = null;
    /**
 * 	moveInAction: 进入动画
 *  nextInAction: 进入时，上一页面的动画
 *  moveOutAction: 关闭动画
 *  nextOutAction: 关闭时，上一页面的动画
 */
    private moveInAction: Tween<any> = null;
    private nextInAction: Tween<any> = null;
    private moveOutAction: Tween<any> = null;
    private nextOutAction: Tween<any> = null;


    public static getInstance(): SceneManager {
        return this._instance;
    }

    public static init(rootNode: Node, top, blockInput): void {
        if (this._instance) {
            Logger.warn('SceneManager===> init has be call')
            return
        }
        this._instance = new SceneManager(rootNode, top, blockInput);
    }

    private constructor(rootNode: Node, top, blockInput) {
        this._root = rootNode;
        this.top = top;
        this.blockInput = blockInput;
        this.baseActivitys = [];
        const size = screen.windowSize;
        if (Math.ceil(size.height) < 750) {
            view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.FIXED_HEIGHT);
        } else if (Math.ceil(size.width) < 0) {
            view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.FIXED_WIDTH);
        }
        const sw = Math.round(size.width);
        const sh = Math.round(size.height);
        this.moveInAction = tween().delay(0.1).to(0.55, { left: 0, right: 0 }, { easing: "expoOut" });
        this.nextInAction = tween().delay(0.1).to(0.55, { left: -750 * 0.35, right: 750 * 0.35 }, { easing: "expoOut" });
        this.nextOutAction = tween().to(0.55, { left: 0, right: 0 }, { easing: "expoOut" });
    }

    public openActivity(from: BaseActivity, to: any, params?, options?: { runAction?: boolean }) {
        this.blockInput.active = true;
        this.crateActivity(to.getPath()).then((objects) => {
            let activity = objects[0];
            const node: any = activity.node;
            this.root.addChild(node);
            if (!node.getComponent(BlockInputEvents)) {
                node.addComponent(BlockInputEvents);
            }
            activity.onParams(params);
            if (options && options.runAction) {
                let moveIn = node.getComponent(Widget);
                moveIn.left = 750 * 0.55;
                moveIn.right = -750 * 0.55
                tween(moveIn).then(this.moveInAction).call(() => {
                    activity.moveInAnimationEnd();
                }).start();
                let nextIn = from.node.getComponent(Widget);
                tween(nextIn).then(this.nextInAction).call(() => {
                    (from as any).onPause();
                    from.node.active = false;
                    this.blockInput.active = false;
                }).start();
            } else {
                activity.moveInAnimationEnd();
                (from as any).onPause();
                this.blockInput.active = false;
            }
            this.currentActivity = activity;
            this.baseActivitys.push(activity);
        })
    }

    public startActivity(activityClass) {
        this.blockInput.active = true;
        this.crateActivity(activityClass.getPath()).then((objects) => {
            let activity = objects[0];
            const node: any = activity.node;
            node.setPosition(0, 0);
            if (!node.getComponent(BlockInputEvents)) {
                node.addComponent(BlockInputEvents);
            }
            this.root.addChild(node);
            this.currentActivity = activity;
            this.baseActivitys.push(activity);
            this.blockInput.active = false;
        })
    }

    public finishActivity(activity: BaseActivity, options?: { runAction?: boolean }): boolean {
        if (this.baseActivitys.length <= 1) {
            Logger.warn('finishActivity====>activity数量小于等于1不可销毁', { level: LoogerLevel.FrameWork });
            return false;
        }
        this.blockInput.active = true;
        let index = 0;
        for (const act of this.baseActivitys) {
            if (act.uniqueID === activity.uniqueID) {
                this.baseActivitys.splice(index, 1);
                let curAct = this.baseActivitys[this.baseActivitys.length - 1];
                curAct.node.active = true;
                if (options && options.runAction) {
                    const sw = act.node.getComponent(UITransform);
                    this.moveOutAction = tween().to(0.55, { left: sw.width, right: -sw.width }, { easing: "expoOut" });
                    let moveOut = act.node.getComponent(Widget);
                    let nextIn = curAct.node.getComponent(Widget);
                    tween(moveOut).then(this.moveOutAction).call(() => {
                        act.node.destroy();
                        this.blockInput.active = false;
                    }).start();
                    tween(nextIn).then(this.nextOutAction).start();
                } else {
                    this.blockInput.active = false;
                }
                (curAct as any).onResume();

                let curFragment = (curAct as any).currentFragment;
                while (curFragment) {
                    curFragment.onResume();
                    curFragment = curFragment.currentFragment;
                }
                this.currentActivity = curAct;
                return true;
            }
            index += 1;
        }
        return false;
    }

    private async crateActivity(...paths): Promise<any> {
        return new Promise(async res => {
            let rets = [];
            for (const path of paths) {
                let prefab = await new Promise(cb => {
                    resources.load(path, (e, p: Prefab) => {
                        e ? cb(null) : cb(p);
                    })
                });
                const node: any = instantiate(prefab);
                if (!node.getComponent(Widget)) {
                    Logger.warn('crateActivity===>没有配置widget', { level: LoogerLevel.FrameWork })
                    node.addComponent(Widget);
                }
                const activity = node.getComponent(BaseActivity);
                rets.push(activity);
            }
            res(rets);
        })
    }

    public blockScreenInput(isBlock) {
        this.blockInput.active = isBlock;
    }

    public getActivity(): BaseActivity {
        return this.currentActivity;
    }

    //从map取出节点
    static getNode(pageOrNode: any, name: string) {
        const node = (pageOrNode instanceof Component) && pageOrNode.node ? pageOrNode.node : pageOrNode;
        return node && node._nodeMap && node._nodeMap[name];
    }

    //将节点放入map
    static makeNodeMap(node: any) {
        node._nodeMap = {};
        const f = function (e: any) {
            node._nodeMap[e.name] = e;
            for (var i in e.children)
                f(e.children[i]);
        };
        f(node);
    }

    public createDialog(className): Promise<BaseDialog> {
        SceneManager.getInstance().blockScreenInput(true);
        return new Promise(async res => {
            const path = className.getPath();
            const prefab = await new Promise(cb => {
                resources.load(path, (e, p: Prefab) => {
                    e ? cb(null) : cb(p);
                })
            })
            const node: any = instantiate(prefab);
            if (!node.getComponent(BlockInputEvents)) {
                node.addComponent(BlockInputEvents);
            }
            if(!node.getComponent(UIOpacity)){
                node.addComponent(UIOpacity);
            }
            if(!node.getComponent(UITransform)){
                node.addComponent(UITransform);
            }
            const dialog = node.getComponent(BaseDialog);
            res(dialog);
            SceneManager.getInstance().blockScreenInput(false);
        })
    }

    public showDialog(className,activity:BaseActivity,params?,options?:Options){
        this.createDialog(className).then((dialog)=>{
            activity.showDialog(dialog,params,options);
        })
    }

    public createDialogBackground() {
        //创建弹窗背景
        const background = new Node();
        background.addComponent(UITransform);
        const mw = background.addComponent(Widget);
        background.addComponent(BlockInputEvents);

        const bg = new Node();
        bg.addComponent(UITransform);
        const w = bg.addComponent(Widget);
        const uIOpacity = bg.addComponent(UIOpacity);
        const sp = bg.addComponent(Sprite);

        w.isAlignLeft = w.isAlignRight = w.isAlignTop = w.isAlignBottom = true;
        w.left = w.right = w.top = w.bottom = 0;
        w.alignMode = 2;
        SceneManager.widgetCopy(w,mw);
        sp.type = 1;//九宫切片
        sp.sizeMode = 0;
        sp.color = Color.BLACK.clone();
        resources.load('skin1/imgs/default_sprite_splash/spriteFrame',SpriteFrame,(err,data)=>{
            if(!err){
                sp.spriteFrame = data;
            }
        });
        uIOpacity.opacity = 55;
        background.addChild(bg);
        background['maskBackground'] = bg;
        background.setPosition(0,0);
        return background;
    }
    public createMask(){
        const mask = new Node('dialogMask');
        mask.addComponent(UITransform);
        mask.addComponent(Mask);
        const w = mask.addComponent(Widget);
        w.isAlignLeft = w.isAlignRight = w.isAlignTop = w.isAlignBottom = true;
        w.left = w.right = w.top = w.bottom = 0;
        w.alignMode = 2;
        return mask;
    }

    static widgetCopy(originWidget: Widget, targetWidget: Widget){
        const attributes = [
            'isAlignLeft',
            'isAlignRight',
            'isAlignTop',
            'isAlignBottom',
            'isAbsoluteLeft',
            'isAbsoluteRight',
            'isAbsoluteTop',
            'isAbsoluteBottom',
            'left',
            'right',
            'top',
            'bottom',
            'isAlignVerticalCenter',
            'isAlignHorizontalCenter',
            'horizontalCenter',
            'editorHorizontalCenter',
            'verticalCenter',
            'editorVerticalCenter',
            'isAbsoluteHorizontalCenter',
            'isAbsoluteVerticalCenter',
            'alignMode',
        ]
        for (const att of attributes) {
            targetWidget[att] = originWidget[att];
        }
    }
}