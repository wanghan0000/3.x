
import { _decorator, Component, Node, Tween } from 'cc';
import BaseDialog, { Gravity } from '../../../../framework/base/BaseDialog';
const { ccclass, property ,menu} = _decorator;

/**
 * Predefined variables
 * Name = CenterDialog
 * DateTime = Thu Mar 03 2022 16:44:57 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = CenterDialog.ts
 * FileBasenameNoExtension = CenterDialog
 * URL = db://assets/scripts/src/views/mainActivity/mine/CenterDialog.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('CenterDialog')
@menu('mainActivity/mine/CenterDialog')
export class CenterDialog extends BaseDialog {
    static getPath(): string {
        return 'skin1/views/mainActivity/mine/CenterDialog'
    }

    protected onCreated(){
        this._tochBackgoundClose = true;
    }

    protected onBundleData(params: any) {
        
    }
    protected onAnimationBefore() {
        
    }
    protected onShowAnimationEnd() {
        
    }
    protected onDismissAnimationBefore() {
       
    }
    protected onDismissAnimationEnd() {
        
    }

    protected destroyed() {
      
    }

    private myShowAnim = null;
    private myCloseAnim = null;
    public setShowAnim(anim){
        this.myShowAnim = anim;
        return this;
    }
    public setCloseAnim(anim){
        this.myCloseAnim = anim;
        return this;
    }

    protected showAnim<T>(): Tween<T> {
        return this.myShowAnim ? this.myShowAnim(this) : BaseDialog.scaleIn(this);
    }

    /**
     * 出场动画 可自定义
     * @returns 
     */
    protected closeAnim<T>(): Tween<T> {
        return this.myCloseAnim ? this.myCloseAnim(this) : BaseDialog.scaleOut();
    }
}
/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
