import {
    _decorator,
    Component,
    Node,
    ScrollView,
    Enum,
    Widget,
    UITransform,
    game,
    v3,
    Vec3,
    Vec2,
    EventHandler,
} from 'cc';
import { CCRecycleAdapter } from './CCRecycleAdapter';
import { CCRecycleHolder } from './CCRecycleHolder';

//2000以内则有滚动动画
const AUTO_SCROLL_MAX_DISTANCE = 2000;

export enum Ccc_Ui_RecycleView_Type {
    /**
     * @zh 水平布局。
     */
    HORIZONTAL = 1,
    /**
     * @zh 垂直布局。
     */
    VERTICAL = 2,
    /**
     * @zh 网格布局。
     */
    GRID = 3,
}

export enum Ccc_Ui_RecycleView__AxisDirection {
    /**
     * @zh 进行水平方向布局。
     */
    HORIZONTAL = 0,
    /**
     * @zh 进行垂直方向布局。
     */
    VERTICAL = 1,
}

const { ccclass, property, menu } = _decorator;

/**
 * Predefined variables
 * Name = CCCRecycleView
 * DateTime = Sun Mar 13 2022 09:16:06 GMT+0400 (海湾标准时间)
 * Author = xl000000
 * FileBasename = CCCRecycleView.ts
 * FileBasenameNoExtension = CCCRecycleView
 * URL = db://assets/scripts/framework/components/CCCRecycleView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('CCCRecycleView')
@menu('ui/CCCRecycleView')
export class CCCRecycleView extends Component {
    @property({
        type: CCRecycleAdapter,
        tooltip: '页面适配器',
    })
    public get adapter(): CCRecycleAdapter {
        return this._adapter;
    }
    public set adapter(v: CCRecycleAdapter) {
        this._adapter = v;
    }

    @property({
        type: UITransform,
        tooltip: 'footer节点',
    })
    private footer: UITransform = null;
    @property({
        tooltip: '距离底部多少数值触发footer刷新事件',
    })
    private footerOffset: number = 0;
    @property({
        type: EventHandler,
        tooltip: 'footer刷新事件触发',
    })
    private footerEvents: EventHandler[] = [];

    @property({
        type: Enum(Ccc_Ui_RecycleView_Type),
        tooltip: '布局类型',
    })
    public get type(): Ccc_Ui_RecycleView_Type {
        return this._layoutType;
    }
    public set type(v: Ccc_Ui_RecycleView_Type) {
        this._layoutType = v;
    }

    @property({
        type: Enum(Ccc_Ui_RecycleView__AxisDirection),
        visible: function () {
            return this._layoutType === Ccc_Ui_RecycleView_Type.GRID;
        },
        tooltip: '起始轴方向类型，可进行水平和垂直布局排列，只有布局类型为 GRID 的时候才有效',
    })
    public get startAxis(): Ccc_Ui_RecycleView__AxisDirection {
        return this._startAxis;
    }
    public set startAxis(v: Ccc_Ui_RecycleView__AxisDirection) {
        this._startAxis = v;
    }

    @property({
        tooltip: '容器内左边距',
    })
    public get paddingLeft(): number {
        return this._paddingLeft;
    }
    public set paddingLeft(v: number) {
        this._paddingLeft = v;
    }

    @property({
        tooltip: '容器内右边距',
    })
    public get paddingRight(): number {
        return this._paddingRight;
    }
    public set paddingRight(v: number) {
        this._paddingRight = v;
    }

    @property({
        tooltip: '容器内上边距',
    })
    public get paddingTop(): number {
        return this._paddingTop;
    }
    public set paddingTop(v: number) {
        this._paddingTop = v;
    }

    @property({
        tooltip: '容器内下边距',
    })
    public get paddingBottom(): number {
        return this._paddingBottom;
    }
    public set paddingBottom(v: number) {
        this._paddingBottom = v;
    }

    @property({
        tooltip: '子节点之间的水平间距。',
        visible: function () {
            return this._layoutType !== Ccc_Ui_RecycleView_Type.VERTICAL;
        },
    })
    public get spacingX(): number {
        return this._spacingX;
    }
    public set spacingX(v: number) {
        this._spacingX = v;
    }

    @property({
        tooltip: '子节点之间的垂直间距。',
        visible: function () {
            return this._layoutType !== Ccc_Ui_RecycleView_Type.HORIZONTAL;
        },
    })
    public get spacingY(): number {
        return this._spacingY;
    }
    public set spacingY(v: number) {
        this._spacingY = v;
    }

    @property({
        tooltip: '是否添加点击事件',
    })
    private itemClick = true;

    @property({
        serializable: true,
    })
    protected _layoutType = Ccc_Ui_RecycleView_Type.VERTICAL;

    @property({
        serializable: true,
    })
    protected _startAxis = Ccc_Ui_RecycleView__AxisDirection.VERTICAL;
    @property({
        serializable: true,
    })
    protected _paddingLeft = 0;
    @property({
        serializable: true,
    })
    protected _paddingRight = 0;
    @property({
        serializable: true,
    })
    protected _paddingTop = 0;
    @property({
        serializable: true,
    })
    protected _paddingBottom = 0;
    @property({
        serializable: true,
    })
    protected _spacingX = 0;
    @property({
        serializable: true,
    })
    protected _spacingY = 0;
    @property({
        serializable: true,
    })
    protected _adapter: CCRecycleAdapter = null;

    /**滚动器一半的值 如果是横向布局则是 width/2 纵向布局则是 height/2 */
    protected halfScrollView: number = 0;
    /**上一次content的Y值，用于和现在content的Y值比较，得出是向上还是向下滚动 */
    protected lastContentPosY: number = 0;
    /**上一次content的X值，用于和现在content的X值比较，得出是向左还是向右滚动 */
    protected lastContentPosX: number = 0;
    //分帧创建器
    protected gener: Generator;

    /**item节点内存池 */
    protected _pool: Map<number, Array<CCRecycleHolder>> = new Map();
    /**当前现实在屏幕里的item */
    protected _childrens: Array<CCRecycleHolder> = new Array();

    /**刷新的函数 */
    protected updateFun: Function = function () {};

    public scrollView: ScrollView = null;

    private _contentView: UITransform = null;

    private footerState = 0; //0没有加载 1 正在加载 2加载完成
    onLoad() {
        this.scrollView = this.getComponent(ScrollView);
        this._contentView = this.scrollView!.content!.getComponent(UITransform);
        this.node.getComponent(Widget)?.updateAlignment();
        this.scrollView.content.parent.getComponent(Widget)?.updateAlignment();
        this.scrollView.content.getComponent(Widget)?.updateAlignment();
        this.scrollView.node.on(ScrollView.EventType.SCROLLING, this._onScrolling, this);
    }

    start() {
        this._initLayout();
    }

    public scrollToIndex(index) {
        if (index >= this.adapter.getItemCount()) {
            index = this.adapter.getItemCount() - 1;
        }
        if (index < 0) {
            index = 0;
        }
        let point = this._calculationPosition(index);
        const size = this.adapter.getSize(index);
        const type = this._layoutType;
        let vec = new Vec2(point.x, point.y);
        let setpEnable = true;
        let topIndex = 0;
        if (this._childrens.length) {
            topIndex = this._childrens[0].itemIndex;
        }
        let point2 = this._calculationPosition(topIndex);
        let vec2 = new Vec2(point2.x, point2.y);
        const size2 = this.adapter.getSize(topIndex);
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            vec.y = -(point.y + size.height / 2);
            vec2.y = -(point2.y + size2.height / 2);
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            vec.x = point.x - size.width / 2;
            vec2.x = point2.x - size2.width / 2;
        }
        setpEnable = Math.abs(vec.length() - vec2.length()) > AUTO_SCROLL_MAX_DISTANCE;
        if (setpEnable) {
            if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
                if (topIndex < index) {
                    vec2.y = vec.y - AUTO_SCROLL_MAX_DISTANCE;
                } else {
                    vec2.y = vec.y + AUTO_SCROLL_MAX_DISTANCE;
                }
                this.scrollView.scrollToOffset(vec2, 0);
                this.lastContentPosY = this._contentView.node.position.y;
            } else {
                if (topIndex < index) {
                    vec2.x = vec.x - AUTO_SCROLL_MAX_DISTANCE;
                } else {
                    vec2.x = vec.x + AUTO_SCROLL_MAX_DISTANCE;
                }
                this.scrollView.scrollToOffset(vec2, 0);
                this.lastContentPosX = this._contentView.node.position.x;
            }
        }
        this.scrollView.scrollToOffset(vec, 1);
    }

    private distanceToIndex() {}

    //刷新数据
    public notifyDataSetChanged() {

        //let start = Date.now();

        const count = this.adapter.getItemCount();
        const childs = this._childrens;
        const type = this._layoutType;
        //重新计算高度
        let oldHeight = this._contentView.height;
        let oldWidth = this._contentView.width;
        this._countParam();
        let delta;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            delta = oldHeight - this._contentView.height;
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            delta = this._contentView.width - oldWidth;
        }
        //先删除掉所有显示的节点
        for (let i = 0; i < childs.length; ++i) {
            //无法获取到原数据 所以这里不做缓存
            this._removeItem(childs[i]);
        }
        this._childrens.length = 0;

        if (delta >= 0 && delta < 0.0001) {
            //由上向下创建
            this._createNextItem();
        } else if (delta < 0) {
            this._createNextItem();
        } else {
            //获取当前位置
            const index = this.getScreenLastIndex();
            if (index < count) {
                this._createNextItem();
            } else {
                if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
                    this.scrollView.scrollToBottom();
                    this.lastContentPosY = this._contentView.node.position.y;
                } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
                    this.scrollView.scrollToRight();
                }
                this._createNextItem();
            }
        }
        // let stop = Date.now();
        // console.log(stop - start);
    }

    /**
     * 触发加载完成
     * @param more 是否还有更多
     */
    public loadMoreFinish(finish: boolean = false) {
        if (finish) {
            this.footerState = 0;
        } else {
            this.footerState = 2;
        }
    }

    private _initLayout() {
        this._countParam();
        this.startCreateItems();
    }

    private _countParam() {
        const type = this._layoutType;
        const pdTop = this._paddingTop;
        const pdBottom = this._paddingBottom;
        const pdLeft = this._paddingLeft;
        const pdRight = this._paddingRight;
        const spaceX = this._spacingX;
        const spaceY = this._spacingY;
        const contentView = this._contentView;
        const footer = this.footer;

        if (Ccc_Ui_RecycleView_Type.VERTICAL == type) {
            this.halfScrollView = this.scrollView.view.height / 2;
            const count = this.adapter.getItemCount() - 1 < 0 ? 0 : this.adapter.getItemCount();
            let total = pdTop + pdBottom + spaceY * count;
            for (let i = 0; i < this.adapter.getItemCount(); ++i) {
                total += this.adapter.getSize(i).height;
            }
            if (total < this.scrollView.view.height) {
                total = this.scrollView.view.height;
            }
            contentView.height = total + (footer?.height || 0);
            if (footer) {
                footer.node.position = v3(
                    footer.node.position.x,
                    -contentView.height * contentView.anchorY + footer.height / 2,
                );
                this.footerOffset = footer.height;
            }
            contentView.width =
                this.scrollView.node.getComponent(UITransform).width - pdLeft - pdRight;
            this.updateFun = this.updateV;
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            this.halfScrollView = this.scrollView.view.width / 2;
            const count = this.adapter.getItemCount() - 1 < 0 ? 0 : this.adapter.getItemCount();
            let total = pdLeft + pdRight + spaceX * count;
            for (let i = 0; i < this.adapter.getItemCount(); ++i) {
                total += this.adapter.getSize(i).width;
            }
            if (total < this.scrollView.view.width) {
                total = this.scrollView.view.width;
            }
            contentView.width = total + (footer?.width || 0);
            if (footer) {
                footer.node.position = v3(
                    contentView.width * (1 - contentView.anchorX) - footer.width / 2,
                    footer.node.position.y,
                );
                this.footerOffset = footer.width;
            }
            contentView.height =
                this.scrollView.node.getComponent(UITransform).height - pdTop - pdBottom;
            this.updateFun = this.updateH;
        } else if (Ccc_Ui_RecycleView_Type.GRID === type) {
        }
    }
    private startCreateItems() {
        const startIndex = 0;
        const parent = this._contentView.node;
        //获取当前一屏可以创建多少个item
        const total = this._getInScreenMaxNumber(startIndex);
        const maxNum = this.adapter.getItemCount();

        //this._createNextItem();
        let isBreak = false;
        this.gener = this.getGeneratorLength(total, (i) => {
            if (isBreak) {
                return false;
            }
            let index = startIndex + i;
            if (index >= maxNum) {
                isBreak = true;
                return false;
            }
            if (this._inScreen(index)) {
                const item: CCRecycleHolder = this._createItem(index);
                parent.addChild(item.node);
                this._childrens.push(item);
            } else {
                isBreak = true;
                return false;
            }
            return true;
        });

        this.exeGenerator(this.gener, 4);
    }

    private _createItem(index): CCRecycleHolder {
        let item: CCRecycleHolder;
        let itemType = this.adapter.getType(index);
        item = this.getItem(itemType, index);
        item.itemIndex = index;
        item.node.position = this._calculationPosition(index);
        return item;
    }

    //判断是否存在屏幕里
    private _inScreen(index): boolean {
        if (index < 0 || index >= this.adapter.getItemCount()) {
            return false;
        }
        let point = this._calculationPosition(index);
        point = this._getPositionByPoint(point);
        const size = this.adapter.getSize(index);
        return this._pointHitScreen(point, size);
    }

    private _inScreenByItem(item: CCRecycleHolder) {
        if (!item) {
            return;
        }
        let index = item.itemIndex;
        if (index < 0 || index >= this.adapter.getItemCount()) {
            return false;
        }
        const point = this._getPositionInView(item);
        const size = this.adapter.getSize(index);
        return this._pointHitScreen(point, size);
    }

    private _pointHitScreen(point, size) {
        const type = this._layoutType;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            if (
                point.y - size.height / 2 > this.halfScrollView ||
                point.y + size.height / 2 < -this.halfScrollView
            ) {
                return false;
            }
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            if (
                point.x + size.width / 2 < -this.halfScrollView ||
                point.x - size.width / 2 > this.halfScrollView
            ) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    /**获取item在scrollView的局部坐标 */
    private _getPositionInView(item: CCRecycleHolder): Vec3 {
        let worldPos = this._contentView.convertToWorldSpaceAR(item.node.position);
        let viewPos = this.scrollView.view.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    private _getPositionByPoint(point: Vec3): Vec3 {
        let worldPos = this._contentView.convertToWorldSpaceAR(point);
        let viewPos = this.scrollView.view.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    //计算坐标
    private _calculationPosition(index): Vec3 {
        const retV3 = new Vec3();
        const type = this._layoutType;
        const pdTop = this._paddingTop;
        const pdBottom = this._paddingBottom;
        const pdLeft = this._paddingLeft;
        const pdRight = this._paddingRight;
        const spaceX = this._spacingX;
        const spaceY = this._spacingY;
        const childs = this._childrens;
        const adapter = this._adapter;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            let item;
            for (let i = 0; i < childs.length; ++i) {
                item = childs[i];
                if (item.itemIndex == index + 1) {
                    retV3.x = item.node.position.x;
                    retV3.y =
                        item.node.position.y +
                        item.view.height / 2 +
                        spaceY +
                        adapter.getSize(index).height / 2;
                    break;
                } else if (item.itemIndex == index - 1) {
                    retV3.x = item.node.position.x;
                    retV3.y =
                        item.node.position.y -
                        item.view.height / 2 -
                        spaceY -
                        adapter.getSize(index).height / 2;
                    break;
                }
                item = null;
            }
            if (!item) {
                let toatlY = (1 - this._contentView.anchorY) * this._contentView.height;
                toatlY -= pdTop;
                for (let i = 0; i < index; ++i) {
                    toatlY -= adapter.getSize(i).height;
                    toatlY -= spaceY;
                }
                toatlY -= adapter.getSize(index).height / 2;
                retV3.y = toatlY;
            }
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            let item;
            for (let i = 0; i < childs.length; ++i) {
                item = childs[i];
                if (item.itemIndex == index + 1) {
                    retV3.x =
                        item.node.position.x -
                        item.view.width / 2 -
                        spaceX -
                        adapter.getSize(index).width / 2;
                    retV3.y = item.node.position.y;
                    break;
                } else if (item.itemIndex == index - 1) {
                    retV3.x =
                        item.node.position.x +
                        item.view.width / 2 +
                        spaceX +
                        adapter.getSize(index).width / 2;
                    retV3.y = item.node.position.y;
                    break;
                }
                item = null;
            }
            if (!item) {
                let toatlX = -this._contentView.anchorX * this._contentView.width;
                toatlX += pdLeft;
                for (let i = 0; i < index; ++i) {
                    toatlX += adapter.getSize(i).width;
                    toatlX += spaceX;
                }
                toatlX += adapter.getSize(index).width / 2;
                retV3.x = toatlX;
            }
        }

        return retV3;
    }

    //获取一屏可以容纳创建多少个节点
    private _getInScreenMaxNumber(startIndex): number {
        const type = this._layoutType;
        const pdTop = this._paddingTop;
        const pdBottom = this._paddingBottom;
        const pdLeft = this._paddingLeft;
        const pdRight = this._paddingRight;
        const spaceX = this._spacingX;
        const spaceY = this._spacingY;
        const adapter = this.adapter;
        let retNumber = 0;
        let total = 0;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            const count = this.adapter.getItemCount();
            const maxHeight = this.scrollView.view.height;
            if (startIndex == 0) {
                total = total + pdTop;
            }
            for (let i = startIndex; i < count; ++i) {
                if (total > maxHeight) {
                    break;
                }
                retNumber += 1;
                total += adapter.getSize(i).height;
                total += spaceY;
            }
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            const count = this.adapter.getItemCount();
            const maxWidth = this.scrollView.view.width;
            if (startIndex == 0) {
                total = total + pdLeft;
            }
            for (let i = startIndex; i < count; ++i) {
                if (total > maxWidth) {
                    break;
                }
                retNumber += 1;
                total += adapter.getSize(i).width;
                total += spaceX;
            }
        }
        return retNumber;
    }

    private updateV() {
        const isUp = this._contentView.node.position.y > this.lastContentPosY;
        const childs = this._childrens;
        for (let i = 0; i < childs.length; ++i) {
            // if (childs.length <= 1) {
            //     break;
            // }
            const item = childs[i];
            const viewPos = this._getPositionInView(item);
            if (isUp) {
                //如果item超过上边界 那么就移除
                if (viewPos.y - item.view.height / 2 > this.halfScrollView) {
                    this._removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            } else {
                if (viewPos.y + item.view.height / 2 < -this.halfScrollView) {
                    this._removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            }
        }

        if (isUp) {
            //创建下一个
            this._createNextItem();
        } else {
            //创建上一个
            this._createPreviousItem();
        }
        this.lastContentPosY = this._contentView.node.position.y;
    }

    private updateH() {
        const isLeft = this._contentView.node.position.x < this.lastContentPosX;
        const childs = this._childrens;
        for (let i = 0; i < childs.length; ++i) {
            // if (childs.length <= 1) {
            //     break;
            // }
            const item = childs[i];
            const viewPos = this._getPositionInView(item);
            if (isLeft) {
                //如果item超过左边界 那么就移除
                if (viewPos.x + item.view.width / 2 < -this.halfScrollView) {
                    this._removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            } else {
                if (viewPos.x - item.view.width / 2 > this.halfScrollView) {
                    this._removeItem(item);
                    childs.splice(i, 1);
                    i--;
                }
            }
        }
        if (isLeft) {
            //创建下一个
            this._createNextItem();
        } else {
            //创建上一个
            this._createPreviousItem();
        }
        this.lastContentPosX = this._contentView.node.position.x;
    }

    //创建上一个
    private _createPreviousItem() {
        const firstItem = this._childrens[0];
        if (firstItem) {
            const index = firstItem.itemIndex - 1;
            if (index < 0) {
                return;
            }
            const item: CCRecycleHolder = this._createItem(index);
            if (this._inScreenByItem(item)) {
                this._contentView.node.addChild(item.node);
                this._childrens.unshift(item);
                this._createPreviousItem();
            }
        } else {
            let point = this._contentView.node.position.clone();
            point.y = -(point.y - this.halfScrollView);
            let index = this._pointToIndex(point);
            if (index < 0) {
                index = 0;
            }
            if (index >= this.adapter.getItemCount()) {
                index = this.adapter.getItemCount() - 1;
            }
            if (index >= 0 && index < this.adapter.getItemCount()) {
                const item: CCRecycleHolder = this._createItem(index);
                if (this._inScreenByItem(item)) {
                    this._contentView.node.addChild(item.node);
                    this._childrens.push(item);
                    this._createPreviousItem();
                }
            }
        }
    }

    //创建下一个
    private _createNextItem() {
        const lastItem = this._childrens[this._childrens.length - 1];
        if (lastItem) {
            const index = lastItem.itemIndex + 1;
            if (index >= this.adapter.getItemCount()) {
                return;
            }
            const item: CCRecycleHolder = this._createItem(index);
            if (this._inScreenByItem(item)) {
                this._contentView.node.addChild(item.node);
                this._childrens.push(item);
                this._createNextItem();
            }
        } else {
            //this.halfScrollView - point.y
            let point = this._getBoradPoint();
            let index = this._pointToIndex(point);
            if (index < 0) {
                index = 0;
            }
            if (index >= this.adapter.getItemCount()) {
                index = this.adapter.getItemCount() - 1;
            }
            if (index >= 0 && index < this.adapter.getItemCount()) {
                const item: CCRecycleHolder = this._createItem(index);
                if (this._inScreenByItem(item)) {
                    this._contentView.node.addChild(item.node);
                    this._childrens.push(item);
                    this._createNextItem();
                }
            }
        }
    }

    private _getBoradPoint(): Vec3 {
        const vec = this._contentView.node.position.clone();
        const type = this._layoutType;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            vec.y = this.halfScrollView - vec.y;
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            vec.x = -vec.x - this.halfScrollView;
        }
        return vec;
    }

    private getScreenLastIndex(): number {
        let point = this._contentView.node.position.clone();
        const type = this._layoutType;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            point.y = -(point.y + this.halfScrollView);
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            point.x = this.halfScrollView - point.x;
        }
        return this._pointToIndex(point);
    }

    private _refreshItems() {
        for (let i = 0; i < this._childrens.length; ++i) {
            this.adapter.onBindViewHolder(this._childrens[i], i);
        }
    }

    //坐标转index
    private _pointToIndex(point: Vec3): number {
        const count = this.adapter.getItemCount();
        const type = this._layoutType;
        const pdTop = this._paddingTop;
        const pdBottom = this._paddingBottom;
        const pdLeft = this._paddingLeft;
        const pdRight = this._paddingRight;
        const spaceX = this._spacingX;
        const spaceY = this._spacingY;
        let retIndex = -1;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            // let toatlY =
            let boardTop = (1 - this._contentView.anchorY) * this._contentView.height;
            let boardBottom = boardTop - pdTop;
            for (let i = 0; i < count; ++i) {
                const size = this.adapter.getSize(i);
                boardBottom -= size.height;
                if (point.y <= boardTop && point.y > boardBottom) {
                    retIndex = i;
                    break;
                }
                boardTop = boardBottom;
                boardBottom = boardBottom - spaceY;
            }
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            let boardLeft = -this._contentView.anchorX * this._contentView.width;
            let boardRight = boardLeft + pdLeft;
            for (let i = 0; i < count; ++i) {
                const size = this.adapter.getSize(i);
                boardRight += size.width;
                if (point.x >= boardLeft && point.x < boardRight) {
                    retIndex = i;
                    break;
                }
                boardLeft = boardRight;
                boardRight = boardRight + spaceX;
            }
        }
        return retIndex;
    }

    /**是否滚动容器 */
    private bScrolling: boolean = false;

    private times = 0;
    update() {
        if (this.bScrolling == false) {
            return;
        }
        //console.log('正在滚动');
        // if(this.times < 2){
        //     this.times += 1;
        //     return
        // }else{
        //     this.times = 0;
        // }
        this.bScrolling = false;
        this._footerUpdate();
        this.updateFun();
    }

    // lateUpdate(dt) {

    // }

    private _footerUpdate() {
        if (0 !== this.footerState || !this.footerEvents || !this.footerEvents.length) {
            return;
        }
        const footerOffset = this.footerOffset;
        const type = this._layoutType;
        if (Ccc_Ui_RecycleView_Type.VERTICAL === type) {
            const isUp = this._contentView.node.position.y > this.lastContentPosY;
            if (isUp) {
                const target =
                    this._contentView.height * this._contentView.anchorY -
                    this.halfScrollView -
                    footerOffset;
                if (this._contentView.node.position.y > target) {
                    this.footerState = 1;
                }
            }
        } else if (Ccc_Ui_RecycleView_Type.HORIZONTAL === type) {
            const isLeft = this._contentView.node.position.x < this.lastContentPosX;
            if (isLeft) {
                const target =
                    -this._contentView.width * (1 - this._contentView.anchorX) +
                    this.halfScrollView +
                    footerOffset;
                if (this._contentView.node.position.x < target) {
                    this.footerState = 1;
                }
            }
        }
        if (1 === this.footerState) {
            EventHandler.emitEvents(this.footerEvents, this);
        }
    }

    private _onScrolling(ev: Event = null) {
        this.bScrolling = true;
    }

    //清空页面
    private _reset() {
        this.gener?.return('');
        this._childrens?.forEach((v) => {
            this._removeItem(v);
        });
        this._childrens.length = 0;
    }

    static tag = 0;
    /**获取一个列表项 优先从内存池获取*/
    private getItem(type, index) {
        let child: CCRecycleHolder;
        let datas = this._pool.get(type);
        if (datas && datas.length) {
            child = datas.pop();
        } else {
            child = this.adapter.onCreateViewHolder(index);
        }
        if (this.itemClick) {
            child.node.on(Node.EventType.TOUCH_END, this.clickItem, this);
        }
        child.tag = CCCRecycleView.tag++;
        child.type = type;
        this.adapter.onBindViewHolder(child, index);
        return child;
    }

    //将节点放入内存池并删除
    private _removeItem(item: CCRecycleHolder) {
        if (!item) {
            return;
        }
        item.node.off(Node.EventType.TOUCH_END, this.clickItem, this);
        item.node.removeFromParent();
        let type = item.type;
        let datas = this._pool.get(type);
        if (!datas) {
            datas = new Array();
        }
        datas.push(item);
        this._pool.set(type, datas);
    }

    onDisable() {
        if (this.itemClick) {
            this._childrens?.forEach((v) => {
                v.node.off(Node.EventType.TOUCH_END, this.clickItem, this);
            });
        }
    }

    onEnable() {
        if (this.itemClick) {
            this._childrens?.forEach((v) => {
                v.node.on(Node.EventType.TOUCH_END, this.clickItem, this);
            });
        }
    }

    private clickItem(event) {
        const target = event.target;
        if (!target) {
            return;
        }

        let index = -1;
        for (let i = 0; i < this._childrens.length; ++i) {
            if (target.uuid === this._childrens[i].node.uuid) {
                index = this._childrens[i].itemIndex;
                break;
            }
        }
        if (index == -1) {
            return;
        }
        this.adapter.onClick(index);
    }

    /** 分帧加载 */
    private *getGeneratorLength(length: number, callback: Function, ...params: any): Generator {
        for (let i = 0; i < length; i++) {
            let result = callback(i, ...params);
            if (result) {
                yield;
            } else {
                return;
            }
        }
    }

    /** 分帧执行 */
    private exeGenerator(generator: Generator, duration: number) {
        return new Promise<void>((resolve, reject) => {
            let gen = generator;
            let execute = () => {
                let startTime = new Date().getTime();
                for (let iter = gen.next(); ; iter = gen.next()) {
                    if (iter == null || iter.done) {
                        resolve();
                        return;
                    }
                    if (new Date().getTime() - startTime > duration) {
                        setTimeout(() => execute(), game.deltaTime * 1000);
                        return;
                    }
                }
            };
            execute();
        });
    }

    onDestroy() {
        this.gener?.return('');
        this.gener = null;
        this.scrollView.node.off(ScrollView.EventType.SCROLLING, this._onScrolling, this);
        this._reset();

        for (let datas of this._pool) {
            const type = datas[0];
            const arr = datas[1];
            arr?.forEach((v) => {
                v.node.destroy();
                v = null;
            });
        }
        this._pool = null;
        this._childrens = null;
        this.updateFun = null;
        this.scrollView = null;
        this._contentView = null;
        this.footerState = null;
        this._adapter = null;
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
