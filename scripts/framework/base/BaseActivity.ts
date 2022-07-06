import BaseView from "./BaseView";
import { _decorator, Node, Widget, resources, Prefab, instantiate, UITransform, BlockInputEvents, tween, UIOpacity, v2, v3, Mask } from 'cc';
import BaseFragment from "./BaseFragment";
import { Logger, LoogerLevel } from "../utils/Logger";
import BaseDialog, { Gravity, Options } from "./BaseDialog";
import SceneManager from "../core/SceneManager";

const { property } = _decorator;

export default class BaseActivity extends BaseFragment {
    /**
     * 必须要有的根节点
     */
    @property(Node)
    private root: Node = null;
    public get rootNode(): Node {
        return this.root;
    }
    @property(Node)
    private mask:Node = null;
    public get maskNode() : Node {
        return this.mask
    }
    

    /**
     * 界面上的弹窗
     */
    private dialogs: Array<BaseDialog> = null;
    private _topDialog: BaseDialog = null;

    protected onLoad() {
        super.onLoad();
        if(!this.root || !this.mask){
            Logger.error({txt:`${this.node['_name']}没有配置 root节点 与 mask 节点 请检查`});
        }
        this.dialogs = [];
    }
    protected onDestroy() {
        super.onDestroy();
        this.root = null;
        this.mask = null;
        for (let dg of this.dialogs) {
            dg.destroy();
            dg = null;
        }
        this.dialogs.length = 0;
        this.dialogs = null;
        this._topDialog = null;
    }

    start() {

    }

    //界面被隐藏的时候
    protected onPause(): void {
        Logger.log(`${this.node['_name']}===>onPause`, { level: LoogerLevel.FrameWork });
    };
    //界面恢复启用的时候
    protected onResume(): void {
        Logger.log(`${this.node['_name']}===>onResume`, { level: LoogerLevel.FrameWork });
    }
    //界面参数
    protected onParams(params): void {
        Logger.log(`${this.node['_name']}===>params`, { level: LoogerLevel.FrameWork });
    }
    //进入页面动画结束后调用
    protected moveInAnimationEnd() {
        Logger.log(`${this.node['_name']}===>moveInAnimationEnd`, { level: LoogerLevel.FrameWork });
    }

    /**
     * 
     * @param dialog 要展示的dialog
     * @param params 携带参数
     * @param options anchorView 要停靠的节点位置 配合Gravity使用 cover是否全屏展示
     */
    public showDialog(dialog: BaseDialog, params?, options?: Options) {
        if (this.matchDialog(dialog.uniqueID)) {
            Logger.warn(`showDialog===>${dialog.node['_name']}已存在 不可重复添加！！！！`, { level: LoogerLevel.FrameWork });
            return;
        }
        options = options ? options : { anchorView: this.root, cover: true, point: v2(0, 0) };
        let dialogBg;
        if (!this._topDialog) {
            dialogBg = SceneManager.getInstance().createDialogBackground();
            const uIOpacity = dialogBg['maskBackground'].getComponent(UIOpacity);
            uIOpacity.opacity = 0;
            SceneManager.getInstance().blockScreenInput(true);
            tween(uIOpacity).to(0.2, { opacity: 45 }, { easing: 'backIn' }).call(() => {
                SceneManager.getInstance().blockScreenInput(false);
            }).start();
            this.root.addChild(dialogBg);
            dialogBg.on(Node.EventType.TOUCH_END, () => {
                if (this._topDialog.tochBackgoundClose) {
                    this._topDialog.dismiss();
                    this.dialogs.pop();
                    this._topDialog = this.dialogs[this.dialogs.length - 1];
                    if (!this._topDialog) {
                        SceneManager.getInstance().blockScreenInput(true);
                        tween(uIOpacity).to(0.3, { opacity: 0 }, { easing: 'backInOut' }).call(() => {
                            dialogBg.destroy();
                            SceneManager.getInstance().blockScreenInput(false);
                        }).start();
                    }
                }
            });
            dialogBg.setSiblingIndex(Number.MAX_SAFE_INTEGER);
        }
        
        const mask = dialog.root || SceneManager.getInstance().createMask();
        this.mask.addChild(mask);
        const maskW : Widget = mask.getComponent(Widget);
        if( dialog.node.parent?.uuid != mask.uuid){
            mask.addChild(dialog.node);
        }
        dialog['onBindData'](params,mask,options);
        if (!this._topDialog && !options.cover) {
            maskW.left = maskW.right = maskW.top =maskW.bottom = 0;
            const v = dialog.node.position;
            const maskBg = dialogBg['maskBackground'];
            const widget: Widget = maskBg.getComponent(Widget);
            const size = dialog.node.getComponent(UITransform).contentSize;
            const winSize = this.root.getComponent(UITransform).contentSize;
            if (Gravity.Top == options.gravity || Gravity.InBottom == options.gravity) {
                widget.bottom = winSize.height / 2 + v.y - size.height / 2;
                maskW.bottom = widget.bottom;
                //目标位置
                dialog.node.position = v3(dialog.node.position.x,dialog.node.position.y - maskW.bottom / 2);
            } else if (Gravity.Bottom == options.gravity || Gravity.InTop == options.gravity) {
                widget.top = winSize.height / 2 - v.y - size.height / 2;
                maskW.top = widget.top;
                dialog.node.position = v3(dialog.node.position.x,dialog.node.position.y + maskW.top / 2);
            } else if (Gravity.Left == options.gravity || Gravity.InRight == options.gravity) {
                widget.right = winSize.width / 2 - v.x - size.width / 2;
                maskW.right = widget.right;
                dialog.node.position = v3(dialog.node.position.x + maskW.right / 2,dialog.node.position.y);
            } else if (Gravity.Right == options.gravity || Gravity.InLeft == options.gravity) {
                widget.left = winSize.width / 2 + v.x - size.width / 2;
                maskW.left = widget.left;
                dialog.node.position = v3(dialog.node.position.x - maskW.left / 2,dialog.node.position.y);
            }
            maskW.updateAlignment();
        }
        dialog['show']();
        this.dialogs.push(dialog);
        this._topDialog = dialog;
    }

    /**
    * @param id fragment对象的唯一id 
    * @returns true 存在缓存里 false 不存在缓存里
    */
    public matchDialog(id): boolean {
        // in 获取key of获取 值
        for (const dg of this.dialogs) {
            if (id === dg.uniqueID) {
                return true;
            }
        }
        return false;
    }
}