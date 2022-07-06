import { Logger } from "../utils/Logger";
import { _decorator, Node, Label,resources,instantiate,Prefab, UIOpacity, tween, UITransform} from 'cc';
export class Toast{

    public static get resPath():string{
       return 'skin1/components/Toast';
    }

    private top: Node = null;

    private static _instance:Toast = null;

    private nodePool: Node[] = null;

    public static getInstance(): Toast {
        return this._instance;
    }

    public static init(top:Node): void {
        if (this._instance) {
            Logger.warn('Toast===> init has be call')
            return
        }
        this._instance = new Toast(top);
    }

    private constructor(top){
        this.top = top;
        this.nodePool = [];
    }

    static show(params:{txt:string}) {
        Toast.getInstance().make(params);
    }

    private make(params:{txt:string})
    {
        if(this.nodePool.length > 0) {
            this.configure(this.nodePool.pop(), params);
        }
        else{
            resources.load(Toast.resPath, (error: Error, prefab: Prefab) => {
                if (!error) {
                    let node = instantiate(prefab);      // 实例化节点
                    this.configure(node, params);
                }
            });
        }
    }

    private configure(node:Node, params:{txt:string})
    {
        const label :any= node.getChildByName('txt').getComponent(Label);
        const uiTransform = label.getComponent(UITransform);
        label.string = params.txt;
0        //label size
        label.overflow = Label.Overflow.NONE;
        label.updateRenderData(true);
        let labelWidth = uiTransform.width;
        let labelHeight = uiTransform.height;
        if(labelWidth > 450) {
            labelWidth = 450;
            uiTransform.width = labelWidth;
            label.overflow = Label.Overflow.RESIZE_HEIGHT;
            label.updateRenderData(true);
            labelHeight = uiTransform.height;
            if(labelHeight > 90) {
                labelHeight = 90
                uiTransform.height = labelHeight;
                label.overflow = Label.Overflow.SHRINK;
            }
        }
        //bg size
        const bg = label.node.parent;
        let bgWidth = Math.max(180, labelWidth + 50);
        let bgHeight = Math.max(70, labelHeight + 30);
        bg.getComponent(UITransform).setContentSize(bgWidth, bgHeight);
        this.run(node,false);
    }

    private run(node:Node,isDast:boolean)
    {
        this.top.addChild(node);
        const uIOpacity = node.getComponent(UIOpacity);
        uIOpacity.opacity = 0;
        tween(uIOpacity).to(0.2,{opacity:255},{easing:'backIn'})
        .delay(1.5)
        .to(0.5,{opacity:0},{easing:'backIn'})
        .call(()=>{
            node.removeFromParent();
            this.nodePool.push(node);
        })
        .start();
    }

}
