import { _decorator, Component, Node, v2, Prefab, instantiate, Label, Sprite, assetManager, SpriteFrame, Texture2D } from 'cc';
import { CCRecycleAdapter } from '../../../../../framework/components/CCRecycleAdapter';
import { CCRecycleHolder } from '../../../../../framework/components/CCRecycleHolder';
import { loadRemoteSource, loadResources } from '../../../../../framework/utils/LoaderSources';

const { ccclass, property ,menu} = _decorator;
@ccclass('GameAdapter')
@menu('mainActivity/home/adapter/GameAdapter')
export default class GameAdapter extends CCRecycleAdapter{
  
    getSize(index):{width,height} {
        const type = this.getType(index);
        if(type == 1){
            return {width:100,height:100};
        }else if(type == 2){
            return {width:100,height:360};
        }
    }

    private datas = [];

    @property(Prefab)
    private item: Prefab = null;

    @property(Prefab)
    private item2: Prefab = null;

    setDatas(datas){
        this.datas = datas;
    }

    getItemCount(): number {
        return this.datas.length;
    }
    onCreateViewHolder(index: number): CCRecycleHolder {
        const type = this.getType(index);
        if(type == 1){
            const node = instantiate(this.item);
            const holder = new GameHolder(node);
            return holder;
        }else if(type == 2){
            const node = instantiate(this.item2);
            const holder = new GameHolder(node);
            return holder;
        }
    }///Users/baron/Library/Android/sdk
    onBindViewHolder(holder: CCRecycleHolder, index: any) {
        holder.onBind({datas:this.datas[index],index});
    }
    getType(index: number): number {
        return 1;
    }

    onClick(index: number): void {
        
    }
}

export class GameHolder extends CCRecycleHolder {

    private text: Label = null;
    private bg:Sprite = null;
    constructor(node: Node) {
        super(node);
        let textNode = node.getChildByName("text"); 
        let sp = node.getChildByName('bg');

        this.text = textNode.getComponent(Label);
        this.bg = sp.getComponent(Sprite);
    }

    onBind(data) {
        this.text.string = `${data.index}`;
        loadRemoteSource({
                url: data.datas.remoteUrl,
                custom: this.tag            
            }).then((v)=>{
            if(v.options.custom === this.tag){
                this.bg.spriteFrame = v.spriteFrame;
            }else{
                loadResources({
                    url: 'skin1/imgs/default_sprite_splash/spriteFrame',
                }).then((v)=>{
                    this.bg.spriteFrame = v.spriteFrame;
                })
            }
        });
    }
}
