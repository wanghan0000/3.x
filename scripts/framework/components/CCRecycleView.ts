import { _decorator, Component, Layout, UITransform,Node, ScrollView, Vec3, game, Widget, v2, v3 } from "cc";
import { CCRecycleAdapter } from "./CCRecycleAdapter";
import { CCRecycleHolder } from "./CCRecycleHolder";
const { ccclass, property , menu} = _decorator;
@ccclass('CCRecycleView')
@menu('ui/CCRecycleView')
export default class CCRecycleView extends Component{

    @property
    private dynamic = false;

    private _adapter: CCRecycleAdapter = null;
    public set adapter(v: CCRecycleAdapter) {
        this._adapter = v;
        this.reset();
        this.initLayout();
    }
    public get adapter(): CCRecycleAdapter {
        return this._adapter;
    }


    private _scrollView: ScrollView;
    public get scrollView(): ScrollView {
        return this._scrollView;
    }

    private _layout: Layout;


    private _view: UITransform;

    /**
    * @en No layout.
    * NONE = 0,
    * @zh 禁用布局。
    */

    /**
     * @en Horizontal layout.
     *HORIZONTAL = 1,
     * @zh 水平布局。
     */

    /**
     * @en Vertical layout.
     * VERTICAL = 2,
     * @zh 垂直布局。
     */

    /**
     * @en Grid layout.
     * GRID = 3
     * @zh 网格布局。
     */
    private _layoutType: number;
    private _pdLeft: number;
    private _pdRight: number;
    private _pdTop: number;
    private _pdBottom: number;
    private _spaceX: number;
    private _spaceY: number;
    private _startAxis: number;
    private halfScrollView: number = 0;
    /**上一次content的Y值，用于和现在content的Y值比较，得出是向上还是向下滚动 */
    private lastContentPosY: number = 0;
    /**上一次content的X值，用于和现在content的X值比较，得出是向左还是向右滚动 */
    private lastContentPosX: number = 0;
    //分帧创建器
    private _gener: Generator

    private _isActive = true;

    private _pool: Map<number, Array<CCRecycleHolder>> = new Map();
    private _childrens: Array<CCRecycleHolder> = new Array();

    /**刷新的函数 */
    private updateFun: Function = function () { };

    onLoad() {
        this._scrollView = this.node.getComponent(ScrollView);
        let layout = this._scrollView.content.getComponent(Layout);
        if (!layout) {
            console.error("请在content里面添加item布局方式");
        }
        this._layoutType = layout.type;
        this._pdLeft = layout.paddingLeft;
        this._pdRight = layout.paddingRight;
        this._pdTop = layout.paddingTop;
        this._pdBottom = layout.paddingBottom;
        this._spaceX = layout.spacingX;
        this._spaceY = layout.spacingY;
        this._startAxis = layout.startAxis; //HORIZONTAL = 0, VERTICAL = 1
        //取消布局约束
        layout.type = Layout.Type.NONE;
        this._layout = layout;
        this._view = layout.getComponent(UITransform);
        this.node.getComponent(Widget).updateAlignment();
        this.scrollView.view.node.getComponent(Widget).updateAlignment();
        this.reset();
        this.node.on(Node.EventType.SIZE_CHANGED, this.sizeChanged, this);
        this.scrollView.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        this.scrollView.horizontal;
        this.scrollView.vertical
    }

    onDestroy() {
        this.node.off(Node.EventType.SIZE_CHANGED, this.sizeChanged, this);
        this.scrollView.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        this.adapter = null;
        this._scrollView = null;
        this._isActive = false;
    }

    //重置数据
    private reset() {
        this._gener?.return("")//取消上一次的分帧任务（如果任务正在执行）
        for(const key in this._pool){
            const arr = this._pool[key];
            if(arr){
                for(const v of arr){
                    v && v.node?.destroy();
                }
            }
        }
        this._pool.clear();
        this._childrens.forEach((v)=>{
            v.node.destroy();
        })
        this._childrens.length = 0;

    }

    //节点大小改变
    private sizeChanged() {
        if (this.adapter) {
            this.reset();
            this.initLayout();
        }
    }

    //初始化面板
    private initLayout() {
        let layout = this._layout;
        if (!layout) {
            console.error("请在content里面添加item布局方式");
            return;
        }
        this.countParam();
        this.startCreateItems(0);
    }
    private countParam() {
        const type = this._layoutType;
        if (type == Layout.Type.VERTICAL) {
            this.halfScrollView = this.scrollView.view.height / 2;
            if(this.dynamic){
                this._view.height = 
                this.scrollView.view.height * this.adapter.getItemCount();
            }else{
                const count = this.adapter.getItemCount() - 1 < 0 ? 0 : this.adapter.getItemCount();
                let total = this._pdTop + this._pdBottom + this._spaceY * count;
                for(let i = 0 ; i < this.adapter.getItemCount() ; ++i){
                    total += this.adapter.getSize(i).height;
                }
                this._view.height = total;
            }
            this.updateFun = this.updateV;
        } else if (type == Layout.Type.HORIZONTAL) {
            this.halfScrollView = this.scrollView.view.width / 2;
            this._view.width = this.scrollView.view.width * this.adapter.getItemCount();
            this.updateFun = this.updateH;
        } else if (type == Layout.Type.GRID) {
            const startAxis = this._startAxis;
            /**
             * @en The horizontal axis.
             * HORIZONTAL = 0,
             * @zh 进行水平方向布局。
             */

            /**
             * @en The vertical axis.
             * VERTICAL = 1
             * @zh 进行垂直方向布局。
             */
            if (startAxis == 0) {

            } else if (startAxis == 1) {
                this.halfScrollView = this.scrollView.view.height / 2;
                this._view.height = this.scrollView.view.height * this.adapter.getItemCount();
                this.updateFun = this.updateGridV;
            }
        }
    }

    /**
     * 
     * @param startIndex 创建的起始节点
     */
    private startCreateItems(startIndex: number) {
        //取消上一次的分帧任务（如果任务正在执行）
        this._gener?.return("");

        if (startIndex < 0) {
            startIndex = 0;
        }

        let type = this._layoutType;
        let maxNum = this.adapter.getItemCount();

        //获取view的高度 每一个像素默认创建一个item 后面改成一屏幕应该创建多少个节点
        let total = 0;
        if (type == Layout.Type.VERTICAL) {
            total = Math.abs(this._view.height);
        } else if (type == Layout.Type.HORIZONTAL) {
            total = Math.abs(this._view.width)
        } else if (type == Layout.Type.GRID) {
            if (this._startAxis == 0) {

            } else if (this._startAxis == 1) {
                total = Math.abs(this._view.height);
            }
        }

        this._gener = this.getGeneratorLength(total, (i, gener) => {
            if (!this._isActive) {
                gener?.return("")
                return false;
            }


            let index = startIndex + i;
            if (index >= maxNum) {
                //超出范围 则直接退出
                gener?.return("")
                return false
            }

            let item: CCRecycleHolder;
            let itemType = this.adapter.getType(index);
            item = this.getItem(itemType, index);
            item.itemIndex = index;


            this._layout.node.addChild(item.node);


            if (type == Layout.Type.VERTICAL) {
                let bottomY = -this._pdTop;
                let lastItem = this._childrens[this._childrens.length - 1];
                if (lastItem) {
                    bottomY = lastItem.node.position.y - lastItem.view.height / 2
                        - this._spaceY;
                }
                item.node.position = new Vec3(item.node.position.x,
                    bottomY - item.view.height / 2);
                if (!this.isInWindow(item)) {
                    this._childrens.push(item);
                    gener?.return("")
                    //创建结束
                    return false;
                }

                if(this.dynamic){
                    if (i == maxNum - 1) {
                        this._view.height
                            = Math.abs(item.node.position.y) + item.view.height / 2 + this._pdBottom;
                    }
                }
            } else if (type == Layout.Type.HORIZONTAL) {
                let leftX = this._pdLeft;
                let lastItem = this._childrens[this._childrens.length - 1];
                if (lastItem) {
                    leftX = lastItem.node.position.x + lastItem.view.width / 2
                        + this._spaceX;

                }
                item.node.position = new Vec3(leftX + item.view.width / 2,
                    item.node.position.y);
                if (!this.isInWindow(item)) {
                    this._childrens.push(item);
                    gener?.return("")
                    return false;
                }

                if(this.dynamic){
                    if (i == maxNum - 1) {
                        this._view.width
                            = Math.abs(item.node.position.x) + item.view.width / 2 + this._pdRight;
                    }
                }
            } else if (type == Layout.Type.GRID) {
                let startAxis = this._startAxis;

                if (startAxis == 0) {
                    //水平
                } else if (startAxis == 1) {
                    //垂直
                    let lastItem = this._childrens[this._childrens.length - 1];
                    //获取同一级最低节点
                    if (lastItem) {
                        //最后一个节点的 当前节点是否超出 当前宽度
                        if (this.isInGrid(lastItem, item)) {
                            //可以容纳在一个网格内
                            let topY = lastItem.node.position.y + lastItem.view.height / 2;
                            let x = lastItem.node.position.x + lastItem.view.width / 2 + this._spaceX + item.view.width / 2;
                            item.node.position = new Vec3(x, topY - item.view.height / 2);
                            item.gIndex = lastItem.gIndex;
                        } else {
                            //不可以容纳在一个网格内
                            //获取当前节点高度最高的节点
                            let zIndex = lastItem.gIndex;
                            let maxHeightItem = this.getMaxItem(zIndex);
                            let topY = maxHeightItem.node.position.y - maxHeightItem.view.height / 2;
                            let x = -this._view.anchorX * this._view.width + this._pdLeft + item.view.width / 2;
                            item.node.position = new Vec3(x, topY - item.view.height / 2 - this._spaceY);
                            item.gIndex = maxHeightItem.gIndex + 1;
                        }
                    } else {
                        let topY = -this._pdTop;
                        let x = -this._view.anchorX * this._view.width + this._pdLeft + item.view.width / 2;
                        item.node.position = new Vec3(x, topY - item.view.height / 2);
                        item.gIndex = 0;
                    }

                    if(this.dynamic){
                        if (i == maxNum - 1) {
                            let maxHeightItem = this.getMaxItem(item.gIndex);
                            this._view.height
                                = Math.abs(maxHeightItem.node.position.y) + maxHeightItem.view.height / 2 + this._pdBottom;
                        }
                    }
                }
                if (!this.isInWindow(item)) {
                    this._childrens.push(item);
                    gener?.return("")
                    return false;
                }
            }

            this._childrens.push(item);
            return true;
        }, this._gener)

        this.exeGenerator(this._gener, 4);
    }

    private createNextItem() {
        let lastItem = this._childrens[this._childrens.length - 1];
        // let index = 0;
        // if (!lastItem) {
        //     const item = this.createItem(index);

        //     return
        // }
        let index = lastItem ? (lastItem.itemIndex + 1) : 0;
        if (index >= this.adapter.getItemCount()) {
            return;
        }
        if(lastItem){
            if (this.isInWindow(lastItem)) {
                const item = this.createItem(index);
                this._childrens.push(item);
                this.createNextItem();
            }
        }else{
            const item = this.createItem(index);
            this._childrens.push(item);
            this.createNextItem();
        }
        
    }

    private createItem(index){
        let item: CCRecycleHolder;
        let type = this._layoutType;
        let itemType = this.adapter.getType(index);
        item = this.getItem(itemType, index);
        item.itemIndex = index;
        this._layout.node.addChild(item.node);


        if (type == Layout.Type.VERTICAL) {
            let bottomY = -this._pdTop;
            let lastItem = this._childrens[this._childrens.length - 1];
            if (lastItem) {
                bottomY = lastItem.node.position.y - lastItem.view.height / 2
                    - this._spaceY;
            }
            item.node.position = new Vec3(item.node.position.x,
                bottomY - item.view.height / 2);

            if(this.dynamic){
                if (index == this.adapter.getItemCount() - 1) {
                    this._view.height
                        = Math.abs(item.node.position.y) + item.view.height / 2 + this._pdBottom;
                }
            }    
        } else if (type == Layout.Type.HORIZONTAL) {
            let leftX = this._pdLeft;
            let lastItem = this._childrens[this._childrens.length - 1];
            if (lastItem) {
                leftX = lastItem.node.position.x + lastItem.view.width / 2
                    + this._spaceX;
            }
            item.node.position = new Vec3(leftX + item.view.width / 2,
                item.node.position.y);
            if (index == this.adapter.getItemCount() - 1) {
                this._view.width
                    = Math.abs(item.node.position.x) + item.view.width / 2 + this._pdRight;
            }
        } else if (type == Layout.Type.GRID) {
            if (this._startAxis == 0) {

            } else if (this._startAxis == 1) {
                let lastItem = this._childrens[this._childrens.length - 1];
                if (lastItem) {
                    if (this.isInGrid(lastItem, item)) {
                        //可以容纳在一个网格内
                        let topY = lastItem.node.position.y + lastItem.view.height / 2;
                        let x = lastItem.node.position.x + lastItem.view.width / 2 + this._spaceX + item.view.width / 2;
                        item.node.position = new Vec3(x, topY - item.view.height / 2);
                        item.gIndex = lastItem.gIndex;
                    } else {
                        //不可以容纳在一个网格内
                        //获取当前节点高度最高的节点
                        let zIndex = lastItem.gIndex;
                        let maxHeightItem = this.getMaxItem(zIndex);
                        let topY = maxHeightItem.node.position.y - maxHeightItem.view.height / 2;
                        let x = -this._view.anchorX * this._view.width + this._pdLeft + item.view.width / 2;
                        item.node.position = new Vec3(x, topY - item.view.height / 2 - this._spaceY);
                        item.gIndex = maxHeightItem.gIndex + 1;
                    }
                }
                if(this.dynamic){
                    if (index == this.adapter.getItemCount() - 1) {
                        let maxHeightItem = this.getMaxItem(item.gIndex);
                        maxHeightItem = maxHeightItem ? maxHeightItem : item;
                        this._view.height
                            = Math.abs(maxHeightItem.node.position.y) + maxHeightItem.view.height / 2 + this._pdBottom;
                    }
                }
            }
        }
        return item;
    }

    private createPreviousItem() {
        let firstItem = this._childrens[0];
        if (!firstItem) {
            return
        }
        let index = firstItem.itemIndex - 1;
        if (index < 0) {
            return
        }
        if (this.isInWindow(firstItem)) {
            let item: CCRecycleHolder;
            let type = this._layoutType;
            let itemType = this.adapter.getType(index);
            item = this.getItem(itemType, index);
            item.itemIndex = index;
            this._layout.node.addChild(item.node);


            if (type == Layout.Type.VERTICAL) {
                let topY = firstItem.node.position.y + firstItem.view.height / 2 + this._spaceY;
                item.node.position = new Vec3(item.node.position.x, topY + item.view.height / 2);
            } else if (type == Layout.Type.HORIZONTAL) {
                let leftX = firstItem.node.position.x - firstItem.view.width / 2 - this._spaceX;
                item.node.position = new Vec3(leftX - item.view.width / 2, item.node.position.y);
            }
            this._childrens.unshift(item);
            this.createPreviousItem();
        }
    }

    private createGrildPreviousItem() {
        let firstItem = this._childrens[0];
        if (!firstItem) {
            return
        }
        let index = firstItem.itemIndex - 1;
        if (index < 0) {
            return
        }

        let maxItem = this.getMaxItem(firstItem.gIndex);
        if (this.isInWindow(maxItem)) {
            let items: Array<CCRecycleHolder> = [];
            this.createGrildItems(index, maxItem.gIndex - 1, null, items);
            let length = items.length;

            let maxHeight = 0;
            for (let i = 0; i < length; ++i) {
                if (items[i].view.height > maxHeight) {
                    maxHeight = items[i].view.height;
                }
                this._childrens.unshift(items[i]);
            }

            let topY = firstItem.node.position.y + firstItem.view.height / 2 + this._spaceY + maxHeight;
            let leftItem: CCRecycleHolder = null;
            for (let i = length - 1; i >= 0; i--) {
                let item: CCRecycleHolder = items[i];
                if (leftItem) {
                    let x = leftItem.node.position.x + leftItem.view.width / 2 + this._spaceX + item.view.width / 2;
                    item.node.position = new Vec3(x, topY - item.view.height / 2);
                } else {
                    let x = -this._view.anchorX * this._view.width + this._pdLeft + item.view.width / 2;
                    item.node.position = new Vec3(x, topY - item.view.height / 2);
                }
                leftItem = item;
            }
            this.createGrildPreviousItem();
        }
    }

    private createGrildItems(index: number, gIndex: number, rightItem: CCRecycleHolder, items) {
        if (index < 0) {
            return
        }
        let item: CCRecycleHolder;
        let itemType = this.adapter.getType(index);
        item = this.getItem(itemType, index);
        item.itemIndex = index;
        item.gIndex = gIndex;
        let limitW = this._view.anchorX * this._view.width;
        if (rightItem) {
            if (rightItem.node.position.x - rightItem.view.width / 2 - this._spaceX - item.view.width - this._pdLeft < -limitW) {
                return;
            }
            item.node.position = new Vec3(rightItem.node.position.x - rightItem.view.width / 2 - this._spaceX - item.view.width / 2, 0);
        } else {
            item.node.position = new Vec3(limitW - item.view.width / 2, 0);
        }
        this._layout.node.addChild(item.node);
        items.push(item);
        this.createGrildItems(index - 1, gIndex, item, items);
    }



    //判断是否在窗口
    private isInWindow(item: CCRecycleHolder): boolean {
        if(!item){
            return true;
        }
        let point = this.getPositionInView(item);
        let type = this._layoutType;
        let startAxis = this._startAxis;
        if (type == Layout.Type.VERTICAL) {
            if (point.y - item.view.height / 2 > this.halfScrollView
                || point.y + item.view.height / 2 < -this.halfScrollView) {
                return false;
            }
        } else if (type == Layout.Type.HORIZONTAL) {
            if (point.x + item.view.width / 2 < -this.halfScrollView
                || point.x - item.view.width / 2 > this.halfScrollView) {
                return false;
            }
        } else if (type == Layout.Type.GRID) {
            if (startAxis == 0) {
                if (point.x + item.view.width / 2 < -this.halfScrollView
                    || point.x - item.view.width / 2 > this.halfScrollView) {
                    return false;
                }
            } else if (startAxis == 1) {
                if (point.y - item.view.height / 2 > this.halfScrollView
                    || point.y + item.view.height / 2 < -this.halfScrollView) {
                    return false;
                }
            }
        }
        return true;
    }

    //判断是否能容纳在同一个网格内
    private isInGrid(last: CCRecycleHolder, current: CCRecycleHolder): boolean {
        if (this._layoutType != Layout.Type.GRID) {
            return false
        }

        let startAxis = this._startAxis;
        if (startAxis == 0) {
            //水平
        } else if (startAxis == 1) {
            //垂直
            //let bottomY = -this._pdTop;
            let limitW = this._view.anchorX * this._view.width;
            //let startX = -limitW; //最左侧的点 坐标
            if (last.node.position.x + last.view.width / 2 + this._spaceX + current.view.width > limitW) {
                return false;//不能容纳在一个网格内
            }
        }
        return true;
    }

    private getRightItem(zIndex: number): CCRecycleHolder {
        let childs = this._childrens;
        let rightItem: CCRecycleHolder = null;
        for (let i = 0; i < childs.length; ++i) {
            if (childs[i].gIndex == zIndex) {
                if (rightItem) {
                    if (this._startAxis == 1) {
                        rightItem = childs[i];
                    }
                } else {
                    rightItem = childs[i];
                }
            }
        }
        return rightItem;
    }


    private getMaxItem(zIndex: number): CCRecycleHolder {
        let childs = this._childrens;
        let maxItem: CCRecycleHolder = null;
        for (let i = 0; i < childs.length; ++i) {
            if (childs[i].gIndex == zIndex) {
                if (maxItem) {
                    if (this._startAxis == 1) {
                        if (maxItem.view.height < childs[i].view.height) {
                            maxItem = childs[i];
                        }
                    }
                } else {
                    maxItem = childs[i];
                }
            }
        }
        return maxItem;
    }

    /**获取item在scrollView的局部坐标 */
    private getPositionInView(item: CCRecycleHolder): Vec3 {
        let worldPos = this._view.convertToWorldSpaceAR(item.node.position);
        let viewPos = this.scrollView.view.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }


    /**获取一个列表项 */
    private getItem(type, index) {
        let child: CCRecycleHolder;
        let datas = this._pool.get(type);
        if (datas && datas.length) {
            child = datas.pop();
        } else {
            child = this.adapter.onCreateViewHolder(index)
        }
        this.adapter.onBindViewHolder(child, index);
        return child;
    }

    private removeItem(item: CCRecycleHolder) {
        if (!item) { return }
        item.node.removeFromParent();

        let type = this.adapter.getType(item.itemIndex);
        let datas = this._pool.get(type);
        if (!datas) {
            datas = new Array();
        }
        datas.push(item);
        this._pool[type] = datas;
    }

    public updateV() {
        let isUp = this._layout.node.position.y > this.lastContentPosY;
        let childs = this._childrens;
        for (let i = 0; i < childs.length; ++i) {
            let item = childs[i];
            let viewPos = this.getPositionInView(item);
            if (childs.length <= 1) {
                //必须要剩一个 不然就全部被删除了
                break
            }
            if (isUp) {
                //如果item超过上边界 那么就移除
                if (viewPos.y - item.view.height / 2 > this.halfScrollView) {
                    this.removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            } else {
                if (viewPos.y + item.view.height / 2 < -this.halfScrollView) {
                    this.removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            }
        }

        if (isUp) {
            //创建下一个
            this.createNextItem();
        } else {
            //创建上一个
            this.createPreviousItem();
        }
        this.lastContentPosY = this._layout.node.position.y;
    }

    public updateH() {
        let isLeft = this._layout.node.position.x < this.lastContentPosX;
        let childs = this._childrens;
        for (let i = 0; i < childs.length; ++i) {
            let item = childs[i];
            let viewPos = this.getPositionInView(item);
            if (childs.length <= 1) {
                break
            }
            if (isLeft) {
                //如果item超过左边界 那么就移除
                if (viewPos.x + item.view.width / 2 < -this.halfScrollView) {
                    this.removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            } else {
                if (viewPos.x - item.view.width / 2 > this.halfScrollView) {
                    this.removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            }
        }
        if (isLeft) {
            //创建下一个
            this.createNextItem();
        } else {
            //创建上一个
            this.createPreviousItem();
        }
        this.lastContentPosX = this._layout.node.position.x;
    }

    public updateGridV() {
        let isUp = this._layout.node.position.y > this.lastContentPosY;
        let childs = this._childrens;

        let items = {};
        let gIndex = 0;
        for (let i = 0; i < childs.length; ++i) {
            if (childs[i].gIndex != gIndex) {
                gIndex = childs[i].gIndex;
            }
            if (!items[gIndex]) {
                items[gIndex] = [];
            }
            items[gIndex].push(childs[i]);
        }

        let deleteItems = [];

        let length = Object.keys(items).length;
        let startIndex = 0;
        for (let key in items) {
            if(isUp){
                if(startIndex >= length - 1){
                    break;
                }
            }else{
                if(startIndex == 0){
                    startIndex += 1;
                    continue;
                }
            }
            let datas: Array<CCRecycleHolder> = items[key];
            let maxItem = this.getMaxItem(datas[0].gIndex);
            let viewPos = this.getPositionInView(maxItem);
            if (isUp) {
                if (viewPos.y - maxItem.view.height / 2 > this.halfScrollView) {
                    datas.forEach((v) => {
                        deleteItems.push(v)
                    })
                }
            } else {
                if (viewPos.y + maxItem.view.height / 2 < -this.halfScrollView) {
                    datas.forEach((v) => {
                        deleteItems.push(v)
                    })
                }
            }
            startIndex += 1;
        }

        for (let i = 0; i < childs.length; ++i) {
            if (childs.length <= 1) {
                break;
            }
            for (let j = 0; j < deleteItems.length; ++j) {
                if (childs[i].itemIndex == deleteItems[j].itemIndex) {
                    this.removeItem(childs[i]);
                    childs.splice(i, 1);
                    deleteItems.splice(j, 1);
                    i--;
                    break;
                }
            }
        }

        if (isUp) {
            //创建下一个
            this.createNextItem();
        } else {
            //创建上一个
            this.createGrildPreviousItem();
        }
        this.lastContentPosY = this._layout.node.position.y;
    }


    /**是否滚动容器 */
    private bScrolling: boolean = false;
    lateUpdate(dt) {
        if (this.bScrolling == false) {
            return;
        }
        this.bScrolling = false;
        this.updateFun();
    }

    public getTopIndex(): number{
        const item = this._childrens[0];
        return item ? item.itemIndex : 0;
    }

    public getBottomIndex(){
        const item = this._childrens[this._childrens.length - 1];
        return item ? item.itemIndex : 0;
    }   

    public onScrolling(ev: Event = null) {
        this.bScrolling = true;
    }

    /** 分帧加载 */
    private * getGeneratorLength(length: number, callback: Function, ...params: any): Generator {
        for (let i = 0; i < length; i++) {
            let result = callback(i, ...params)
            if (result) {
                yield
            } else {
                return
            }
        }
    }

    /** 分帧执行 */
    private exeGenerator(generator: Generator, duration: number) {
        return new Promise<void>((resolve, reject) => {
            let gen = generator
            let execute = () => {
                let startTime = new Date().getTime()
                for (let iter = gen.next(); ; iter = gen.next()) {
                    if (iter == null || iter.done) {
                        resolve()
                        return
                    }
                    if (new Date().getTime() - startTime > duration) {
                        setTimeout(() => execute(), game.deltaTime * 1000)
                        return
                    }
                }
            }
            execute()
        })
    }
}