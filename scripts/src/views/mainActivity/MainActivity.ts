
import { _decorator, Component, Node, UITransform } from 'cc';
import BaseActivity from '../../../framework/base/BaseActivity';
import { Alert } from '../../../framework/components/Alert';
import { Toast } from '../../../framework/components/Toast';
import { HomeFragment } from './home/HomeFragment';
import { MineFragment } from './mine/MineFragment';
const { ccclass, property ,menu} = _decorator;

/**
 * Predefined variables
 * Name = MainActivity
 * DateTime = Tue Mar 01 2022 11:35:21 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = MainActivity.ts
 * FileBasenameNoExtension = MainActivity
 * URL = db://assets/scripts/src/views/mainActivity/MainActivity.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('MainActivity')
@menu('mainActivity/MainActivity')
export class MainActivity extends BaseActivity {

    public static getPath() {
        return 'skin1/views/mainActivity/MainActivity'
    }

    @property(Node)
    private fragmentContent:Node = null;

    private homeFg:HomeFragment = null;
    private mineFg:MineFragment = null;

    onLoad(){
        super.onLoad();
    }

    start () {
        super.start();
        this.crateFragment(HomeFragment.getPath(),MineFragment.getPath()).then((fragments)=>{
            this.homeFg = fragments[0];
            this.mineFg = fragments[1];
            this.replaceFragment(this.fragmentContent,this.homeFg);
        })
    }

    private onClickHome(){
       this.replaceFragment(this.currentFragment,this.homeFg,null,{cache:true});
    }

    private onClickMine(){
        Alert.show('hhhh\n啊好看的\n has肯德基啊还是快点\n哈迪卡回到卡合适的借口\nagsdjkasgd1\nagsdjasgdajs\nasgdjhasdg\ngasdjgasdhjasd\nagdjkuasgdkjuas\nagsdjadgajksd\nashdjkashdkas\n');
        this.replaceFragment(this.currentFragment,this.mineFg,null,{cache:true});
    }

    protected onResume():void{
        
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
