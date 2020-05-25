function getStyle(element) {
  if (!element.style) {
    element.style = {};

    for (let prop in element.computedStyle) {
      const p = element.computedStyle.value;
      element.style[prop] = element.computedStyle[prop].value;

      if (element.style[prop].toString().match(/px$/)) {
        element.style[prop] = parseInt(element.style([prop]));
      }
      if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
        element.style[prop] = parseInt(element.style[prop]);
      }
    }

    return element.style;
  }
}

function layout(element) {
  if (!element.computedStyle) {
    return;
  }

  let elementStyle = getStyle(element);

  if (elementStyle.display !== 'flex') {
    // 忽略非flex布局元素
    return;
  }

  let items = element.children.filter(e => e.type === 'element'); // 过滤非element的子元素

  // ? order从哪来的？为什么要排序？
  items.sort((a, b) => (a.order || 0) - (b.order || 0));

  let style = elementStyle;

  ['width', 'height'].forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    };
  });

  // initialization
  if (!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row';
  }
  if (!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch';
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start';
  }
  if (!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap';
  }
  if (!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch';
  }

  let mainSize;
  let mainStart;
  let mainEnd;
  let mainSign;
  let mainBase;
  let crossSize;
  let crossStart;
  let crossEnd;
  let crossSign;
  let crossBase;

  /**
   * flex-direction: 决定主轴的方向
   * @Syntax row | row-reverse | column | column-reverse
   *
   */

  if (style.flexDirection === 'row') {
    // 默认值
    // 主轴为水平方向，起点在左端

    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1; // 技巧，当需要用变量来表示正负号的时候，可以用 +1 -1。好处是它可以直接参与乘除运算
    mainBase = 0;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }
  if (style.flexDirection === 'row-reverse') {
    // 主轴为水平方向，起点在右端
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = style.width;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }
  if (style.flexDirection === 'column') {
    // 主轴为垂直方向，起点在上沿
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }
  if (style.flexDirection === 'column-reverse') {
    // 主轴为垂直方向，起点在下沿
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;
    mainBase = style.height;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  /**
   * flex-wrap: 默认情况下，项目都排在一条线（又称"轴线"）上。如果一条轴线排不下，如何换行。
   * @syntax nowrap | wrap | wrap-reverse
   */
  if (style.flexWrap === 'wrap-reverse') {
    // 换行，第一行在下方

    const tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    // nowrap（默认）: 不换行
    // wrap: 换行，第一行在上方

    crossBase = 0;
    crossSign = 1;
  }

  let isAutoMainSize = false;
  // 处理外面容器，没有主轴宽度的情况
  if (!style[mainSize]) {
    // auto sizing
    // 如果父元素没有width，就撑开，取子元素的minSize和
    elementStyle[mainSize] = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (itemStyle)
    }
  }

}
