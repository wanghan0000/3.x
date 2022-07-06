import { Logger } from "../utils/Logger";
import { _decorator, Node, Label, resources, instantiate, Prefab, UIOpacity, tween, UITransform, v3, Button, EventHandler, Component } from 'cc';
import SceneManager from "../core/SceneManager";
export class Alert {

    public static get resPath(): string {
        return 'skin1/components/Alert';
    }

    private top: Node = null;

    private static _instance: Alert = null;


    public static getInstance(): Alert {
        return this._instance;
    }

    public static init(top: Node): void {
        if (this._instance) {
            Logger.warn('Toast===> init has be call')
            return
        }
        this._instance = new Alert(top);
    }

    private constructor(top) {
        this.top = top;
    }

    static show(content: string, callback?: Function, labelOk?: string) {
        Alert.getInstance().make(content, callback, labelOk);
    }

    private make(content: string, callback?: Function, labelOk?: string) {
        SceneManager.getInstance().blockScreenInput(true);
        resources.load(Alert.resPath, (error: Error, prefab: Prefab) => {
            if (!error) {
                const node:any = instantiate(prefab);      // 实例化节点
                node.callback = callback;
                node.content = content;
                SceneManager.makeNodeMap(node);
                if (labelOk){
				    SceneManager.getNode(node, 'lb-ok').getComponent(Label).string = labelOk;
                }
                const lbContent: Node = SceneManager.getNode(node, "lb-content");
                lbContent.getComponent(Label)!.string = content;
                lbContent.getComponent(Label)!.updateRenderData(true); //更新Label高度
                const contentHeight = Math.max(400, lbContent.getComponent(UITransform)!.height + 140);
                const nodeContent: Node = SceneManager.getNode(node, "node-content");
                nodeContent.getComponent(UITransform)!.height = contentHeight;
                nodeContent.setScale(1.2, 1.2);

                tween(nodeContent).to(0.15, {scale: v3(1,1,1)}).start();
                tween(SceneManager.getNode(node, "mask").getComponent(UIOpacity)).to(0.15, {opacity:90}).start();
                
                let btnOk:Node = SceneManager.getNode(node, "btn-ok");
                btnOk.once(Node.EventType.TOUCH_END,()=>{
                    node.destroy();
                    callback && callback();
                })
                this.top.addChild(node);
            }
            SceneManager.getInstance().blockScreenInput(false);
        });

    }
}
