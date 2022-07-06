import { _decorator, Node, Widget, v3, UITransform, tween, Vec2, v2, math, Tween, UIOpacity } from "cc";
import SceneManager from "../core/SceneManager";
import BaseActivity from "./BaseActivity";
import BaseView from "./BaseView";

export enum Gravity {
    Left = 'Left',
    Right = 'Right',
    Top = 'Top',
    Bottom = 'Bottom',
    InLeft = 'InLeft',
    InRight = 'InRight',
    InTop = 'InTop',
    InBottom = 'InBottom',
    Center = 'Center'
}

export class Options {
    /**
     * 弹窗停靠的目标 null则默认停靠点为屏幕
     */
    anchorView: Node;
    /**
     * 背景黑色是否覆盖屏幕 true 全屏幕 false保留anchorView的内容区域并进行裁剪
     */
    cover: boolean;
    /**
     * 偏移量
     */
    point?: Vec2;
    //让弹窗在anchorView的某个方位 
    gravity?: Gravity;
}

const { property } = _decorator;
export default abstract class BaseDialog extends BaseView {

    static getPath() {
        return ''
    }

    private _root: Node = null;
    public get root(): Node {
        return this._root;
    }


    private activity: BaseActivity = null;

    private options: Options = null;

    protected _tochBackgoundClose: boolean = false;
    public get tochBackgoundClose(): boolean {
        return this._tochBackgoundClose;
    }

    //节点被onLoad后
    protected abstract onCreated();

    /**
     * @param params 进场数据
     */
    protected abstract onBundleData(params);

    /**
     * 进场动画之前
     */
    protected abstract onAnimationBefore();
    /**
     * 进场动画
     * 有动画则动画完成触发 没有则直接触发
     */
    protected abstract onShowAnimationEnd();

    /**
     * 出场动画之前
     * 有动画则动画完成触发 没有则直接触发
     */
    protected abstract onDismissAnimationBefore();
    /**
     * 出场动画
     * 有动画则动画完成触发 没有则直接触发
     */
    protected abstract onDismissAnimationEnd();

    /**
     * 节点被销毁
     */
    protected abstract destroyed();
    /**
     * 进场动画 可自定义
     * @param node 
     * @returns 
     */
    protected showAnim<T>(): Tween<T> {
        return BaseDialog.scaleIn(this);
    }

    /**
     * 出场动画 可自定义
     * @returns 
     */
    protected closeAnim<T>(): Tween<T> {
        return BaseDialog.scaleOut();
    }

    private adapter() {
        const root = SceneManager.getInstance().getActivity().rootNode;
        const node = this.node;
        const anchorView = this.options.anchorView || this.root.parent; // SceneManager.getInstance().getActivity().rootNode;
        const point = this.options.point || v2(0, 0);
        //const winSize = root.getComponent(UITransform).contentSize || { width: 0, height: 0 };
        const gravity = this.options.gravity;
        node._removeComponent(node.getComponent(Widget));
        //获取anchorView的 世界坐标
        let vec = v3(0, 0, 0);
        anchorView?.getWorldPosition(vec);
        //再转换到root中 得到相对坐标
        vec = root.getComponent(UITransform).convertToNodeSpaceAR(vec);

        const nodeUiTransform = node.getComponent(UITransform);
        const uiTransform = anchorView?.getComponent(UITransform);
        const anx = uiTransform ? uiTransform.anchorX : 0.5;
        const any = uiTransform ? uiTransform.anchorY : 0.5;
        const nodeW = nodeUiTransform?.width || 0;
        const nodeH = nodeUiTransform?.height || 0;
        const anchorW = uiTransform?.width || 0;
        const anchorH = uiTransform?.height || 0;
        const nodeHalfWidth = nodeW / 2;
        const nodeHalfHight = nodeH / 2;
        const anchorHalfWidth = anchorW / 2;
        const anchorHalfHight = anchorH / 2;
        //得到该anchorView 的中心坐标
        const centerV = v3(
            vec.x + (anx - 0.5) * anchorW,
            vec.y - (any - 0.5) * anchorH
        );
        if (gravity == Gravity.Center) {
            vec.x = centerV.x + point.x;
            vec.y = centerV.y + point.y;
        } else if (gravity == Gravity.Left) {
            //获取得到该anchorView 左侧的坐标
            const leftV = v3(0, 0, 0);
            centerV.y = centerV.y + point.y;
            leftV.x = centerV.x - anchorHalfWidth - nodeHalfWidth + point.x;
            leftV.y = centerV.y;
            vec = leftV;
            // const borderLeft = leftV.x - nodeHalfWidth;
            // if (borderLeft < -winSize.width / 2) {
            //     let deltaLeft = Math.abs((-winSize.width / 2) - borderLeft);
            //     const rightV = v3(0, 0, 0);
            //     rightV.x = centerV.x + anchorHalfWidth + nodeHalfWidth - point.x;
            //     rightV.y = centerV.y;
            //     const borderRight = rightV.x + nodeHalfWidth;
            //     if (borderRight > winSize.width / 2) {
            //         let deltaRight = Math.abs(winSize.width / 2 - borderRight);
            //         if (deltaLeft <= deltaRight) {
            //             vec = leftV;
            //         } else {
            //             vec = rightV;
            //         }
            //     } else {
            //         vec = rightV;
            //     }
            // } else {
            //     vec = leftV;
            // }
        } else if (gravity == Gravity.Right) {
            const rightV = v3(0, 0, 0);
            rightV.x = centerV.x + anchorHalfWidth + nodeHalfWidth + point.x;
            rightV.y = centerV.y;
            vec = rightV;
            // const borderRight = rightV.x + nodeHalfWidth;
            // if (borderRight > winSize.width / 2) {
            //     const deltaRight = Math.abs(winSize.width / 2 - borderRight);
            //     const leftV = v3(0, 0, 0);
            //     leftV.x = centerV.x - anchorHalfWidth - nodeHalfWidth - point.x;
            //     leftV.y = centerV.y;
            //     const borderLeft = leftV.x - nodeHalfWidth;
            //     if (borderLeft > -winSize.width / 2) {
            //         vec = leftV;
            //     } else {
            //         const deltaLeft = Math.abs((-winSize.width / 2) - borderLeft);
            //         if (deltaLeft < deltaRight) {
            //             vec = leftV;
            //         } else {
            //             vec = rightV;
            //         }
            //     }
            // } else {
            //     vec = rightV;
            // }
        } else if (gravity == Gravity.Top) {
            const topV = v3(0, 0, 0);
            centerV.x = centerV.x + point.x;
            topV.x = centerV.x;
            topV.y = centerV.y + anchorHalfHight + nodeHalfHight + point.x;
            vec = topV;
            // const borderTop = topV.y + nodeHalfHight;
            // if (borderTop > winSize.height / 2) {
            //     const deltaTop = borderTop - winSize.height / 2;
            //     const bottomV = v3(0, 0, 0);
            //     bottomV.x = centerV.x;
            //     bottomV.y = centerV.y - anchorHalfHight - nodeHalfHight - point.y;
            //     const borderBottom = bottomV.y - nodeHalfHight;
            //     if (borderBottom < -winSize.height / 2) {
            //         const deltaBottom = Math.abs((-winSize.height / 2) - borderBottom);
            //         if (deltaBottom >= deltaTop) {
            //             vec = topV;
            //         } else {
            //             vec = bottomV;
            //         }
            //     } else {
            //         vec = bottomV;
            //     }
            // } else {
            //     vec = topV;
            // }
        } else if (gravity == Gravity.Bottom) {
            const bottomV = v3(0, 0, 0);
            bottomV.x = centerV.x + point.x;
            bottomV.y = centerV.y - anchorHalfHight - nodeHalfHight + point.y;
            vec = bottomV;
            // const borderBottom = bottomV.y - nodeHalfHight;
            // if (borderBottom < -winSize.height / 2) {
            //     const deltaBottom = Math.abs((-winSize.height / 2) - borderBottom);
            //     const topV = v3(0, 0, 0);
            //     topV.x = centerV.x;
            //     topV.y = centerV.y + anchorHalfHight + nodeHalfHight - point.x;
            //     const borderTop = topV.y + nodeHalfHight;
            //     if (borderTop < winSize.height / 2) {
            //         vec = topV;
            //     } else {
            //         const deltaTop = borderTop - winSize.height / 2;
            //         if (deltaTop >= deltaBottom) {
            //             vec = bottomV;
            //         } else {
            //             vec = topV;
            //         }
            //     }
            // } else {
            //     vec = bottomV;
            // }
        } else if (gravity == Gravity.InLeft) {
            const leftV = v3(0, 0, 0);
            centerV.y = centerV.y + point.y;
            leftV.x = centerV.x - anchorHalfWidth + nodeHalfWidth + point.x;
            leftV.y = centerV.y;
            vec = leftV;
        } else if (gravity == Gravity.InRight) {
            const rightV = v3(0, 0, 0);
            rightV.x = centerV.x + anchorHalfWidth - nodeHalfWidth + point.x;
            rightV.y = centerV.y;
            vec = rightV;
        } else if (gravity == Gravity.InTop) {
            const topV = v3(0, 0, 0);
            centerV.x = centerV.x + point.x;
            topV.x = centerV.x;
            topV.y = centerV.y + anchorHalfHight - nodeHalfHight + point.x;
            vec = topV;
        } else if (gravity == Gravity.InBottom) {
            const bottomV = v3(0, 0, 0);
            bottomV.x = centerV.x + point.x;
            bottomV.y = centerV.y - anchorHalfHight + nodeHalfHight + point.y;
            vec = bottomV;
        }
        //再将自己设置到该坐标位置上
        node.position = vec;
    }

    protected onLoad() {
        this.onCreated();
    }

    private onBindData(params, root: Node, options: Options) {
        this._root = root;
        this.options = options;
        this.options.gravity = this.options.gravity || Gravity.Center;
        this.adapter();
        this.onBundleData(params);
    }

    private show() {
        this.onAnimationBefore();
        const node = this.node;
        const anim = this.showAnim();
        if (anim) {
            tween(node).then(anim).call(() => {
                this.onShowAnimationEnd();
            }).start();
        } else {
            this.onShowAnimationEnd();
        }
    }

    /**
     * 销毁该节点
     * @param destory true就销毁掉 如果需要重复利用建议使用false
     */
    public dismiss(callback?, destory = true) {
        const node = this.node;
        const anim = this.closeAnim();
        if (anim) {
            tween(node).then(anim).call(() => {
                this.onDismissAnimationBefore();
                this.onDismissAnimationEnd();
                if (destory) {
                    this.root.destroy();
                } else {
                    this.root.removeFromParent();
                }
                callback?.();
            }).start()
        } else {
            this.onDismissAnimationBefore();
            this.onDismissAnimationEnd();
            if (destory) {
                this.root.destroy();
            } else {
                this.root.removeFromParent();
            }
            callback?.();
        }
    }

    protected onDestroy() {
        this.destroyed();
        this._tochBackgoundClose = null;
        this.activity = null;
        this.options.anchorView = null;
        this.options.point = null;
        this.options = null;
        this._root = null;
    }



    static slideInDown(dialog:BaseDialog) {
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node = dialog.node;
        const uITransform = node.getComponent(UITransform);
        const targetY = node.position.y;
        let vec = v3(node.position);
        if(!dialog.options.cover){
            vec.y = vec.y - uITransform.height;
            vec.x = node.position.x;
        }else{
            vec.y = -root.getComponent(UITransform).height / 2 - uITransform.height / 2;
            vec.x = node.position.x;
        }
        node.position = vec;
        return tween()
            .to(0.3, { position: v3(node.position.x, targetY) });
    }

    static slideInTop(dialog:BaseDialog) {
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node = dialog.node;
        const uITransform = node.getComponent(UITransform);
        const targetY = node.position.y;
        let vec = v3(node.position);
        if(!dialog.options.cover){
            vec.y = vec.y + uITransform.height;
            vec.x = node.position.x;
        }else{
            vec.y = root.getComponent(UITransform).height / 2 + uITransform.height / 2;
            vec.x = node.position.x;
        }
        node.position = vec;
        return tween()
            .to(0.3, { position: v3(node.position.x, targetY) });
    }

    static slideInRight(dialog:BaseDialog){
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node =  dialog.node;
        const uITransform = node.getComponent(UITransform);
        const targetX = node.position.x;
        let vec = v3(node.position);
        if(!dialog.options.cover){
            vec.y = vec.y;
            vec.x = node.position.x + uITransform.width;
        }else{
            vec.y = node.position.y;
            vec.x = root.getComponent(UITransform).width / 2 + uITransform.width / 2;
        }
        node.position = vec;
        return tween()
            .to(0.3, { position: v3(targetX, node.position.y) });
    }

    static slideInLeft(dialog:BaseDialog){
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node =  dialog.node;
        const uITransform = node.getComponent(UITransform);
        const targetX = node.position.x;
        let vec = v3(node.position);
        if(!dialog.options.cover){
            vec.y = vec.y;
            vec.x = node.position.x - uITransform.width;
        }else{
            vec.y = node.position.y;
            vec.x = -root.getComponent(UITransform).width / 2 - uITransform.width / 2;
        }
        node.position = vec;
        return tween()
            .to(0.3, { position: v3(targetX, node.position.y) });
    }

    static scaleIn(dialog:BaseDialog) {
        dialog.node.scale = v3(0, 0, 1);
        return tween().to(0.3, { scale: v3(1, 1, 1) }, { easing: 'expoOut' });
    }

    static scaleOut() {
        return tween().to(0.2, { scale: v3(0, 0, 1) });
    }

    static slideOutDown(dialog:BaseDialog) {
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node =  dialog.node;
        const uITransform = node.getComponent(UITransform);
        let targetY;
        if(!dialog.options.cover){
            targetY = node.position.y - uITransform.height;
        }else{
            targetY = -root.getComponent(UITransform).height / 2 - uITransform.height / 2;
        }
        return tween()
            .to(0.2, { position: v3(node.position.x, targetY) });
    }
    static slideOutTop(dialog:BaseDialog) {
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node = dialog.node;
        const uITransform = node.getComponent(UITransform);
        let targetY;
        if(!dialog.options.cover){
            targetY = node.position.y + uITransform.height;
        }else{
            targetY = root.getComponent(UITransform).height / 2 + uITransform.height / 2;
        }
        return tween()
            .to(0.2, { position: v3(node.position.x, targetY) });
    }
    static slideOutRight(dialog:BaseDialog){
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node =  dialog.node;
        const uITransform = node.getComponent(UITransform);
        let targetX = node.position.x - uITransform.width;
        if(!dialog.options.cover){
            targetX = node.position.x - uITransform.width;
        }else{
            targetX = root.getComponent(UITransform).width / 2 + uITransform.width / 2;
        }
        return tween()
            .to(0.3, { position: v3(targetX, node.position.y) });
    }
    static slideOutLeft(dialog:BaseDialog){
        const root = SceneManager.getInstance().getActivity().maskNode;
        const node =  dialog.node;
        const uITransform = node.getComponent(UITransform);
        let targetX;
        if(!dialog.options.cover){
            targetX = node.position.x + uITransform.width;
        }else{
            targetX = -root.getComponent(UITransform).width / 2 - uITransform.width / 2;
        }
        return tween()
            .to(0.3, { position: v3(targetX, node.position.y) });
    }
}
