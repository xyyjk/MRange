# MRange
[MRange](https://github.com/xyyjk/MRange) 是一个基于 `Zepto.js` 的滑动选取数值范围组件

## 使用

通过添加自定义属性 `data-role="range"` 来进行实例初始化，HTML 结构参照如下示例：

### 单点滑动：

``` html
<div class="input-range"
  data-role="range"
  data-min="-11.5"
  data-max="3"
  data-step="2.6"
  data-value="-2"
  data-name="testing1"
>
  <input type="hidden" data-input>
  <div class="track" data-track></div>
  <div class="pointer" data-pointer></div>
  <div class="label" data-label></div>
</div>
```

- data-input: 对 `input` 元素设置该属性可在滑动时实时改变值
- data-track: 滑动轨道
- data-pointer: 滑动点
- data-label: 滑动值显示

### 多点滑动：

``` html
<div class="input-range"
  data-role="range"
  data-min="-13"
  data-max="2"
  data-step="2"
  data-value="-9, -3"
  data-name="testing2"
>
  <input type="hidden" data-input>
  <div class="track" data-track></div>
  <div class="pointer pointer--low" data-pointer-low></div>
  <div class="pointer pointer--high" data-pointer-high></div>
  <div class="label label--low" data-label-low></div>
  <div class="label label--high" data-label-high></div>
</div>
```

- data-input: 对 `input` 元素设置该属性可在滑动时实时改变值
- data-track: 滑动轨道
- data-pointer-low: 左侧滑动点
- data-pointer-high: 右侧滑动点
- data-label-low: 左侧滑动值
- data-label-high: 右侧滑动值

### 事件监听示例：

``` javascript

window.ahm.range.testing1.on('dragstart', function(e) {
  // e._args.value 当前值
  console.log('dragstart, value:', e._args.value);
});

window.ahm.range.testing1.on('dragmove', function(e) {
  console.log('dragmove, value:', e._args.value);
});

window.ahm.range.testing1.on('dragend', function(e) {
  console.log('dragend, value:', e._args.value);
});
```

### 事件移除示例：

``` javascript

window.ahm.range.testing2.on('dragmove', function(e) {
  console.log('dragmove, value:', e._args.value);
  if (e._args.value === '-13,2') {
    window.ahm.range.testing2.off('dragmove');
  }
});
```

## 选项

- data-min: `{number}` - [可选] 规定允许的最小值，默认 0（小于或等于最大值）
- data-max: `{number}` - [可选] 规定允许的最大值，默认 100（大于或等于最小值）
- data-step: `{number}` - [可选] 规定合法数字间隔，默认 1（如果 step="3"，则合法的数字是 -3,0,3,6, 以此类推）
- data-value: `{number|Array}` - [必选] 规定默认值，*`number`* 为单点滑动，*`number`* 为多点滑动（处于最小值与最大值之间）
- data-name: `{string}` - [可选] 设定 *`range`* 名称，可通过 *`window.ahm.range[name]`* 来调用实例方法或监听事件

## 方法

- setTrack(option): `{min, max, step, value}` - 设置轨道位置
- getValue(): - 获取当前值
- destroy(): - 移除滑动选值
- reset(): - 重新初始化

## 事件

- `dragstart` - window.ahm.range[name].on('dragstart', function(e) { ... }
- `dragmove` - window.ahm.range[name].on('dragmove', function(e) { ... }
- `dragend` - window.ahm.range[name].on('dragend', function(e) { ... }

## 更新日志
要查看最近更新的明细，请参见 [Releases section](https://github.com/xyyjk/MRange/releases)。

## 许可

[MIT LICENSE](http://opensource.org/licenses/MIT)