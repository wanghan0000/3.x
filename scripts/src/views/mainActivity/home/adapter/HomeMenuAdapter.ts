import { _decorator, Node, Label, Sprite, Prefab, instantiate } from 'cc';
import { CCRecycleAdapter } from '../../../../../framework/components/CCRecycleAdapter';
import { CCRecycleHolder } from '../../../../../framework/components/CCRecycleHolder';

const { ccclass, property, menu } = _decorator;
@ccclass('HomeMenuAdapter')
@menu('mainActivity/home/adapter/HomeMenuAdapter')
export class HomeMenuAdapter extends CCRecycleAdapter {
    @property(Prefab)
    private menuPrefab: Prefab = null;

    private datas;
    private listener: HomeMenuClickListener;

    setDatas(datas) {
        this.datas = datas;
    }

    setClickCallback(listener: HomeMenuClickListener) {
        this.listener = listener;
    }

    getItemCount(): number {
        return (this.datas && this.datas.length) || 0;
    }
    onCreateViewHolder(index: number): CCRecycleHolder {
        const node = instantiate(this.menuPrefab);
        const holder = new HomeMenuHolder(node);
        return holder;
    }
    onBindViewHolder(holder: CCRecycleHolder, index: any) {
        holder.onBind(this.datas[index]);
    }
    getType(index: number): number {
        return 0;
    }
    getSize(index: any): { width: any; height: any } {
        return { width: 0, height: 84 };
    }
    onClick(index: number): void {
        this.listener && this.listener.onMenuClick(this.datas[index], index);
    }
}

export interface HomeMenuClickListener {
    onMenuClick(data, index);
}

export class HomeMenuHolder extends CCRecycleHolder {
    private text: Label = null;
    private bg: Sprite = null;

    constructor(node: Node) {
        super(node);

        this.text = node.getChildByName('text').getComponent(Label);
        this.bg = node.getChildByName('bg').getComponent(Sprite);
    }

    onBind(data: any) {
        this.text.string = data.name;
    }
}
