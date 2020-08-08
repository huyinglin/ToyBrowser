const css = require('css');

// 加入一个新的函数，addCSSRules，这里我们把CSS规则暂存到一个数组里
let rules = [];
// [{
//   type: 'rule',
//   selectors: [ 'body div #myid' ],
//   declarations: [
//     [{
//         type: 'declaration',
//         property: 'width',
//         value: '100px',
//         position: [Object]
//     }, {
//         type: 'declaration',
//         property: 'background-color',
//         value: '#ff5000',
//         position: [Object],
//     }]],
//   type: 'rule',
//   selectors: [ 'body div img' ],
//   declarations: [ [Object], [Object] ],
//   position: Position { start: [Object], end: [Object], source: undefined }
// }]

function addCSSRules(text) {
  const ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
  // element:
  // {
  //   type: 'element',
  //   tagName: 'img',
  //   children: [],
  //   attributes: [ { name: 'isSelfClosing', value: true } ],
  //   computedStyle: {}
  // }
  // selector: 'img'

  if (!selector || !element.attributes) {
    return false;
  }
  if (selector.charAt(0) === '#') {
    const attr = element.attributes.filter(attr => attr.name === 'id')[0];
    if (attr && attr.value === selector.replace('#', '')) {
      return true;
    }
  } else if (selector.charAt(0) === '.') {
    const attr = element.attributes.filter(attr => attr.name === 'class')[0];
    if (attr && typeof attr.value === 'string') {
      // 实现支持空格的class选择器
      const classList = attr.value.split(' ');
      if (classList.includes(selector.replace('.', ''))) {
        return true;
      }
    }
    // if (attr && attr.value === selector.replace('.', '')) {
    //   return true;
    // }
  } else if (element.tagName === selector) {
    return true;
  }
  return false;
}

function specificity(selector) {
  // p[0]: inline
  // p[1]: id
  // p[2]: class
  // p[3]: tagName
  let p = [0, 0, 0, 0];
  const selectorParts = selector.split(' ');
  for (let part of selectorParts) {
    if (part.charAt(0) === '#') {
      p[1] += 1;
    } else if (part.charAt(0) === '.') {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compara(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2];
  }
  return sp1[3] - sp2[3];
}

function computeCSS(element, stack) {
  const elements = stack.slice().reverse();

  if (!element.computedStyle) {
    // 给element增加computedStyle属性
    element.computedStyle = {};
  }

  for (let rule of rules) {
    // rule:
    // { type: 'rule',
    //   selectors: [ 'body div img' ],
    //   declarations: [{
    //       type: 'declaration',
    //       property: 'width',
    //       value: '30px',
    //       position: [Object]
    //     }, {
    //       type: 'declaration',
    //       property: 'background-color',
    //       value: '#ff1111',
    //       position: [Object]
    //   }],
    //   position: [Object]
    // }

    const selectorParts = rule.selectors[0].split(' ').reverse(); // reverse的原因是，css选择器是右向左逐个匹配
    if (!match(element, selectorParts[0])) {
      // 不匹配则跳出
      continue;
    }

    let matched = false;
    let j = 1;
    for (let i = 0; i < elements.length; i++) {
      // 逐个匹配
      if (match(elements[i], selectorParts[j])) {
        j++;
      }
    }
    if (j >= selectorParts.length) {
      matched = true;
    }
    if (matched) {
      const sp = specificity(rule.selectors[0]);
      const computedStyle = element.computedStyle;
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};
        }
        if (
          !computedStyle[declaration.property].specificity ||
          compara(computedStyle[declaration.property].specificity, sp) < 0
        ) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
    }
  }
}


module.exports = {
  addCSSRules,
  computeCSS,
};
