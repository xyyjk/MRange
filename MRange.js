/*
 * MRange <https://github.com/xyyjk/MRange>
 * @author xyyjk
 * @license MIT
 */

$(function() {
  'use strict';

  /**
   * @class MRange
   * @param {selector} target 选择器
   * @param {Object}   option 参数配置
   */
  var MRange = function(target, option) {
    this.$target      = $(target);
    this.$input       = $('input[data-input]', this.$target);   // 对该元素实时设值
    this.$track       = $('[data-track]', this.$target);        // 滑动轨道
    this.$pointer     = $('[data-pointer]', this.$target);      // 滑动点（单点滑动）
    this.$pointerLow  = $('[data-pointer-low]', this.$target);  // 左侧滑动点
    this.$pointerHigh = $('[data-pointer-high]', this.$target); // 右侧滑动点
    this.$label       = $('[data-label]', this.$target);        // 滑动值（单点滑动）
    this.$labelLow    = $('[data-label-low]', this.$target);    // 左侧滑动值
    this.$labelHigh   = $('[data-label-high]', this.$target);   // 右侧滑动值

    this.option = $.extend({
      min: 0,
      max: 100,
      step: 1,
      value: 0
    }, option);

    this.isSingle = typeof (this.option.value) === 'number' ? true : this.option.value.indexOf(',') === -1;

    var min = this.option.min;
    var max = this.option.max;
    var step = this.option.step;
    var value = this.isSingle ? this.option.value : this.option.value.split(',');

    if (step > Math.abs(max - min) || min > max) {
      return;
    } else if (this.isSingle && (value > max || value < min)) {
      return;
    } else if (!this.isSingle) {
      var minVal = parseFloat(value[0]);
      var maxVal = parseFloat(value[1]);
      if (maxVal > max || minVal < min || minVal > maxVal) {
        return;
      }
    }

    this._EventHandle = $({});
    this.init();
  };

  MRange.prototype.on = function() {
    this._EventHandle.on.apply(this._EventHandle, arguments);
  };

  MRange.prototype.off = function() {
    this._EventHandle.off.apply(this._EventHandle, arguments);
  };

  MRange.prototype.trigger = function() {
    this._EventHandle.trigger.apply(this._EventHandle, arguments);
  };

  MRange.prototype.init = function() {
    this.eventHandle();
    this.setTrack();
  };

  MRange.prototype.setTrack = function(option) {
    // 支持重新设置 min, max, step, value
    this.option = $.extend(this.option, option);

    // 设置轨道长度|滑动点位置|滑动数值
    var min = this.option.min;
    var max = this.option.max;
    var value = this.isSingle ? this.option.value : this.option.value.split(',');
    var trackWidth = 0;

    if (this.isSingle) {
      trackWidth = Math.abs((value - min) / (max - min) * 100).toFixed(3) + '%';

      this.$pointer.css('left', trackWidth).addClass('activate');
      this.$label.html($.trim(value));
      this.$input.val($.trim(value));
    } else {
      trackWidth = Math.abs((value[1] - value[0]) / (max - min) * 100).toFixed(3) + '%';
      var pointerLeft = ((value[0] - min) / (max - min) * 100).toFixed(3) + '%';
      var pointerRight = parseFloat(trackWidth) + parseFloat(pointerLeft) + '%';

      this.$track.css('left', pointerLeft);
      this.$pointerLow.css('left', pointerLeft);
      this.$pointerHigh.css('left', pointerRight);
      this.$labelLow.html($.trim(value[0]));
      this.$labelHigh.html($.trim(value[1]));
      this.$input.val($.trim(value[0]) + ',' + $.trim(value[1]));

      // 智能选择滑动点
      if (parseFloat(pointerLeft) > 100 - parseFloat(pointerRight) || parseFloat(pointerLeft) === 100) {
        this.$pointerLow.addClass('activate');
        this.$pointerHigh.removeClass('activate');
      } else {
        this.$pointerLow.removeClass('activate');
        this.$pointerHigh.addClass('activate');
      }
    }

    this.$track.css('width', trackWidth);
  };

  MRange.prototype.getValue = function() {
    if (this.isSingle) {
      return this.$label.html();
    }
    return this.$labelLow.html() + ',' + this.$labelHigh.html();
  };

  MRange.prototype.eventHandle = function() {
    this.$pointer.on('mousedown.range touchstart.range', {
      type: ''
    }, $.proxy(_onDragStart, this));

    this.$pointerLow.on('mousedown.range touchstart.range', {
      type: 'low'
    }, $.proxy(_onDragStart, this));

    this.$pointerHigh.on('mousedown.range touchstart.range', {
      type: 'high'
    }, $.proxy(_onDragStart, this));
  };

  MRange.prototype.destroy = function() {
    $(document).off('.range');
    this.$pointer.off('.range');
    this.$pointerLow.off('.range');
    this.$pointerHigh.off('.range');
  };

  MRange.prototype.reset = function() {
    this.destroy();
    this.init();
  };

  MRange.version = '1.0.0';

  function _onDragStart(evt) {
    var rangeVal = this.isSingle ? this.$label.html() : this.$labelLow.html() + ',' + this.$labelHigh.html();
    this.trigger('dragstart', {value: rangeVal});

    evt.preventDefault();
    evt.stopPropagation();

    $(evt.target).addClass('activate').siblings('.pointer').removeClass('activate');

    this.$track.addClass('activate');
    if (this.isSingle) {
      this.$label.addClass('activate');
    } else if (evt.data.type === 'low') {
      this.$labelLow.addClass('activate');
      this.$labelHigh.removeClass('activate');
    } else if (evt.data.type === 'high') {
      this.$labelLow.removeClass('activate');
      this.$labelHigh.addClass('activate');
    }

    var targetRect = this.$target.offset();

    $(document).on('mousemove.range touchmove.range', {
      type: evt.data.type, // 滑动点类型
      rect: targetRect,    // range详细位置
      offset: {            // 滑动点详细
        lowRect: this.$pointerLow.offset(),
        highRect: this.$pointerHigh.offset(),
        low: parseFloat(this.$pointerLow.css('left')),  // 滑动点`low`位置
        high: parseFloat(this.$pointerHigh.css('left')) // 滑动点`high`位置
      }
    }, $.proxy(_onDragMove, this));

    $(document).on('mouseup.range touchend.range touchcancel.range', $.proxy(_onDragEnd, this));
  }

  function _onDragMove(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    var moveBase      = evt.data.rect.left;  // 滑动起点
    var maxWidth      = evt.data.rect.width; // 距离总长度
    var pointerType   = evt.data.type;       // 滑动类型
    var pointerOffset = evt.data.offset;     // 滑动点详细
    var curWidth      = _getEventAttr(evt, 'clientX') - moveBase; // 当前滑动距离
    curWidth = curWidth < 0 ? 0 : (curWidth > maxWidth ? maxWidth : curWidth);
    var $pointer    = null; // 滑动的点
    var $label      = null; // 滑动数值
    var trackWidth  = 0;    // 轨道长度
    var pointerLeft = (curWidth / maxWidth * 100).toFixed(3) + '%'; // 当前滑动点位置
    var labelValue  = _getLabelValue(curWidth, maxWidth, this.option.min, this.option.max, this.option.step);

    if (this.isSingle) { // 单点滑动
      trackWidth = pointerLeft;
      $pointer = this.$pointer;
      $label = this.$label;
      this.$input.val(labelValue);
    } else if (pointerType === 'low') { // 多点滑动`左`
      if (parseFloat(pointerLeft) >= pointerOffset.high) {
        trackWidth = 0;
        pointerLeft = pointerOffset.high + '%';
        labelValue = this.$labelHigh.html();
      } else {
        var pointerHighRect = pointerOffset.highRect;
        curWidth = pointerHighRect.left - moveBase - curWidth + pointerHighRect.width * 0.5;
        trackWidth = (curWidth / maxWidth * 100).toFixed(3) + '%';
      }
      $pointer = this.$pointerLow;
      $label = this.$labelLow;
      this.$track.css('left', pointerLeft);
    } else if (pointerType === 'high') { // 多点滑动`右`
      if (parseFloat(pointerLeft) <= pointerOffset.low) {
        trackWidth = 0;
        pointerLeft = pointerOffset.low + '%';
        labelValue = this.$labelLow.html();
      } else {
        var pointerLowRect = pointerOffset.lowRect;
        curWidth = curWidth - (pointerLowRect.left - moveBase) - pointerLowRect.width * 0.5;
        trackWidth = (curWidth / maxWidth * 100).toFixed(3) + '%';
      }
      $pointer = this.$pointerHigh;
      $label = this.$labelHigh;
    }

    if (!this.isSingle) {
      this.$input.val(this.$labelLow.html() + ',' + this.$labelHigh.html());
    }

    var rangeVal = this.isSingle ? this.$label.html() : this.$labelLow.html() + ',' + this.$labelHigh.html();
    this.trigger('dragmove', {value: rangeVal});

    // 设置轨道长度|滑动点位置|滑动数值
    this.$track.css('width', trackWidth);
    $pointer.css('left', pointerLeft);
    $label.html(labelValue);
  }

  function _onDragEnd(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    $(document).off('.range');

    var rangeVal = this.isSingle ? this.$label.html() : this.$labelLow.html() + ',' + this.$labelHigh.html();
    this.trigger('dragend', {value: rangeVal});

    this.$track.removeClass('activate');
    this.$label.removeClass('activate');
    this.$labelLow.removeClass('activate');
    this.$labelHigh.removeClass('activate');
  }

  /**
   * 获取事件属性值
   * @param {Object} evt 事件对象
   * @param {string} attr 事件属性
   * @return {number}
   */
  function _getEventAttr(evt, attr) {
    var eventAttr = evt[attr];

    if (eventAttr) { return eventAttr; } // PC

    if (evt.targetTouches && evt.targetTouches.length) { // Zepto
      return evt.targetTouches[0][attr];
    } else if (evt.changedTouches && evt.changedTouches.length) {
      return evt.changedTouches[0][attr];
    }
  }

  /**
   * 获取滑动数值
   * @param {number} curWidth 当前滑动距离(px)
   * @param {number} maxWidth 距离总长度(px)
   * @param {number} minVal   起点的数值
   * @param {number} maxVal   终点的数值
   * @param {number} stepVal  数值的间隔
   * @return {number}
   */
  function _getLabelValue(curWidth, maxWidth, minVal, maxVal, stepVal) {
    // 滑过的长度包含多少个段落（一个setp等于一个小段落）
    var curStep = Number(curWidth).div(Number(maxWidth).div(Number(maxVal).sub(minVal))).div(stepVal);

    // 总的长度包含多少个段落（一个setp等于一个小段落）
    var allStep = Number(maxVal).sub(minVal).div(stepVal);
    var number = 0;

    // 当滑过的长度在整数段落范围内，直接通过四舍五入来判断属于哪一侧段落点
    if (Math.floor(curStep) < Math.floor(allStep)) {
      number = Number(Math.round(curStep)).mul(stepVal).add(parseFloat(minVal));
    } else if (Number(curStep).sub(Math.floor(curStep)) > Number(allStep).sub(Math.floor(allStep)).mul(0.5)) {
      // 当滑过的整数段落与总长度的整数段落相等时，即进入不被step整除的尾部，通过建立中点值进行比较，判断属于哪一侧的段落点
      number = maxVal;
    } else {
      number = Number(Math.floor(allStep)).mul(stepVal).add(parseFloat(minVal));
    }

    return number;
  }

  window.ahm = window.ahm || {};
  window.ahm.range = window.ahm.range || {};
  $('[data-role="range"]').each(function() {
    var targetData = this.dataset;
    window.ahm.range[targetData.name] = new MRange(this, {
      min: targetData.min,
      max: targetData.max,
      step: targetData.step,
      value: targetData.value
    });
  });


  Math.add = function(num1, num2) {
    var r1;
    var r2;
    var m;
    try {
      r1 = num1.toString().split('.')[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = num2.toString().split('.')[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));

    return (num1 * m + num2 * m) / m;
  };

  Number.prototype.add = function(num) {
    return Math.add(num, this);
  };

  Math.sub = function(num1, num2) {
    return Math.add(num1, -num2);
  };

  Number.prototype.sub = function(num) {
    return Math.sub(this, num);
  };

  Math.mul = function(num1, num2) {
    var m = 0;
    var s1 = num1.toString();
    var s2 = num2.toString();
    try {
      m += s1.split('.')[1].length;
    } catch (e) {}
    try {
      m += s2.split('.')[1].length;
    } catch (e) {}

    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
  };

  Number.prototype.mul = function(num) {
    return Math.mul(num, this);
  };

  Math.div = function(num1, num2) {
    var t1 = 0;
    var t2 = 0;
    var r1;
    var r2;
    try {
      t1 = num1.toString().split('.')[1].length;
    } catch (e) {}
    try {
      t2 = num2.toString().split('.')[1].length;
    } catch (e) {}

    r1 = Number(num1.toString().replace('.', ''));
    r2 = Number(num2.toString().replace('.', ''));
    return (r1 / r2) * Math.pow(10, t2 - t1);
  };

  Number.prototype.div = function(num) {
    return Math.div(this, num);
  };

});
