
import { _decorator, Component, Node} from 'cc';

import { Alert } from './framework/components/Alert';
import { Toast } from './framework/components/Toast';
import SceneManager from './framework/core/SceneManager';
import { Logger, LoogerLevel } from './framework/utils/Logger';
import { MainActivity } from './src/views/mainActivity/MainActivity';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = App
 * DateTime = Mon Feb 28 2022 17:20:24 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = App.ts
 * FileBasenameNoExtension = App
 * URL = db://assets/scripts/App.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('App')
export class App extends Component {

    //界面根节点
    @property(Node)
    private root: Node = null;
    //顶层提示消息根节点
    @property(Node)
    private top: Node = null;
    //阻止用户点击
    @property(Node)
    private blockInput: Node = null;

    protected onLoad() {
        
        Logger.init(LoogerLevel.OPEN | LoogerLevel.FrameWork);
        SceneManager.init(this.root,this.top,this.blockInput);
        Toast.init(this.top);
        Alert.init(this.top);
        //监听 原生事件
    }

    async start() {
        SceneManager.getInstance().startActivity(MainActivity);
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
