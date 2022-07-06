import CCScrollView from "./CCScrollView";
import { _decorator, Component, Node, EventHandler, Prefab, Widget, ScrollView, v3, UITransform, Vec3, Vec2, EventTouch, TERRAIN_HEIGHT_BASE, ScrollBar } from 'cc';


const OUT_OF_BOUNDARY_BREAKING_FACTOR = 0.05;
const EPSILON = 1e-4;


export enum Cc_Ui_PullRefresh_Head_Type {
    /**
     * @zh 没有状态
     */
    NONE = 0,
    /**
    * @zh 下拉可以刷新
    */
    PULLING = 1,
    /**
     * @zh 正在刷新...
     */
    REFRESHING = 2,
    /**
     * @zh 释放立即刷新
     */
    RELEASE = 3,
}

const quintEaseOut = (time: number) => {
    time -= 1;
    return (time * time * time * time * time + 1);
};
const { ccclass, property, menu } = _decorator;
@ccclass('CCPullRefresh')
@menu('ui/CCPullRefresh')
export default class CCPullRefresh extends CCScrollView {

    @property({
        type:ScrollBar,
        override:true,
        visible:function(){
            return false;
        }
    })
    get horizontalScrollBar () {
        return this._horizontalScrollBar;
    }

    @property({
        type:ScrollBar,
        override:true,
        visible:function(){
            return false;
        }
    })
    get verticalScrollBar () {
        return this._verticalScrollBar;
    }

    @property({
        override:true,
        serializable:true,
        visible:function(){
            return false;
        }
    })
    public elastic = true;

    @property({
        override:true,
        serializable:true,
        visible:function(){
            return false;
        }
    })
    public inertia = true;

    @property({
        override:true,
        serializable:true,
        visible:function(){
            return false;
        }
    })
    public bounceDuration = 0.75;

    @property({
        override:true,
        serializable:true,
        visible:function(){
            return false;
        }
    })
    public brake = 0.23;

    @property({
        override:true,
        serializable:true,
        visible:function(){
            return false;
        }
    })
    public cancelInnerEvents = true;



    @property({
        type: Node,
        tooltip: 'header节点',
    })
    private headerNode: Node = null;

    @property({
        type: EventHandler,
        tooltip: 'header刷新事件触发',
        visible: function () { return this.headerNode != null }
    })
    private headerEvents: EventHandler[] = []

    private headerTrans: UITransform = null;

    //头部状态
    private _headState: Cc_Ui_PullRefresh_Head_Type = Cc_Ui_PullRefresh_Head_Type.NONE;
    private _lockHeadState: number = 0;


    onLoad() {
        this.node.getComponent(Widget)?.updateAlignment();
        this.content.parent.getComponent(Widget)?.updateAlignment();
        this.content.getComponent(Widget)?.updateAlignment();
        this.content.on(Node.EventType.SIZE_CHANGED, this._updateLayout, this);

        this.headerTrans = this.headerNode?.getComponent(UITransform);
    }

    start() {
        this.headerNode.active = false;
    }

    onDestroy() {
        this.content.off(Node.EventType.SIZE_CHANGED, this._updateLayout, this);
        this.headerTrans = null;
        this.headerEvents.length = 0;
        this.headerEvents = null;
        this._headState = null;
        this._lockHeadState = null;
    }


    //释放头部
    public releaseHead() {
        this._lockHeadState = 0;
        this._headState = Cc_Ui_PullRefresh_Head_Type.NONE;
        this._autoScrolling = true;
        EventHandler.emitEvents(this.headerEvents, this,this._headState);
    }


    private _updateLayout() {
        const header = this.headerNode;
        const contentTrans = this.content.getComponent(UITransform);
        const headerTrans = this.headerTrans;
        if (header) {
            if (this.vertical) {
                const y = contentTrans.height * (1 - contentTrans.anchorY) + headerTrans.height / 2;
                header.position = v3(header.position.x, y, header.position.z);
            }else {
                const x = -contentTrans.width * contentTrans.anchorX - headerTrans.width / 2;
                header.position = v3(x,header.position.y,header.position.z);
            }
            header.setSiblingIndex(Number.MAX_SAFE_INTEGER);
        }
    }

    update(dt: number) {
        if (this._autoScrolling && this._lockHeadState != 2) {
            this._processAutoScrolling(dt);
        }
    }

    protected _processAutoScrolling(dt) {
        const state = this._headState;


        const isAutoScrollBrake = this._isNecessaryAutoScrollBrake();
        const brakingFactor = isAutoScrollBrake ? OUT_OF_BOUNDARY_BREAKING_FACTOR : 1;
        this._autoScrollAccumulatedTime += dt * (1 / brakingFactor);

        let percentage = Math.min(1, this._autoScrollAccumulatedTime / this._autoScrollTotalTime);

        if (this._autoScrollAttenuate) {
            percentage = quintEaseOut(percentage);
        }

        const clonedAutoScrollTargetDelta = this._autoScrollTargetDelta.clone();
        if (this._lockHeadState == 1) {
            if(this.vertical){
                clonedAutoScrollTargetDelta.y -= this.headerTrans.height;
            }else{
                clonedAutoScrollTargetDelta.x += this.headerTrans.width;
            }
        };

        clonedAutoScrollTargetDelta.multiplyScalar(percentage);

        const clonedAutoScrollStartPosition = this._autoScrollStartPosition.clone();
        clonedAutoScrollStartPosition.add(clonedAutoScrollTargetDelta);
        let reachedEnd = Math.abs(percentage - 1) <= EPSILON;

        const fireEvent = Math.abs(percentage - 1) <= this.getScrollEndedEventTiming();
        if (fireEvent && !this._isScrollEndedWithThresholdEventFired) {
            this._dispatchEvent(CCPullRefresh.EventType.SCROLL_ENG_WITH_THRESHOLD);
            this._isScrollEndedWithThresholdEventFired = true;
        }

        if (this.elastic) {
            const brakeOffsetPosition = clonedAutoScrollStartPosition.clone();
            brakeOffsetPosition.subtract(this._autoScrollBrakingStartPosition);
            if (isAutoScrollBrake) {
                brakeOffsetPosition.multiplyScalar(brakingFactor);
            }
            clonedAutoScrollStartPosition.set(this._autoScrollBrakingStartPosition);
            clonedAutoScrollStartPosition.add(brakeOffsetPosition);
        } else {
            const moveDelta = clonedAutoScrollStartPosition.clone();
            moveDelta.subtract(this['_getContentPosition']());
            const outOfBoundary = this._getHowMuchOutOfBoundary(moveDelta);
            if (!outOfBoundary.equals(Vec3.ZERO, EPSILON)) {
                clonedAutoScrollStartPosition.add(outOfBoundary);
                reachedEnd = true;
            }
        }

        if (reachedEnd) {
            this._autoScrolling = false;
        }


        const deltaMove = clonedAutoScrollStartPosition.clone();
        deltaMove.subtract(this['_getContentPosition']());
        this._clampDelta(deltaMove);
     
        if (deltaMove.y < EPSILON && this._lockHeadState == 1) {
            this._autoScrolling = false;
            reachedEnd = true;
        }

        this._moveContent(deltaMove, reachedEnd);


        this._dispatchEvent(CCPullRefresh.EventType.SCROLLING);
        if (!this._autoScrolling) {
            this._isBouncing = false;
            this._scrolling = false;
            this._dispatchEvent(CCPullRefresh.EventType.SCROLL_ENDED);
        }
    }




    protected _startAutoScroll(deltaMove: Vec3, timeInSecond: number, attenuated = false) {
        super._startAutoScroll(deltaMove, timeInSecond, attenuated);
    }

    protected _onTouchBegan(event: EventTouch, captureListeners?: Node[]) {
        super._onTouchBegan(event, captureListeners);
        this.headerNode.active = true;
    }

    protected _onTouchMoved(event: EventTouch, captureListeners?: Node[]) {
        super._onTouchMoved(event, captureListeners);
        const state = this._headState;
        if (Cc_Ui_PullRefresh_Head_Type.REFRESHING === state) {
            return;
        }
        if (this.headerNode) {
            const outOfBoundary = this._getHowMuchOutOfBoundary();
            const offset = this.vertical ? outOfBoundary.y : -outOfBoundary.x;
            const headerTrans = this.headerTrans;
            if (offset > 0 && headerTrans) {
                const size = this.vertical ? headerTrans.height :headerTrans.width;
                if (offset > size) {
                    if (Cc_Ui_PullRefresh_Head_Type.RELEASE !== state) {
                        this._headState = Cc_Ui_PullRefresh_Head_Type.RELEASE;
                        EventHandler.emitEvents(this.headerEvents, this,this._headState);
                    }
                } else {
                    if (Cc_Ui_PullRefresh_Head_Type.PULLING !== state) {
                        this._headState = Cc_Ui_PullRefresh_Head_Type.PULLING;
                        EventHandler.emitEvents(this.headerEvents, this,this._headState);
                    }
                }
            }
        }
    }

    protected _onTouchEnded(event: EventTouch, captureListeners?: Node[]) {
        super._onTouchEnded(event, captureListeners);
        this._touchEnd();
    }

    protected _onTouchCancelled(event: EventTouch, captureListeners?: Node[]) {
        super._onTouchCancelled(event, captureListeners);
        this._touchEnd();
    }

    private _touchEnd() {
        const state = this._headState;
        if (Cc_Ui_PullRefresh_Head_Type.NONE === state) {
            this.headerNode.active = false;
        }
        if (Cc_Ui_PullRefresh_Head_Type.REFRESHING === state) {
            //console.log("正在刷新中");
            const outOfBoundary = this._getHowMuchOutOfBoundary();
            const offset = this.vertical ? outOfBoundary.y : -outOfBoundary.x;
            const size = this.vertical ? this.headerTrans.height : this.headerTrans.width;
            if (offset > size) {
                //允许自动 滚动且锁定head
                this._lockHeadState = 1;
            } else {
                if (offset < EPSILON) {
                    //outOfBoundary 小于0 允许自动滚动
                    this._lockHeadState = 3;
                } else {
                    //outOfBoundary 大于0 不允许自动滚动
                    this._lockHeadState = 2;
                }
            }
        } else if (Cc_Ui_PullRefresh_Head_Type.RELEASE === state) {
            this._headState = Cc_Ui_PullRefresh_Head_Type.REFRESHING;
            EventHandler.emitEvents(this.headerEvents, this,this._headState);
            //允许自动 滚动且锁定head
            this._lockHeadState = 1;
        } else {
            this._headState = Cc_Ui_PullRefresh_Head_Type.NONE;
            //默认
            this._lockHeadState = 0;
        }
  
    }

}