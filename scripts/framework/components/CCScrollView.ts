import { _decorator , ScrollView, Node,Event, ViewGroup, EventTouch, Vec2, v2 ,EventHandler as ComponentEventHandler, UITransform, Vec3} from "cc";
import { Toast } from "./Toast";
const { ccclass , menu} = _decorator;

const _tempVec2 = new Vec2();
const _tempVec2_1 = new Vec2();
const EPSILON = 0.0005;

enum Bubbling{
    NONE = -1,
    STOP = 1,
    PASS = 2,
}

const eventMap = {
    'scroll-to-top': 0,
    'scroll-to-bottom': 1,
    'scroll-to-left': 2,
    'scroll-to-right': 3,
    scrolling: 4,
    'bounce-bottom': 6,
    'bounce-left': 7,
    'bounce-right': 8,
    'bounce-top': 5,
    'scroll-ended': 9,
    'touch-up': 10,
    'scroll-ended-with-threshold': 11,
    'scroll-began': 12,
    'scroll-to-right-end' : 13, //滚动到右边界 并且滚动停止了
    'scroll-to-bottom-end': 14, //滚动到下边界 并且滚动停止了
};
@ccclass('CCScrollView')
@menu('ui/CCScrollView')
export default class CCScrollView extends ScrollView{

    private bubbling = -1;

    //获取该节点的上一个sv
    private _getInnerScrollView(target) {
        while(target){
            if(target._name === 'Canvas'){
                return null;
            }else if(target.getComponent(ScrollView)){
                return target;
            }
            target = target.parent;
        }
        return null;
    }

    //获取节点的父亲sv
    private _getParentSv(target){
        if(!target){
            return null;
        }
        target = target.parent;
        while(target){
            if(target._name === 'Canvas'){
                return null;
            }else if(target.getComponent(CCScrollView)){
                return target;
            }
            target = target.parent;
        }
        return null;
    }

    //当前节点是否有父sv
    private _isParent(target){
        while(target){
            if(target._name === 'Canvas'){
                return false;
            }
            if(this.node == target.parent){
                return true;
            }
            target = target.parent;
        }
        return false;
    }

    protected _hasNestedViewGroup (event: Event, captureListeners?: Node[]) {
        if (!event || event.eventPhase !== Event.CAPTURING_PHASE) {
            return false;
        }
        const innerNode = this._getInnerScrollView(event.target);
        const isParent = this._isParent(innerNode)
        if(isParent){
            return false;
        }

        if (captureListeners) {
            // captureListeners are arranged from child to parent
            for (const listener of captureListeners) {
                const item = listener;

                if (this.node === item) {
                    if (event.target && (event.target as Node).getComponent(ViewGroup)) {
                        return true;
                    }
                    return false;
                }

                if (item.getComponent(ViewGroup)) {
                    return true;
                }
            }
        }
        return false;
    }

    

    protected _onTouchBegan (event: EventTouch, captureListeners?: Node[]) {
        this.bubbling = Bubbling.NONE;
        if (!this.enabledInHierarchy || !this._content) { return; }
        if (this._hasNestedViewGroup(event, captureListeners)) { return; }

        this._handlePressLogic();
    
        this._touchMoved = false;
        this._stopPropagationIfTargetIsMe(event);
    }


    protected _onTouchMoved (event: EventTouch, captureListeners?: Node[]) {
        if(this.bubbling == Bubbling.STOP){
            return;
        }
        const innerNode = this._getInnerScrollView(event.target);
        const parentNode = this._getParentSv(innerNode);
        if(parentNode && innerNode && innerNode.getComponent(CCScrollView).bubbling == Bubbling.NONE){
            const innerSv:CCScrollView = innerNode.getComponent(CCScrollView);
            const parentSv:CCScrollView = parentNode.getComponent(CCScrollView);
            this.interceptScroll(innerSv,parentSv,event.touch);
        }

        if(this.bubbling == Bubbling.STOP){
            return;
        }
        if (!this.enabledInHierarchy || !this._content) { return; }
        if (this._hasNestedViewGroup(event, captureListeners)) { return; }

        const touch = event.touch!;
        this._handleMoveLogic(touch);

        // Do not prevent touch events in inner nodes
        if (!this.cancelInnerEvents) {
            return;
        }
        const deltaMove = touch.getUILocation(_tempVec2);
        deltaMove.subtract(touch.getUIStartLocation(_tempVec2_1));
        // FIXME: touch move delta should be calculated by DPI.
        if(!(parentNode && innerNode)){
            if (deltaMove.length() > 7) {
                if (!this._touchMoved && event.target !== this.node) {
                    // Simulate touch cancel for target node
                    const cancelEvent = new EventTouch(event.getTouches(), event.bubbles, 'touch-cancel');
                    cancelEvent.touch = event.touch;
                    cancelEvent.simulate = true;
                    (event.target as Node).dispatchEvent(cancelEvent);
                    this._touchMoved = true;
                }
            }
            this._stopPropagationIfTargetIsMe(event);
        }
    }

    protected _onTouchEnded(event: EventTouch, captureListeners?: Node[]){
        if(this.bubbling == Bubbling.STOP){
            return;
        }
        super._onTouchEnded(event,captureListeners);
    }

    protected _onTouchCancelled (event: EventTouch, captureListeners?: Node[]) {
        if(this.bubbling == Bubbling.STOP){
            return;
        }
        super._onTouchCancelled(event,captureListeners);
    }

    private interceptScroll(son:CCScrollView , father:CCScrollView , touch) {
        let isStopAllSc = false;
        const oFather = father.node;
        if(son.horizontal && father.horizontal){
            //找到一个与之方向相反的
            this._stopAllSvScroll(father.node);
            father = this._getDifferentDirectionSv(father,'horizontal');
            isStopAllSc = true;
        }else if(son.vertical && father.vertical){
            this._stopAllSvScroll(father.node);
            father = this._getDifferentDirectionSv(father,'horizontal');
            isStopAllSc = true;
        }

        if(son.vertical && father.horizontal){
            const deltaMove = touch.getUILocation(_tempVec2);
            deltaMove.subtract(touch.getUIStartLocation(_tempVec2_1));
            if(deltaMove.length() > 7){
                const angle = deltaMove.angle(v2(0,1)) * (180/Math.PI);
                if(angle >= 0 && angle < 60){
                    console.log("上拉");
                    son.bubbling = Bubbling.PASS;
                    !isStopAllSc && this._stopAllSvScroll(oFather);
                }else if(angle > 120 && angle < 180){
                    console.log("下拉");
                    son.bubbling = Bubbling.PASS;
                    !isStopAllSc && this._stopAllSvScroll(oFather);
                }else if(angle > 60 && angle < 120){
                    console.log('左右')
                    son.bubbling = Bubbling.STOP;
                    father.bubbling = Bubbling.PASS;
                    !isStopAllSc && this._stopAllSvScroll(oFather.parent);
                }
            }else{
                return
            }
        }else if(son.horizontal && father.vertical){
            const deltaMove = touch.getUILocation(_tempVec2);
            deltaMove.subtract(touch.getUIStartLocation(_tempVec2_1));
            if(deltaMove.length() > 7){
                const angle = deltaMove.angle(v2(0,1)) * (180/Math.PI);
                if(angle >= 0 && angle < 60){
                    console.log("上拉");
                    father.bubbling = Bubbling.PASS;
                    son.bubbling = Bubbling.STOP;
                    !isStopAllSc && this._stopAllSvScroll(oFather.parent);
                }else if(angle > 120 && angle < 180){
                    console.log("下拉");
                    father.bubbling = Bubbling.PASS;
                    son.bubbling = Bubbling.STOP;
                    !isStopAllSc && this._stopAllSvScroll(oFather.parent);
                }else if(angle > 60 && angle < 120){
                    console.log('左右')
                    son.bubbling = Bubbling.PASS;
                    !isStopAllSc && this._stopAllSvScroll(oFather);
                }
            }else{
                return
            }
        }
    }

    private _stopAllSvScroll(target){
        while(target){
            if(target._name === 'Canvas'){
                return;
            }else{
                const sv = target.getComponent(CCScrollView);
                sv && (sv.bubbling = Bubbling.STOP);
            }
            target = target.parent;
        }
    }

    private _getDifferentDirectionSv(target, dir){
        while(target){
            if(target._name === 'Canvas'){
                return null;
            }else{
                const sv = target.getComponent(CCScrollView);
                if(sv){
                    if(dir == 'vertical' && sv.horizontal){
                        return target;
                    }else if(dir == 'horizontal' && sv.vertical){
                        return target;
                    }
                }
            }
            target = target.parent;
        }
        return null;
    }

    protected _dispatchEvent (event: string) {
        if (event === CCScrollView.EventType.SCROLL_ENDED) {
            this._scrollEventEmitMask = 0;
            if(this.horizontal){
                const uiTrans = this.content!.getComponent(UITransform);
                const delta = -uiTrans!.width * (1 - uiTrans!.anchorX) + this.content!.parent!.getComponent(UITransform)!.width / 2;
                if(delta - this.content.position.x < 0.0001){
                    ComponentEventHandler.emitEvents(this.scrollEvents, this, eventMap['scroll-to-right-end']);
                }
            }else if(this.vertical){
                const uiTrans = this.content!.getComponent(UITransform);
                const delta = uiTrans!.height *  uiTrans!.anchorY - this.content!.parent!.getComponent(UITransform)!.height / 2;
                if(delta - this.content.position.y < 0.0001){
                    ComponentEventHandler.emitEvents(this.scrollEvents, this, eventMap['scroll-to-bottom-end']);
                }
            }
        } else if (event === CCScrollView.EventType.SCROLL_TO_TOP
            || event === CCScrollView.EventType.SCROLL_TO_BOTTOM
            || event === CCScrollView.EventType.SCROLL_TO_LEFT
            || event === CCScrollView.EventType.SCROLL_TO_RIGHT) {
            const flag = (1 << eventMap[event]);
            if (this._scrollEventEmitMask & flag) {
                return;
            } else {
                this._scrollEventEmitMask |= flag;
            }
        }

        ComponentEventHandler.emitEvents(this.scrollEvents, this, eventMap[event]);
        this.node.emit(event, this);
    }


    protected _startBounceBackIfNeeded () {
        if (!this.elastic) {
            return false;
        }

        const bounceBackAmount = this._getHowMuchOutOfBoundary();
        this._clampDelta(bounceBackAmount);

        if (bounceBackAmount.equals(Vec3.ZERO, EPSILON)) {
            return false;
        }
        const bounceBackTime = Math.max(this.bounceDuration, 0);
        this._startAutoScroll(bounceBackAmount, bounceBackTime, true);

        if (!this._isBouncing) {
            if (bounceBackAmount.y > 0) { this._dispatchEvent(CCScrollView.EventType.BOUNCE_TOP); }
            if (bounceBackAmount.y < 0) { this._dispatchEvent(CCScrollView.EventType.BOUNCE_BOTTOM); }
            if (bounceBackAmount.x > 0) { this._dispatchEvent(CCScrollView.EventType.BOUNCE_RIGHT); }
            if (bounceBackAmount.x < 0) { this._dispatchEvent(CCScrollView.EventType.BOUNCE_LEFT); }
            this._isBouncing = true;
        }

        return true;
    }

}