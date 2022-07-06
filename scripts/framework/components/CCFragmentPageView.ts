import { _decorator ,Component, PageView, ScrollView, ScrollBar ,EventHandler, serializeTag, Vec3, EventTouch, Vec2} from "cc";
import BaseFragment from "../base/BaseFragment";
const { ccclass, property , menu} = _decorator;

const _tempVec2 = new Vec2();


@ccclass('CCFragmentPageView')
@menu('ui/CCFragmentPageView')
export default class CCFragmentPageView extends ScrollView{

    /**
     * 隐藏滚动器
     */
    @property({
        type:ScrollBar,
        override:true,
        visible:false
    })
    get verticalScrollBar () {
        return super.verticalScrollBar;
    }
    set verticalScrollBar (value) {
        super.verticalScrollBar = value;
    }
    @property({
        type:ScrollBar,
        override:true,
        visible:false
    })
    get horizontalScrollBar () {
        return super.horizontalScrollBar;
    }
    set horizontalScrollBar (value) {
        super.horizontalScrollBar = value;
    }
    @property({
        visible: false,
        override:true,
    })
    public horizontal = true;
    @property({
        visible: false,
        override:true,
    })
    public vertical = false;
    @property({
        visible: false,
        override:true,
    })
    public cancelInnerEvents = true;
    @property({
        visible: false,
        override:true,
    })
    public scrollEvents: EventHandler[] = [];

    /**
     * @zh
     * 滚动临界值，默认单位百分比，当拖拽超出该数值时，松开会自动滚动下一页，小于时则还原。
     */
    @property({
        slide: true,
        range: [0,1,0.01],
    })
    get scrollThreshold () {
        return this._scrollThreshold;
    }
    set scrollThreshold (value) {
        if (this._scrollThreshold === value) {
            return;
        }
        this._scrollThreshold = value;
    }
    @property
    private _scrollThreshold = 0.5;

    /**
     * @en The time required to turn over a page. unit: second
     * @zh 每个页面翻页时所需时间。单位：秒
     */
    @property({
        serializable: true,
    })
    public pageTurningSpeed = 0.3;


    /**
     * @zh
     * 当前页面下标
     */
    get curPageIdx () {
        return this._curPageIdx;
    }
    protected _curPageIdx = 0;
    protected _lastPageIdx = 0;
    protected _initContentPos = new Vec3();
    protected _pages: BaseFragment[] = [];
    protected _touchBeganPosition = new Vec2();
    protected _touchEndPosition = new Vec2();
    onLoad(){
        this._initPages();
    }

    public onEnable(){
        super.onEnable();
    }

    public onDisable(){
        super.onDisable();
    }

    private _initPages(){
        this._initContentPos = this.content.position as Vec3;
        this._updatePageView();
    }

    //刷新页面视图
    private _updatePageView(){
        const pageCount = this._pages.length;
        if (this._curPageIdx >= pageCount) {
            this._curPageIdx = pageCount === 0 ? 0 : pageCount - 1;
            this._lastPageIdx = this._curPageIdx;
        }
         // 进行排序
    }

    protected _onTouchBegan(event: EventTouch, captureListeners: any){
        event.touch!.getUILocation(_tempVec2);
        console.log('坐标'+_tempVec2);
        Vec2.set(this._touchBeganPosition, _tempVec2.x, _tempVec2.y);
        super._onTouchBegan(event, captureListeners);
    }

    protected _onTouchMoved (event: EventTouch, captureListeners: any) {
        super._onTouchMoved(event, captureListeners);
    }

    protected _onTouchEnded (event: EventTouch, captureListeners: any) {
        event.touch!.getUILocation(_tempVec2);
        Vec2.set(this._touchEndPosition, _tempVec2.x, _tempVec2.y);
        super._onTouchEnded(event, captureListeners);
    }
}