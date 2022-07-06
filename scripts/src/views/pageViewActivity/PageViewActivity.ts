
import { _decorator, Component, Node, PageView, ScrollView } from 'cc';
import BaseActivity from '../../../framework/base/BaseActivity';
import CCScrollView from '../../../framework/components/CCScrollView';
import SceneManager from '../../../framework/core/SceneManager';
import PromiseDisposable from '../../../framework/net/PromiseDisposable';
import { apiHomeLogo } from '../../api/home';
const { ccclass, property ,menu} = _decorator;

/**
 * Predefined variables
 * Name = PageViewActivity
 * DateTime = Tue Mar 08 2022 09:32:54 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = PageViewActivity.ts
 * FileBasenameNoExtension = PageViewActivity
 * URL = db://assets/scripts/src/views/pageViewActivity/PageViewActivity.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('PageViewActivity')
@menu('pageViewActivity/PageViewActivity')
export class PageViewActivity extends BaseActivity {
    public static getPath() {
        return 'skin1/views/pageViewActivity/PageViewActivity'
    }

    @property(CCScrollView)
    private scrollView:CCScrollView = null;

    @property(Node)
    private btn:Node = null;
    start(){
        super.start();

        this.fetchHomeLogo();
    }

    private onClickBack(){
        SceneManager.getInstance().finishActivity(this,{runAction:true});
    }


    private async fetchHomeLogo() {
        let res
        try {
            let param = {
                deviceType: 1,
                templateNo: 1,
            }
            res = await this.promiseDisposable.addPromise(apiHomeLogo(param));
        } catch (error) {
            console.log(error);
        }
    }

    onDestroy(){
        super.onDestroy();
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
