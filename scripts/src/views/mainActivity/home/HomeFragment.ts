import { _decorator, Sprite, Game } from 'cc';
import BaseFragment from '../../../../framework/base/BaseFragment';
import { CCCRecycleView } from '../../../../framework/components/CCCRecycleView';
import { Toast } from '../../../../framework/components/Toast';
import SceneManager from '../../../../framework/core/SceneManager';
import { apiHomeMenuList } from '../../../api/home';
import { DialogActivity } from '../../dialogActivity/DialogActivity';
import GameAdapter from './adapter/GameAdapter';
import { HomeMenuAdapter, HomeMenuClickListener } from './adapter/HomeMenuAdapter';

const { ccclass, property, menu } = _decorator;

@ccclass('HomeFragment')
@menu('mainActivity/home/HomeFragment')
export class HomeFragment extends BaseFragment implements HomeMenuClickListener {
    public static getPath() {
        return 'skin1/views/mainActivity/home/HomeFragment';
    }

    @property(Sprite)
    private sprite1: Sprite = null;

    @property(CCCRecycleView)
    private recycleView: CCCRecycleView = null;
    private gameAdapter: GameAdapter = null;

    @property(CCCRecycleView)
    private menuList: CCCRecycleView = null;
    private menuAdapter: HomeMenuAdapter = null;

    private testDatas = [];
    start() {
        this.menuAdapter = this.menuList.adapter as HomeMenuAdapter;
        this.menuAdapter.setClickCallback(this);
        this.handleHomeMenu();

        this.gameAdapter = this.recycleView.adapter as GameAdapter;
    }

    //点击菜单按钮
    onMenuClick(data: any, index: any) {
        Toast.show({ txt: data.name });
    }

    onPause() {}
    onResume() {}

    private async handleHomeMenu() {
        let res;
        try {
            const params = {
                device: 1,
                platTemplateId: 1,
            };
            res = await apiHomeMenuList(params);
            const { data } = res;
            this.menuAdapter.setDatas(data.data);
            this.menuList.notifyDataSetChanged();
        } catch (error) {
            console.log(error);
        }
    }

    onClickAdd() {
        for (let i = 0; i < 100000; ++i) {
            this.testDatas.push({remoteUrl:'https://img95.699pic.com/photo/40094/7630.jpg_wh300.jpg'});
        }
        this.gameAdapter.setDatas(this.testDatas);
        this.recycleView.notifyDataSetChanged();
    }

    onClickDelete(){
        for (let i = 0; i < 100000; ++i) {
            this.testDatas.pop();
        }
        this.gameAdapter.setDatas(this.testDatas);
        this.recycleView.notifyDataSetChanged();
    }

    onClickToBottom(){
        this.recycleView.scrollToIndex(this.testDatas.length - 1);
    }

    onClickToTop(){
        this.recycleView.scrollToIndex(0);
    }

    openActivity(){
        SceneManager.getInstance().openActivity(SceneManager.getInstance().getActivity(),DialogActivity);
    }
}
