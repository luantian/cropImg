/*
 * @Author: Terence 
 * @Date: 2018-06-05 16:54:41 
 * @Last Modified by:   Terence
 * @Last Modified time: 2019-09-03 16:21:37
 */

/**
 * 
 * @param {Dom} container 		最外层DOM
 * @param {Function} output 	裁剪完成的回调函数 返回 裁剪后的图片数据base64和blob
 * @param {String}	type		输出图片类型，默认jpg
 * @param {Number}	rotate		初始化图片旋转的角度[0, 1, 2, 3]
 * @param {String}	image_src	加载图片的地址
 * @param {Number}  cover_width 裁剪框初始化宽度
 * @param {Number}  cover_height裁剪框初始化高度
 * 
 */

;(function(){
	var $_$Crop = function (option) {
		return new Crop(option);
	};

	
	var Crop = function(option) {
		/**
		 * 参数变量
		 */
		this.renderTo = option.container;
		this.renderTo.innerHTML = '';
		this.output = option.output;
		this.type = option.type || "jpeg";
		this.image_src = option.image_src;
        this.compression = .8;

		/**
		 * @var {Number}  width  文档的宽
		 * @var {Number}  height  文档的高
		 * @var {Number}  cover_width 裁剪框的宽
		 * @var {Number}  cover_height 裁剪框的宽
		 * @var {Number}  scalebtnWrap_width  缩放按钮外层的宽
		 */
		this.doc = document;
		this.width = this.renderTo.offsetWidth;
		this.height = this.renderTo.offsetHeight;
		this.cover_width = this.min150(parseInt(option.cover_width)) || this.width * 0.5;
		this.cover_height = this.min150(parseInt(option.cover_height)) || this.height * 0.5;
		this.scalebtnWrap_width = 258;
		this.timer = null;

		/**
		 * @var {Number} scale 图片的缩放比例值
		 * @var {Number} canvasScale  canvas的缩放比例值
		 * @var {Number} rotateNum  传入的旋转角度的参数，默认为0
		 * @var {Number} rotate rotateNum * 90
		 * @var {Boolean} onOffRatate 旋转按钮的开关
		 * @var {Boolean} isCrop 图片是否经过裁剪
		 */
		this.scale = 1;
		this.canvasScale = 1;
		this.rotateNum = option.rotate || 0;
		this.rotate = this.rotateNum * 90;
		this.onOffRatate = true;
		this.isCrop = false;
		
		/**
		 * 生成相应DOM元素  开始
		 * @var {DOM} cover	裁剪框
		 * @var {DOM} croppingBox 裁剪盒子（裁剪框的父级）
		 */
		this.canvas = this.doc.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.cover = this.doc.createElement("div");
		this.toolbar = this.doc.createElement("div");
		this.croppingBox = this.doc.createElement("div");
		
		this.img = this.doc.createElement("img");
		this.cropbtn = this.doc.createElement("i");
		this.rotatebtn = this.doc.createElement("i");
		this.confirmbtn = this.doc.createElement("i");
		this.scalebar = this.doc.createElement('div');
		this.scalebtnWrap = this.doc.createElement('div');
		this.scalebtn = this.doc.createElement('div');
		this.scaleup = this.doc.createElement("i");
		this.scaledown = this.doc.createElement("i");

		this.operabar = this.doc.createElement('div');
		this.cancel = this.doc.createElement('div');
		this.save = this.doc.createElement('div');
		/**
		 * 生成相应DOM元素  结束
		 */

		/**
		 * @var {Array} drags 定义上下左右...八个方向的按钮名字
		 * @var {Number} drag_width 定义每个drag 元素的宽
		 * @var {Number} drag_height  定义每个drag 元素的高
		 * @var {Number} border_width 定义cover元素边框的宽度
		 */
		this.drags = ['lt', 'ct', 'rt', 'lc', 'rc', 'lb', 'cb', 'rb'];
		
		this.drag_width = 50;
		this.drag_height = 50;
		this.border_width = 1;
		
		/**
		 * 向cover元素插入drag元素节点
		 */
		for (var i = 0; i < this.drags.length; i++) {
			this[this.drags[i]] = this.doc.createElement('div');
			this[this.drags[i]].setAttribute('LTcrop_id', this.drags[i]);
			this.cover.appendChild(this[this.drags[i]]);
		}
		/**
		 * 向container元素插入相应元素节点
		 */
		
		this.img.setAttribute('LTcrop_id', 'img');
		this.croppingBox.appendChild(this.img);
		this.cover.setAttribute('LTcrop_id', 'cover');
		this.croppingBox.appendChild(this.cover);
		this.toolbar.setAttribute('LTcrop_id', 'toolbar');
		this.croppingBox.appendChild(this.toolbar);
		this.operabar.setAttribute('LTcrop_id', 'operabar');
		this.croppingBox.appendChild(this.operabar);
		this.scalebar.setAttribute('LTcrop_id', 'scalebar');
		this.croppingBox.appendChild(this.scalebar);
		this.croppingBox.setAttribute('LTcrop_id', 'croppingBox');
		this.cropbtn.setAttribute('LTcrop_id', 'cropbtn');
		this.rotatebtn.setAttribute('LTcrop_id', 'rotatebtn');
		this.confirmbtn.setAttribute('LTcrop_id', 'confirmbtn');
		this.cropbtn.setAttribute('class', 'icon icon-bianjitupian');
		this.rotatebtn.setAttribute('class', 'icon icon-redo');
		
		this.toolbar.appendChild(this.cropbtn);
		this.toolbar.appendChild(this.rotatebtn);
		this.toolbar.appendChild(this.confirmbtn);
		this.scalebar.setAttribute('LTcrop_id', 'scalebar');
		this.scaleup.setAttribute('LTcrop_id', 'scaleup');
		this.scaledown.setAttribute('LTcrop_id', 'scaledown');
		this.scalebtnWrap.setAttribute('LTcrop_id', 'scalebtnWrap');
		this.scalebtn.setAttribute('LTcrop_id', 'scalebtn');
		this.scaleup.setAttribute('class', 'icon icon-zoom_in');
		this.scaledown.setAttribute('class', 'icon icon-zoom_out');
		this.scalebar.appendChild(this.scaleup);
		this.scalebar.appendChild(this.scaledown);
		this.scalebar.appendChild(this.scalebtnWrap);
		this.scalebtnWrap.appendChild(this.scalebtn);
		this.save.setAttribute('LTcrop_id', 'save');
		this.cancel.setAttribute('LTcrop_id', 'cancel');
		this.operabar.appendChild(this.cancel);
		this.operabar.appendChild(this.save);
		this.croppingBox.appendChild(this.canvas);
		this.renderTo.appendChild(this.croppingBox);

		this.cropbtn.innerHTML = '裁剪';
		this.rotatebtn.innerHTML = '旋转';
		this.confirmbtn.innerHTML = '确定';
		this.save.innerHTML = '保存';
		this.cancel.innerHTML = '取消';

		this.img.src = this.image_src;

		var This = this;
		this.img.onload = function() {
			This.init();
		}

	}

	Crop.prototype.init = function() {
		var This = this;

		/**
		 * 关闭所有拖拽功能
		 */
		this.coverFlag = false;
		this.imgFlag = false;
		this.angleFlag = false;
		this.scaleFlag = false;
		this.img_width = this.img.width;
		this.img_height = this.img.height;

		
		/**
		 * 给元素设置样式
		 */
		this.setStyle();
		/**
		 * 设置拖拽的八个按钮
		 */
		this.setPoints();

		/**
		 * @var {Number}  init_max_width  设置
		 */
		var init_max_width = this.width * 0.7;
		var init_max_height = this.height - this.scalebar.offsetHeight - this.toolbar.offsetHeight - 50;

		var scale = 1;
		if (this.img_width > this.img_height && this.img_width > init_max_width) {
			scale = init_max_width / this.img_width;
		}
		if (this.img_width < this.img_height && this.img_height > init_max_height) {
			scale = init_max_height / this.img_height;
		}
		this.initScale = scale;
		this.scale = scale;  //(0, 2)
		
		this.setImgScale(this.scale);
		This.isScaleMoved = true;
		for (var i = 0; i < this.scalePoints.length; i++) {
			if (this.scalePoints[i] >= this.scalebtn.offsetLeft) {
				this.pointNum = i;
				break;
			}
		}
		
		if(this.image_src.substring(0,4).toLowerCase()==='http') {
			this.img.crossOrigin = 'Anonymous';
		}

		/**
		 * 取消拖拽选中的默认事件
		 */
		this.renderTo.onselectstart = function () {
			return false;
		}
		
		/**
		 * 绑定拖拽所需要的事件
		 */

		this.renderTo.onmousedown = function(ev) {
			This.down.call(This, ev);
		}
		this.renderTo.onmousemove = function(ev) {
			This.move.call(This, ev);
		}
		this.renderTo.onmouseup = function(ev) {
			This.up.call(This, ev);
		}
		this.img.onmousewheel = function(ev) {
			This.onMouseWheel.call(This, ev);
		}

		this.canvas.onmousewheel = function(ev) {
			This.onMouseWheel.call(This, ev);
		}
	}

	Crop.prototype.down = function(ev) {
		ev.preventDefault();
		var target = ev.target;
		var crop_id = target.getAttribute('LTcrop_id');
		switch(crop_id) {
			case 'cover':
				this.downCover(ev);
			break;
			case 'img':
				this.downImg(ev);
			break;
			case 'scalebtn':
				this.downScalebtn(ev);
			break;
			case 'cropbtn':
				this.downCropbtn(ev);
			break;
			case 'rotatebtn':
				this.downRotatebtn(ev);
			break;
			case 'confirmbtn':
				this.downConfirmbtn(ev);
			break;
			case 'cancel':
				this.downCancel(ev);
			break;
			case 'save':
				this.downSave(ev);
			break;
			case 'scaledown':
				this.downScaleDown(ev);
			break;
			case 'scaleup':
				this.downScaleUp(ev);
			break;
		}

		document.addEventListener("mousemove", this.move, true);

		if (this.drags.indexOf(crop_id) >= 0) {
			this.dragAngleDom = target;
			this.angleFlag = true;
			/**
			 * @var {Number} disX 鼠标点击位置到点击元素 左侧 距离
			 * @var {Number} disY 鼠标点击位置到点击元素 顶部 距离
			 * @var {Number} w cover右边到屏幕左边的距离
			 * @var {Number} h cover下边到屏幕上边的距离
			 */
			this.disX = ev.clientX - this.cover.offsetLeft;
			this.disY = ev.clientY - this.cover.offsetTop;
			this.w = this.cover.offsetLeft + this.cover.offsetWidth;
			this.h = this.cover.offsetTop + this.cover.offsetHeight;
		}
		
	}

	Crop.prototype.move = function(ev) {
		ev.preventDefault();
		var This = this;
		if (this.imgFlag) return this.drag(ev, this.img);
		if (this.coverFlag) return this.drag(ev, this.cover, this.renderTo);
		if (this.angleFlag) return this.dragAngle(ev, this.dragAngleDom);
		if (this.scaleFlag) return this.drag(ev, this.scalebtn, this.scalebtnWrap, 'h', function() {
			This.isScaleMoved = true;
			This.setImgScale();
		});
	}

	Crop.prototype.up = function(ev) {
		ev.preventDefault();
		this.coverFlag = false;
		this.imgFlag = false;
		this.angleFlag = false;

		if (this.scaleFlag) {
			for (var i = 0; i < this.scalePoints.length; i++) {
				if (this.scalePoints[i] >= this.scalebtn.offsetLeft) {
					this.pointNum = i;
					break;
				}
			}
		}
		document.removeEventListener("mousemove", this.move, true);
		this.scaleFlag = false;
	}

	/**
	 * 
	 * @param {Event} ev 事件对象
	 * @param {DOM} target 拖拽的目标元素
	 * @param {DOM} relato 拖拽的相对元素
	 * @param {String} orient h || v 拖拽的方向
	 * @param {Function} cb 拖拽中的回调函数
	 */
	Crop.prototype.drag = function(ev, target, relato, orient, cb) {
		var left = ev.clientX - this.disX;
		var top = ev.clientY - this.disY;

		if (relato) {
			if (left < 0) {
				left = 0;
			} else if (left > relato.offsetWidth - target.offsetWidth) {
				left = relato.offsetWidth - target.offsetWidth;
			}
			if (top < 0) {
				top = 0;
			} else if (top > relato.offsetHeight - target.offsetHeight) {
				top = relato.offsetHeight - target.offsetHeight;
			}
		}

		switch(orient) {
			case 'h':
				this._css(target, {
					left: left + 'px'
				});
			break;
			case 'v':
				this._css(target, {
					top: top + 'px'
				});
			break;
			default:
				this._css(target, {
					left: left + 'px',
					top: top + 'px'
				});
		}
		cb && cb();
	}

	Crop.prototype.dragAngle = function(ev, target) {
		var left = ev.clientX - this.disX;
		var top = ev.clientY - this.disY;

		/**
		 * @var {Number} l_w  点击 左侧 drag元素计算后的 宽 度值
		 * @var {Number} r_w  点击 右侧 drag元素计算后的 宽 度值
		 * @var {Number} t_h  点击 上侧 drag元素计算后的 高 度值
		 * @var {Number} b_h  点击 下侧 drag元素计算后的 高 度值
		 * @var {Number} to_r cover元素 左边框 距离 container元素右侧的距离
		 * @var {Number} to_b cover元素 上边框 距离 container元素下侧的距离
		 * @var {Number} mv   minValue cover宽高的最小值
		 */
		var l_w = this.w - left;
		var r_w = this.w + left - 2 * this.cover.offsetLeft;
		var t_h = this.h - top;
		var b_h = this.h + top - 2 * this.cover.offsetTop;

		var to_r = this.width - this.cover.offsetLeft;
		var to_b = this.height - this.cover.offsetTop;
		
		var mv = this.drag_width * 3;
		
		l_w = l_w < mv ? mv : l_w;
		r_w = r_w < mv ? mv : r_w;
		t_h = t_h < mv ? mv : t_h;
		b_h = b_h < mv ? mv : b_h;

		r_w = r_w > to_r ? to_r : r_w;
		b_h = b_h > to_b ? to_b : b_h;
		
		if (left < 0) {
			left = 0;
			l_w = this.w;
		} else if (left > this.width - mv) {
			left = this.width - mv;
		}

		if (top < 0) {
			top = 0;
			t_h = this.h;
		} else if (top > this.height - mv) {
			top = this.height - mv;
		}

		switch(target.getAttribute('LTcrop_id')) {
			case 'lt':
				this._css(this.cover, {
					left: left + 'px',
					top: top + 'px',
					width: l_w + 'px',
					height: t_h + 'px'
				});
			break;
			case 'ct':
				this._css(this.cover, {
					height: t_h + 'px',
					top: top + 'px'
				});
			break;
			case 'rt':
				this._css(this.cover, {
					width: r_w + 'px',
					height: t_h + 'px',
					top: top + 'px'
				});
			break;
			case 'lc':
				this._css(this.cover, {
					width: l_w + 'px',
					left: left + 'px',
				});
			break;
			case 'rc':
				this._css(this.cover, {
					width: r_w + 'px'
				});
			break;
			case 'lb':
				this._css(this.cover, {
					width: l_w + 'px',
					height: b_h + 'px',
					left: left + 'px',
				});
			break;
			case 'cb':
				this._css(this.cover, {
					height: b_h + 'px'
				});
			break;
			case 'rb':
				this._css(this.cover, {
					width: r_w + 'px',
					height: b_h + 'px'
				});
			break;
		}
	}

	Crop.prototype.downCover = function(ev) {
		this.coverFlag = true;
		this.disX = ev.clientX - this.cover.offsetLeft;
		this.disY = ev.clientY - this.cover.offsetTop;
	}

	Crop.prototype.downImg = function(ev) {
		this.imgFlag = true;
		this.disX = ev.clientX - this.img.offsetLeft;
		this.disY = ev.clientY - this.img.offsetTop;
	}


	Crop.prototype.downScalebtn = function(ev) {
		this.scaleFlag = true;
		this.disX = ev.clientX - this.scalebtn.offsetLeft;
		this.disY = ev.clientY - this.scalebtn.offsetTop;
	}


	Crop.prototype.downCropbtn = function(ev) {
		// this.onOffRatate = false;
		
		this.rotateNum = 0;
		this.rotate = this.rotateNum * 90;
		this.canvasScale = 1;
		this._css(this.img, {
			WebkitTransform: 'scale('+ this.scale + ',' + this.scale +') rotate('+ this.rotate +'deg)',
			transform: 'scale('+ this.scale + ',' + this.scale +') rotate('+ this.rotate +'deg)'
		});
		this._css(this.canvas, {
			WebkitTransform: 'scale('+ this.canvasScale + ',' + this.canvasScale +')',
			transform: 'scale('+ this.canvasScale + ',' + this.canvasScale +')'
		});
		this.showScalebar();
		this.hideCanvas();
		this.showImg();
		this.showCover();
		this.hideToolbar();
		this.showOperabar();
	}

	Crop.prototype.downRotatebtn = function() {
		// if (!this.onOffRatate) return;
		if (this.rotateNum >= 3) {
			this.rotateNum = 0;
		} else {
			this.rotateNum++;
		}
		// this.scale = this.initScale;
		// this.canvasScale = 1;
		this.rotate = 90 * this.rotateNum;
		this.setImgScale(this.scale);
		this._css(this.canvas, {
			WebkitTransform: 'scale('+ this.canvasScale + ',' + this.canvasScale +') rotate('+ this.rotate +'deg)',
			transform: 'scale('+ this.canvasScale + ',' + this.canvasScale +') rotate('+ this.rotate +'deg)',
		});

	}

	Crop.prototype.downSave = function(ev) {
		
		var cr = this.cover.getBoundingClientRect();
		var ir = this.img.getBoundingClientRect();

		var cover_rect = [cr.left, cr.top, cr.left + cr.width, cr.top + cr.height];
		var img_rect = [ir.left, ir.top, ir.left + ir.width, ir.top + ir.height];
		var intersect_rect = this.getOverlap.apply(this, cover_rect.concat(img_rect));

		var left = (intersect_rect[0] - img_rect[0])/this.scale;
		var top = (intersect_rect[1] - img_rect[1])/this.scale;
		var width = intersect_rect[2]/this.scale;
		var height = intersect_rect[3]/this.scale;

		if (left < 0) left = 0;
		if (top < 0) top = 0;
		if (left + width > this.img_width) width = this.img_width - left;
		if (top + height > this.img_height) height = this.img_height - top;

		this.crop_rect = [left, top, width, height];
		// console.log(this.crop_rect);

		this.canvas.width = parseInt(width * this.scale);
		this.canvas.height = parseInt(height * this.scale);
		
		this.ctx.drawImage(
			this.img, 
			parseInt(this.crop_rect[0]), 
			parseInt(this.crop_rect[1]), 
			parseInt(this.crop_rect[2]),
			parseInt(this.crop_rect[3]), 
			0, 
			0, 
			parseInt(this.crop_rect[2] * this.scale), 
			parseInt(this.crop_rect[3] * this.scale)
		);
		
		this._css(this.canvas, {
			position: 'absolute',
			left: -parseInt((this.canvas.width - this.width) / 2) + "px",
			top: -parseInt((this.canvas.height - this.height) / 2) + "px",
			WebkitTransform: 'rotate('+ this.rotate +'deg)',
			transform: 'rotate('+ this.rotate +'deg)',
			zIndex: 100
		});

		this.hideScalebar();
		this.showToolbar();
		this.hideOperabar();
		this.hideCover();
		this.hideImg();
		this.showCanvas();

		this.isCrop = true;
		
	}

	Crop.prototype.downCancel = function(ev) {
		this.rotateNum = 0;
		this.setImgScale(this.initScale);
		this.hideScalebar();
		this.hideCanvas();
		this.showImg();
		this.hideCover();
		this.showToolbar();
		this.hideOperabar();
		this.isCrop = false;
	}

	Crop.prototype.downConfirmbtn = function(ev) {
		var data = {};
		var base64 = this.canvas.toDataURL("image/" + this.type, this.compression);
		var blob = this.dataURItoBlob(base64);
		
		if (this.isCrop) {
			data.base64 = base64;
			data.blob = blob;
		} else {
			data.url = this.image_src;
		}
		data.rotateNum = this.rotateNum;
		data.isCrop = this.isCrop;
		this.output(data);
	}

	Crop.prototype.downScaleDown = function(ev) {
		if (this.pointNum <= 0) return;
		this.pointNum--;
		this._css(this.scalebtn, {
			left: this.scalePoints[this.pointNum] + 'px'
		});
		this.setImgScale();
		this.isScaleMoved = false;
	}

	Crop.prototype.downScaleUp = function(ev) {
		if (!this.isScaleMoved) {
			if (this.pointNum >= this.scalePoints.length - 1) return;
			this.pointNum++;
		}
		this._css(this.scalebtn, {
			left: this.scalePoints[this.pointNum] + 'px'
		});
		this.setImgScale();
		this.isScaleMoved = false;
	}


	Crop.prototype._css = function (el, obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				el.style[key] = obj[key];
			}
		}
	}

	Crop.prototype.setStyle = function () {

		if (this.getStyle(this.renderTo, 'position') == 'static') {
			this._css(this.renderTo, {
				position: 'relative'
			});
		}
		
		this._css(this.cover, {
			position: 'absolute',
			width: this.cover_width + 'px',
			height: this.cover_height  + 'px',
			left: (this.width - this.cover_width) / 2 + "px",
			top: (this.height - this.cover_height) / 2 + "px",
			border: this.border_width + 'px solid #fff',
			boxShadow: 'rgba(0, 0, 0, 0.6) 0px 0px 0px 10000px'
		});

		this._css(this.img, {
			position: 'absolute',
			left: -(this.img.width - this.width) / 2 + "px",
			top: -(this.img.height - this.height) / 2 + "px",
			WebkitTransform: 'scale('+ this.scale + ',' + this.scale +') rotate('+ this.rotate +'deg)',
			transform: 'scale('+ this.scale + ',' + this.scale +') rotate('+ this.rotate +'deg)'
		});
		
		this._css(this.scalebar, {
			position: 'absolute',
			width: this.scalebar_width + 'px',
			left: -(this.scalebar.offsetWidth - this.width) / 2 + "px",
			top: -100 + "px",
		});

		this._css(this.scalebtn, {
			position: 'absolute',
			left: -(this.scalebtn.offsetWidth - this.scalebtnWrap.offsetWidth) / 2 + "px"
		});

		this._css(this.toolbar, {
			position: 'absolute',
			left: -(this.toolbar.offsetWidth - this.width) / 2 + "px",
			bottom: 10 + "px"
		});
		
		this._css(this.operabar, {
			position: 'absolute',
			left: -(this.operabar.offsetWidth - this.width) / 2 + "px",
			bottom: -100 + "px"
		});

		this._css(this.scalebtnWrap, {
			width: this.scalebtnWrap_width + 'px'
		});

	};

	// top left (x1,y1) and bottom right (x2,y2) coordination
	Crop.prototype.getOverlap = function (ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
		if (ax2 < bx1 || ay2 < by1 || ax1 > bx2 || ay1 > by2) return [0, 0, 0, 0];

		var left = Math.max(ax1, bx1);
		var top = Math.max(ay1, by1);
		var right = Math.min(ax2, bx2);
		var bottom = Math.min(ay2, by2);
		return [left, top, right - left, bottom - top];
	},

	Crop.prototype.getStyle = function(node, attr){
		if(typeof getComputedStyle != 'undefined'){
			var value = getComputedStyle(node,null).getPropertyValue(attr);
			return attr == 'opacity' ? value * 100 : value; //兼容不透明度，如果是不透明度，则返回整数方便计算
		} else if(typeof node.currentStyle != 'undefined'){
			if(attr == 'opacity'){ //兼容不透明度
				return Number(node.currentStyle.getAttribute('filter').match(/(?:opacity[=:])(\d+)/)[1]);
			} else {
				return node.currentStyle.getAttribute(attr);
			}
		}
	}

	Crop.prototype.showToolbar = function() {
		this._css(this.toolbar, {
			bottom: '10px'
		});
	}

	Crop.prototype.hideToolbar = function() {
		this._css(this.toolbar, {
			bottom: '-100px'
		});
	}

	Crop.prototype.showCover = function() {
		this._css(this.cover, {
			display: 'block'
		});
	}

	Crop.prototype.hideCover = function() {
		this._css(this.cover, {
			display: 'none'
		});
	}

	Crop.prototype.showImg = function() {
		this._css(this.img, {
			display: 'block'
		});
	}

	Crop.prototype.hideImg = function() {
		this._css(this.img, {
			display: 'none'
		});
	}

	Crop.prototype.showScalebar = function() {
		this._css(this.scalebar, {
			top: '10px'
		});
	}

	Crop.prototype.hideScalebar = function() {
		this._css(this.scalebar, {
			top: '-100px'
		});
	}

	Crop.prototype.showOperabar = function() {
		this._css(this.operabar, {
			bottom: '10px'
		});
	}

	Crop.prototype.hideOperabar = function() {
		this._css(this.operabar, {
			bottom: '-100px'
		});
	}

	Crop.prototype.showCanvas = function() {
		this._css(this.canvas, {
			display: 'block'
		});
	}

	Crop.prototype.hideCanvas = function() {
		this._css(this.canvas, {
			display: 'none'
		});
	}

	Crop.prototype.setImgScale = function(scale) {
		if (typeof scale == 'number') {
			this._css(this.scalebtn, {
				left: scale / 2 * this.scalebtnWrap_width - this.scalebtn.offsetWidth/2 + 'px'
			});
			this.scale = scale.toFixed(2);
		} else {
			this.scale = (parseInt(this.scalebtn.style.left) + this.scalebtn.offsetWidth/2) / this.scalebtnWrap_width * 2;
		}
		
		this._css(this.img, {
			WebkitTransform: 'scale('+ this.scale + ',' + this.scale +') rotate('+ this.rotate +'deg)',
			transform: 'scale('+ this.scale + ',' + this.scale +') rotate('+ this.rotate +'deg)'
		});
	}
	
	Crop.prototype.setPoints = function() {
		var pointLength = 10;
		var n = (this.scalebtnWrap.offsetWidth - this.scalebtn.offsetWidth) / pointLength;
		this.scalePoints = [];
		this.pointNum = pointLength/2;
		for (var i = 0; i <= pointLength; i++) {
			this.scalePoints.push(Math.round(i * n));
		}
	}
	Crop.prototype.dataURItoBlob = function(dataURI) {
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0){
			byteString = atob(dataURI.split(',')[1]);
		} else {
			byteString = unescape(dataURI.split(',')[1]);
		}
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ia], {type:"image/jpeg"});
	}

	Crop.prototype.onMouseWheel = function(ev) {
		var domName = ev.target.tagName.toLowerCase();
		var bDown = true;
		var This = this;
		
		bDown = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0;
		
		if(bDown) {
			// console.log('向下滚动');
			if (domName == 'canvas') {
				this.canvasScale -= 0.05;
			} else {
				this.scale -= 0.05;
			}
			
		} else {
			// console.log('向上滚动');
			if (domName == 'canvas') {
				this.canvasScale += 0.05;
			} else {
				this.scale += 0.05;
			}
		}
		if (domName == 'canvas') {

			if (this.canvasScale <= 0.0542636) {
				this.canvasScale = 0.0542636;
			} else if (this.canvasScale >= 1.94574) {
				this.canvasScale = 1.94574;
			}

			this._css(this.canvas, {
				WebkitTransform: 'scale('+ this.canvasScale + ',' + this.canvasScale +') rotate('+ this.rotate +'deg)',
				transform: 'scale('+ this.canvasScale + ',' + this.canvasScale +') rotate('+ this.rotate +'deg)'
			});

			return false;
		}
		clearTimeout(this.timer);
		this.timer = setTimeout(function() {
			This.isScaleMoved = true;
			for (var i = 0; i < This.scalePoints.length; i++) {
				if (This.scalePoints[i] >= This.scalebtn.offsetLeft) {
					This.pointNum = i;
					break;
				}
			}
			// console.log(This.pointNum);
		}, 200);
		

		if (this.scale <= 0.0542636) {
			this.scale = 0.0542636;
		} else if (this.scale >= 1.94574) {
			this.scale = 1.94574;
		}
		
		this.setImgScale(this.scale);
		if(ev.preventDefault) {
			ev.preventDefault();
		}
		return false;
	}

    Crop.prototype.min150 = function(num) {
        var min = 150
        if (num < min) return min;
        return num
    }

	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = $_$Crop;
	} else {
		window.$_$Crop = $_$Crop;
	}

})();