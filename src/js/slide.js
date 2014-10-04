/*!
 * Slide
 * 自用简易版演示文稿组件
 * @require jquery
 * @require animate.css
 * Copyright(c) 2013 Daniel Yang <miniflycn@gmail.com>
 * MIT Licensed
 */
!function (root, $) {
	'use strict';

	var slideMap = {}, index = -1, step = -1, turnTimeout;

	var _index = -1, _step = 0;

	$(window).on('hashchange', _check);

	var callback = {
		list: [],
		isRun: false,
		push: function (foo) {
			var self = this;
			self.list.push(foo);
			!self.isRun && (self.isRun = true) && self._run();
		},
		_run: function () {
			var foo = this.list.pop(),
				self = this;
			if (foo) {
				foo(function () {
					self._run();
				});
			} else {
				self.isRun = false;
			}
		}
	};

	function _isdefine(o) {
		return o !== undefined;
	}

	function _check(e) {
		var hash = location.hash.replace(/^\#\!\//, '').split('/'),
			oldIndex = index,
			oldStep = step;
		if (!hash[0] || !hash[1]) return location.hash = '#!/0/0';
		index = +hash[0];
		step = +hash[1];
		if (index !== oldIndex && typeof index === 'number' && typeof oldIndex === 'number') {
			callback.push(_makeFlip(index, oldIndex));
			oldStep = -1;
		}
		return _turn(index, oldStep, step, 0);
	}

	function _makeFlip(index, oldIndex) {
		return function (cb) {
			var $oldSlide = $('[data-slide="' + oldIndex + '"]'),
				$newSlide = $('[data-slide="' + index + '"]');
			if (index < oldIndex) {
				$oldSlide.removeClass('in').addClass('right');
				setTimeout(function () {
					$oldSlide.removeClass('show right');
					cb();
				}, 1000);

				$newSlide.addClass('show left');
				setTimeout(function () {
					$newSlide.removeClass('left').addClass('in show');
				}, 100);
			} else {
				$oldSlide.removeClass('in').addClass('left');
				setTimeout(function () {
					$oldSlide.removeClass('show left');
					cb();
				}, 1000);

				$newSlide.addClass('show right');
				setTimeout(function () {
					$newSlide.removeClass('right').addClass('in show');
				}, 100);
			}
		}
	}

	function _turn(index, now, until, timeout) {
		if (now === until) return;
		var stepMap = slideMap[index], stepAction;
		if (now > until) {
			(stepAction = stepMap[now--]) && stepAction[1] && stepAction[1]();
		} else {
			(stepAction = stepMap[++now]) && stepAction[0] && stepAction[0]();
		}
		clearTimeout(turnTimeout);
		if (timeout) {
			turnTimeout = setTimeout(function () {
				_turn(index, now, until, timeout);
			}, timeout);
		} else {
			_turn(index, now, until, timeout);
		}
	}

	function _left() {
		step - 1 < 0 ?
			(location.hash = '#!/' + (index - 1) + '/' + slideMap[index - 1].max) :
			(location.hash = '#!/' + index + '/' + (step - 1));
	}

	function _right() {
		step + 1 > slideMap[index].max ?
			(location.hash = '#!/' + (index + 1) + '/0') :
			(location.hash = '#!/' + index + '/' + (step + 1));
	}

	function _loadSlide() {
		$('[data-slide]').each(function (i, ele) {
			ele = $(ele);
			i = +ele.data('slide');
			// init slide
			slideMap[i] = slideMap[i] || { max: 0 };
			// load step
			_index = i;
			_step = slideMap[i].max;
			ele.find('[data-animate]').each(function (j, e) {
				var e = $(e),
					animate = e.data('animate') + ' animated';
				steps(function () {
					e.removeClass('hide').addClass(animate);
				}, function () {
					e.removeClass(animate).addClass('hide');
				});
			});
		});
	}

	function _init() {
		_loadSlide();
		_check();
		$(window).on('keyup', function (e) {
			e.which === 37 && _left();
			e.which === 39 && _right();
		});

		$(document.body).on('touchstart', _startEvtHandler)
						.on('touchmove', _moveEvtHandler)
						.on('touchend', _endEvtHandler)
	}

	function _getTouchPos(e) {
		var t = e.originalEvent.touches[0];
		return { x: t.clientX, y: t.clientY };
	}

	var _startPos, _curPos, _endPos;
	function _startEvtHandler(e) {
		_startPos = _getTouchPos(e);
	}

	function _moveEvtHandler(e) {
		e.preventDefault();
		_curPos = _getTouchPos(e);
	}

	function _endEvtHandler(e) {
		_endPos = _curPos;
		var dx = _endPos.x - _startPos.y,
			dy = -_endPos.y + _startPos.y,
			angle = Math.atan2(dy, dx) * 180 / Math.PI;
		if (angle < 45 && angle > -45) return _left();
		if (angle >= 135 || angle < -135) return _right();
	}

	function init() {
		setTimeout(_init, 0);
		return this;
	}

	function slide() {
		slideMap[++_index] = { max: 0 };
		_step = 0;
		return this;
	}

	function steps(show, hide) {
		var stepMap = slideMap[_index];
		stepMap[++_step] = [show, hide];
		_step > stepMap.max && (stepMap.max = _step);
		return this;
	}

	root.Slide = {
		init: init,
		slide: slide,
		step: steps
	}

}(window, jQuery);