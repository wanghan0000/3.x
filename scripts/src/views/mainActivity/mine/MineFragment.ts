
import { _decorator, Component, Node} from 'cc';
import BaseFragment from '../../../../framework/base/BaseFragment';
import { Toast } from '../../../../framework/components/Toast';
import { LikeFragment } from './LikeFragment';
import { VideoFragment } from './VideoFragment';
const { ccclass, property , menu} = _decorator;

/**
 * Predefined variables
 * Name = MineFragment
 * DateTime = Tue Mar 01 2022 13:54:51 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = MineFragment.ts
 * FileBasenameNoExtension = MineFragment
 * URL = db://assets/scripts/src/views/mainActivity/mine/MineFragment.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('MineFragment')
@menu('mainActivity/mine/MineFragment')
export class MineFragment extends BaseFragment {
    public static getPath() {
        return 'skin1/views/mainActivity/mine/MineFragment';
    }

    private likeFg:LikeFragment = null;
    private videoFg:VideoFragment = null;

    @property(Node)
    private fragmentContent: Node = null;

    start () {
        // [3]
        super.start();
        Toast.show({txt: 'mineFragment'});
        this.crateFragment(LikeFragment.getPath(),VideoFragment.getPath()).then((fragments)=>{
            this.likeFg = fragments[0];
            this.videoFg = fragments[1];
            this.replaceFragment(this.fragmentContent,this.likeFg);
        })
    }

    onPause(){

    }

    private onClickLike(){
        this.replaceFragment(this.currentFragment,this.likeFg,null,{cache:true});
    }

    private onClickVide(){
        this.replaceFragment(this.currentFragment,this.videoFg,null,{cache:true});
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
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
