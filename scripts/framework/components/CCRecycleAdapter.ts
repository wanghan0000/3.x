
import { _decorator, Component, Node } from 'cc';
import { CCCRecycleView } from './CCCRecycleView';
import { CCRecycleHolder } from './CCRecycleHolder';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = BaseAdapter
 * DateTime = Sun Oct 17 2021 10:48:24 GMT+0400 (GMT+04:00)
 * Author = lin
 * FileBasename = BaseAdapter.ts
 * FileBasenameNoExtension = BaseAdapter
 * URL = db://assets/cacse/ScrollView/BaseAdapter.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
 
@ccclass('CCRecycleAdapter')
export abstract class CCRecycleAdapter extends Component {
     //获取节点数量
    abstract getItemCount(): number;

     //创建节点
     abstract onCreateViewHolder(index: number): CCRecycleHolder;
 
     //绑定节点信息
     abstract onBindViewHolder(holder: CCRecycleHolder, index);
 
     //获取节点类型
     abstract getType(index:number):number;
 
     //获取节点大小
     abstract getSize(index):{width,height};

     abstract onClick(index:number):void;
}