
import { _decorator, Component, Node } from 'cc';
import BaseFragment from '../../../../framework/base/BaseFragment';
import { Toast } from '../../../../framework/components/Toast';
const { ccclass, property,menu } = _decorator;

/**
 * Predefined variables
 * Name = LikeFragment
 * DateTime = Wed Mar 02 2022 14:47:53 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = LikeFragment.ts
 * FileBasenameNoExtension = LikeFragment
 * URL = db://assets/scripts/src/views/mainActivity/mine/LikeFragment.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('LikeFragment')
@menu('mainActivity/mine/LikeFragment')
export class LikeFragment extends BaseFragment {
    public static getPath() {
        return 'skin1/views/mainActivity/mine/LikeFragment';
    }

    start () {
        // [3]
    }

    onResume(){
        Toast.show({txt: 'LikeFragment--onResume'});
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
