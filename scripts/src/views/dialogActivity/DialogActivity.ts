
import { _decorator, Component, Node, UITransform, v3, Widget, v2 } from 'cc';
import BaseActivity from '../../../framework/base/BaseActivity';
import BaseDialog, { Gravity } from '../../../framework/base/BaseDialog';
import { Toast } from '../../../framework/components/Toast';
import SceneManager from '../../../framework/core/SceneManager';
import { CenterDialog } from '../mainActivity/mine/CenterDialog';
const { ccclass, property , menu} = _decorator;

/**
 * Predefined variables
 * Name = Test
 * DateTime = Tue Mar 01 2022 19:34:17 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = Test.ts
 * FileBasenameNoExtension = Test
 * URL = db://assets/scripts/src/views/testActivity/Test.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('DialogActivity')
@menu('dialogActivity/DialogActivity')
export class DialogActivity extends BaseActivity {

    public static getPath() {
        return 'skin1/views/dialogActivity/DialogActivity'
    }

    onLoad(){
        super.onLoad();
        //this.node.getComponent(Widget).left = 300;
        console.log("onload");
    }

    start () {
        super.start();
        //this.node.getComponent(Widget).left = 300;
        //this.node.setPosition(v3(-500,0,0));
        Toast.show({txt: 'DialogActivity'});
    }

    private onClickBack(){
        SceneManager.getInstance().finishActivity(this,{runAction:true});
    }

    private onClickOpenDialog(event,custom){
        if(custom == 1){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInDown);
                dialog.setCloseAnim(BaseDialog.slideOutDown);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.Center
                })
            });
        }else if(custom == 2){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInTop);
                dialog.setCloseAnim(BaseDialog.slideOutTop);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.Center
                })
            });
        }else if(custom == 3){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInLeft);
                dialog.setCloseAnim(BaseDialog.slideOutLeft);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.Center
                })
            });
        }else if(custom == 4){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInRight);
                dialog.setCloseAnim(BaseDialog.slideOutRight);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.Center
                })
            });
        }else if(custom == 5){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.scaleIn);
                dialog.setCloseAnim(BaseDialog.scaleOut);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.Center
                })
            });
        }else if(custom == 6){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInDown);
                dialog.setCloseAnim(BaseDialog.slideOutDown);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.InBottom
                })
            });
        }else if(custom == 7){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInTop);
                dialog.setCloseAnim(BaseDialog.slideOutTop);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.InTop
                })
            });
        }else if(custom == 8){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInLeft);
                dialog.setCloseAnim(BaseDialog.slideOutLeft);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.InLeft
                })
            });
        }else if(custom == 9){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInRight);
                dialog.setCloseAnim(BaseDialog.slideOutRight);
                this.showDialog(dialog,null,{
                    anchorView: null,
                    cover: true,
                    gravity: Gravity.InRight
                })
            });
        }else if(custom == 10){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInRight);
                dialog.setCloseAnim(BaseDialog.slideOutLeft);
                this.showDialog(dialog,null,{
                    anchorView: event.target,
                    cover: false,
                    gravity: Gravity.Left
                })
            });
        }else if(custom == 11){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInLeft);
                dialog.setCloseAnim(BaseDialog.slideOutRight);
                this.showDialog(dialog,null,{
                    anchorView: event.target,
                    cover: false,
                    gravity: Gravity.Right
                })
            });
        }else if(custom == 12){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInDown);
                dialog.setCloseAnim(BaseDialog.slideOutDown);
                this.showDialog(dialog,null,{
                    anchorView: event.target,
                    cover: false,
                    gravity: Gravity.Top,
                    point:v2(-100,0)
                })
            });
        }else if(custom == 13){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInTop);
                dialog.setCloseAnim(BaseDialog.slideOutTop);
                this.showDialog(dialog,null,{
                    anchorView: event.target,
                    cover: false,
                    gravity: Gravity.Bottom,
                    point:v2(100,0)
                })
            });
        }else if(custom == 14){
            SceneManager.getInstance().createDialog(CenterDialog).then((dialog:CenterDialog)=>{
                dialog.setShowAnim(BaseDialog.slideInTop);
                dialog.setCloseAnim(BaseDialog.slideOutTop);
                this.showDialog(dialog,null,{
                    anchorView: event.target,
                    cover: false,
                    gravity: Gravity.Bottom,
                })
            });
        }
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
