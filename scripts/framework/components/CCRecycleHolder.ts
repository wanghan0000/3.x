

import { _decorator, Node, UITransform } from 'cc';
/**
 * Predefined variables
 * Name = BaseViewHolder
 * DateTime = Sun Oct 17 2021 10:49:25 GMT+0400 (GMT+04:00)
 * Author = lin
 * FileBasename = BaseViewHolder.ts
 * FileBasenameNoExtension = BaseViewHolder
 * URL = db://assets/cacse/ScrollView/BaseViewHolder.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
 //确保最新版本 6.8。8
export abstract class CCRecycleHolder {

    public type: number;

    public tag: number;

    public node: Node;

    public view: UITransform;

    public itemIndex:number;

    //节点所在滚动层级
    public gIndex:number;

    constructor(node: Node){
        this.node = node;
        this.view = node.getComponent(UITransform);
    }


    abstract onBind(data:any);
}
