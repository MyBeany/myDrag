var cArea = $('#ele');  // 最外层容器
var drag = $('.drag');  // 拖拽区域
var cAreaH; //容器高度
var cAreaW;  // 容器宽度
//标尺尺寸
var rulerSize = 30;
var cAreaTop = getPosition(cArea).Y - rulerSize; // 容器距离浏览器上边界距离
var cAreaLeft = getPosition(cArea).X - rulerSize; // 容器距离浏览器左边界距离
var currentEle = null; // 缓存当前拖动的元素
var clickEle = null;  //缓存当前选中元素
var mousePosition, mouseStartX, mouseStartY, dragLeft, dragTop, dragMaxH, dragMaxW;  // 定义按下鼠标产生的变量

//画布大小   宽8.5英寸   高5.5英寸
var areaWidthIn = 8.5;
var areaHeightIn = 5.5;


var movePx = 3;  //全局移动点

$('body').on('mousedown', '.drag', startDrag);

//元素点击
$('body').on('click', '.drag', dragControlSize);

//body下点击   （空白区）
$('body').on('click', '#ele', remoreAllControlSize);

$('body').on('dblclick', '.dragImg', changeImg);


$(document).keydown(function (e) {
    var eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    if (clickEle != null) {
        //判断是否是选中文本
        var textareaEle = $(clickEle).find('textarea');
        if (!(textareaEle.length !== 0 && (textareaEle.is(":focus")))) {
            if (eCode === 37 && e.shiftKey) {
                $(clickEle).css('width', $(clickEle).outerWidth(true) - movePx);
            } else if (eCode === 39 && e.shiftKey) {
                $(clickEle).css('width', $(clickEle).outerWidth(true) + movePx);
            } else if (eCode === 38 && e.shiftKey) {
                $(clickEle).css('height', $(clickEle).outerHeight(true) - movePx);
                textareaHrNum(clickEle, $(clickEle).outerHeight(true));
            } else if (eCode === 40 && e.shiftKey) {
                $(clickEle).css('height', $(clickEle).outerHeight(true) + movePx);
                textareaHrNum(clickEle, $(clickEle).outerHeight(true));
            } else if ((eCode === 8 || eCode === 46)) {  //Delete键或Backspace键删除元素
                $(clickEle).remove();
            } else if (eCode === 37) { //左键移动
                $(clickEle).css('left', $(clickEle).position().left - movePx + 'px');
            } else if (eCode === 38) { //上键移动
                $(clickEle).css('top', $(clickEle).position().top - movePx + 'px');
            } else if (eCode === 39) { //右键移动
                $(clickEle).css('left', $(clickEle).position().left + movePx + 'px');
            } else if (eCode === 40) { //下键移动
                $(clickEle).css('top', $(clickEle).position().top + movePx + 'px');
            }
        }
    }
});

function startDrag(e) {
    currentEle = this;
    e.stopPropagation();
    mouseStartX = e.clientX; // 按下鼠标时，相对于浏览器边界的x坐标
    mouseStartY = e.clientY;  // 按下鼠标时，相对于浏览器边界的Y坐标
    dragLeft = $(this).offset().left; // 按下鼠标时，拉伸框距离容器左部的距离
    dragTop = $(this).offset().top;  // 按下鼠标时，拉伸框距离容器顶部的距离
    dragMaxH = cAreaH - drag.height();  //垂直移动最大范围
    dragMaxW = cAreaW - drag.width();  // 水平移动最大范围
    mousePosition = $(e.target).attr('data-type');  // 判断按下的位置 是中间还是边上的拉伸点
    $(document).on('mousemove', dragging).on('mouseup', clearDragEvent);
}

/**
 * 监听鼠标移动
 * @param e
 */
function dragging(e) {
    e.stopPropagation();
    window.getSelection().removeAllRanges();
    switch (mousePosition) {
        case 'drag' :
            dragMove(e);
            break;
        case 'cUp' :
            upDownMove(e, 'up');
            break;
        case 'cDown' :
            upDownMove(e, 'down');
            break;
        case 'cLeft' :
            leftRightMove(e, 'left');
            break;
        case 'cRight' :
            leftRightMove(e, 'right');
            break;
        case 'cLeftUp' :
            leftRightMove(e, 'left');
            upDownMove(e, 'up');
            break;
        case 'cLeftDown' :
            leftRightMove(e, 'left');
            upDownMove(e, 'down');
            break;
        case 'cRightUp' :
            leftRightMove(e, 'right');
            upDownMove(e, 'up');
            break;
        case 'cRightDown' :
            leftRightMove(e, 'right');
            upDownMove(e, 'down');
            break;
        default :
            break;
    }
}

//全局移动
function pxFun(px) {
    return parseInt(px / movePx) * movePx;
}

/**
 * 拉伸框整体移动
 * @param e
 */
function dragMove(e) {
    var moveX = e.clientX - mouseStartX; // 拖拽中  当前坐标 - 初始坐标
    var moveY = e.clientY - mouseStartY;
    var destinationX = Math.min((moveX + dragLeft), dragMaxW); //限制拖动最大范围
    var destinationY = Math.min((moveY + dragTop), dragMaxH);
    $(currentEle).css({
        left: destinationX < 0 ? 0 : pxFun(destinationX) - rulerSize,
        top: destinationY < 0 ? 0 : pxFun(destinationY) - rulerSize
    });
}

/**
 * 元素点击事件  来控制元素尺寸控制器显示与隐藏
 * @param e
 */
function dragControlSize(e) {
    //屏蔽事件冒泡
    e.stopPropagation();
    var thisDrag = this;
    clickEle = thisDrag;
    //用做多选   备用
    // if(!event.ctrlKey){
    //移除非当前元素的大小控制器
    $(".drag").each(function () {
        if (thisDrag != this) {
            dragControlSizeForAll(this);
        }
    });
    // }
    $(thisDrag).children('div').css('display', 'block');
}

/**
 * 移除指定元素下所有元素尺寸控制器， 实现点击一个元素，其他元素控制器隐藏
 * @param e
 */
function dragControlSizeForAll(e) {
    $(e).children('div').css('display', 'none');
}

/**
 * 移除body下元素尺寸控制器，实现点击屏幕外 ，所有控制器隐藏
 * @param e
 */
function remoreAllControlSize(e) {
    clickEle = null;
    $(this).children('.drag').children('div').css('display', 'none');
}


/**
 * 鼠标松开 释放事件
 * @param e
 */
function clearDragEvent(e) {
    $(document).off('mousemove', dragging).off('mouseup', clearDragEvent);
}

/**
 * 上下方向的边框拖动
 * @param e event事件
 * @param direction  方向
 */
function upDownMove(e, direction) {

    var draggingY = e.clientY - rulerSize;
    if (draggingY < cAreaTop) draggingY = cAreaTop;  // 限制最多只能移动到容器的上下边界
    if (draggingY > cAreaTop + cAreaH) draggingY = cAreaTop + cAreaH;
    var dragY = getPosition(currentEle).Y;
    var changeHeight;
    if (direction === 'up') {
        changeHeight = dragY - draggingY;
        $(currentEle).css('top', draggingY);
    } else if (direction === 'down') {
        changeHeight = draggingY - parseFloat($(currentEle).css('height')) - dragY;
    }
    var endHeight = changeHeight + parseFloat($(currentEle).css('height'));
    $(currentEle).css('height', endHeight);
    textareaHrNum(currentEle, endHeight);
};

//多行文本显示问题
function textareaHrNum(e, endHeight) {
    //判断多行文本域
    var isNoteText = $(e).hasClass('dragNoteText');
    if (isNoteText) {
        $(e).find('hr').remove();
        for (var i = 0; i < parseInt(endHeight / 12); i++) {
            $(e).append('<hr/>');
        }
    }
}

/**
 * 水平方向的边框拖动
 * @param e event
 * @param direction 方向
 */
function leftRightMove(e, direction) {
    var draggingX = e.clientX - rulerSize;
    if (draggingX < cAreaLeft) draggingX = cAreaLeft;
    if (draggingX > cAreaLeft + cAreaW) draggingX = cAreaLeft + cAreaW;
    var dragX = getPosition(currentEle).X;
    var changeWidth;
    if (direction === 'left') {
        changeWidth = dragX - draggingX;
        $(currentEle).css('left', draggingX);
    } else if (direction === 'right') {
        changeWidth = draggingX - parseFloat($(currentEle).css('width')) - dragX;
    }
    var endWidth = changeWidth + parseFloat($(currentEle).css('width'));
    //供文本使用
    $(currentEle).find('.textarea').css('width', endWidth);
    $(currentEle).css('width', endWidth);
};


/**
 * 获取元素距离父容器的距离
 * @param elem  容器
 */
function getPosition(elem) {
    var elemX = $(elem).position().left; // 相对于element.offsetParent节点的左边界偏移像素值
    var elemY = $(elem).position().top;  // 相对于element.offsetParent节点的上边界偏移像素值
    return {X: elemX, Y: elemY};
};


///////////////////////////////////////////////////////////////
//拖拽功能
var $container = $('#ele');   //移入的容器
var $dragItem = $('.drag-item'); // 可以拖动的元素
var eleDrag = null; //当前被拖动的元素
var endPosition = {left: '', top: ''};  // 放开元素时的鼠标坐标
$dragItem.on('selectstart', function () {
    return false;
});

$dragItem.on('dragstart', function (ev) {
    // 拖拽开始
    ev.originalEvent.dataTransfer.effectAllowed = 'move';
    eleDrag = ev.target;
    return true;
}).on('dragend', function (ev) {
    eleDrag = null;
    return false;
});

$container.on('dragover', function (ev) {
    ev.preventDefault();
    return true;
}).on('dragenter', function (ev) {
    $(this).toggleClass('active');
    return true;
}).on('drop', function (ev) {
    endPosition.left = ev.originalEvent.x;
    endPosition.top = ev.originalEvent.y;
    if (eleDrag) {
        setHtml(eleDrag)
    }
    $(this).toggleClass('active');
});

function setHtml(eleDrag) {
    //元素类型   有矩形，圆角矩形，线条，圆，图片
    var eleDregType = $(eleDrag).attr('type');
    var src = $(eleDrag).attr('src');
    var $img = $('<img>');
    var $dragEle = $('<div>');
    var directionBtn = getHtmlForType(eleDregType);
    $(".drag").each(function () {
        dragControlSizeForAll(this);
    });
    $img.attr('src', src).attr('data-type', 'drag');
    $dragEle.addClass(eleDregType).addClass("drag").attr('data-type', 'drag').append(directionBtn);
    clickEle = $dragEle;
    $container.append($dragEle);
    $dragEle.css({
        //解释算法    endPosition为距离浏览器边缘的长度    减去rulerSize是减去标尺长度
        // -2是减去边框宽度   width/2是控制鼠标在元素中心
        'left': endPosition.left - $dragEle.width() / 2 - rulerSize-2,
        'top': endPosition.top - $dragEle.height() / 2 - rulerSize-2
    });
    //文字创建时自动获取焦点
    $dragEle.find('textarea').focus();
    //图片创建时自动获取点击事件
    $dragEle.find('.imgFile').click();
}


function getHtmlForType(eleDregType) {
    var directionBtn;
    if (eleDregType === 'dragHorizontalLine') {
        directionBtn = $('.cacheEleHorizontalLine').html();
    } else if (eleDregType === 'dragVerticalLine') {
        directionBtn = $('.cacheEleVerticalLine').html();
    } else if (eleDregType === 'dragWords') {
        directionBtn = $('.cacheEleWords').html();
    } else if (eleDregType === 'dragNoteText') {
        directionBtn = $('.cacheEleNoteText').html();
    } else if (eleDregType === 'dragImg') {
        directionBtn = $('.cacheEleImg').html();
    } else {
        directionBtn = $('.cacheEle').html();
    }
    return directionBtn;
}

//文字输入框 高度自适应事件
function textareaKeyUp(e) {
    e.style.height = 'auto';
    e.style.height = e.scrollHeight + 'px';
    $(e).parent().css('height', e.style.height);
}

//监听图片上传变化事件
function imgFileChange(e) {
    var file = $(e)[0].files[0];
    if (file != null) {
        var reader = new FileReader();
        if (/image/.test(file.type)) {//操作图像
            reader.readAsDataURL(file);
            reader.onload = function () {
                $(e).parent().css('background-image', "url(" + reader.result + ")");
            }
        }
    }
}

//双击更换图片
function changeImg() {
    $(this).parent().find('.imgFile').click();
}

function lockScreen(e) {
    $(".drag").each(function () {
        dragControlSizeForAll(this);
    });
    $('.ele').toggle();
}

function setFontColor() {
    var color = $("#color").val();
    $(clickEle).children().css('color', color);
}

function setBgColor() {
    var color = $("#color").val();
    $(clickEle).css('background-color', color);
}

function createData() {
    return {
        objtype: '', objcode: '', left: '', top: '', width: '', height: '', linewidth: '',
        text: '', autosize: '', alignment: '', fontname: '', fontsize: '', fontbold: '',
        fontitalic: '', fontcolor: '', flag: '', format: '', stretch: '', tag: '', allpwPrint: '',
        bgcolor: '', bordercolor: '', zindex: ''
    };
}

function getDate() {
    var dataList = [];
    var domList = $("#ele").children();
    domList.each(function () {
        var data = createData();
        var $this = $(this);
        //第一个class为元素类型
        data.objtype = $this.attr("class").split(' ')[0];
        data.left = $this.position().left;
        data.top = $this.position().top;
        data.width = $this.width;
        data.height = $this.height;
        data.linewidth = $this.css('border-width');
        if ($this.find('textarea').length > 0) {
            data.text = $this.find('textarea').val();
        }
        data.alignment = $this.css('text-align');
        data.fontname = $this.css('font-family');
        data.fontsize = $this.css('font-size');
        data.fontbold = $this.css('font-weight');
        data.fontitalic = $this.css('font-style');
        data.fontcolor = $this.css('color');
        data.bgcolor = $this.css('background-color');
        dataList.push(data);
    });
    console.log(dataList);
}


function unitConversion() {
    /**
     * 获取DPI
     * @returns {Array}
     */
    this.conversion_getDPI = function () {
        var arrDPI = new Array;
        if (window.screen.deviceXDPI) {
            arrDPI[0] = window.screen.deviceXDPI;
            arrDPI[1] = window.screen.deviceYDPI;
        } else {
            var tmpNode = document.createElement("div");
            tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
            document.body.appendChild(tmpNode);
            arrDPI[0] = parseInt(tmpNode.offsetWidth);
            arrDPI[1] = parseInt(tmpNode.offsetHeight);
            tmpNode.parentNode.removeChild(tmpNode);
        }
        return arrDPI;
    };
    /**
     * px转换为mm
     * @param value
     * @param index
     * @returns {number}
     * 1英寸(in)=25.4毫米(mm)
     */
    this.pxConversionMm = function (value, index) {
        var inch = value / this.conversion_getDPI()[index];
        var c_value = inch * 25.4;
        return c_value;
    };
    /**
     * mm转换为px
     * @param value
     * @param index
     * @returns {number}
     */
    this.mmConversionPx = function (value, index) {
        var inch = value / 25.4;
        var c_value = inch * this.conversion_getDPI()[index];
        return c_value;
    }
}

function rulerHorizontalItem() {
    var $rulerHorizontal = $(".rulerHorizontal");
    $rulerHorizontal.append($('<div class="rulerHorizontalFive"></div>'))
    var areaW = cArea.width();
    $rulerHorizontal.css('width', cArea.width() + rulerSize + 2);
    var i = 1;
    var sizeNum = 1;
    while (areaW > 0) {
        var $rulerHorizontalItem = $('<div>');
        if (i != 0 && i % 5 === 0) {
            $rulerHorizontalItem.addClass('rulerHorizontalFive');
            $rulerHorizontalItem.append($('<div>').addClass('rulerHorizontalSize').html(sizeNum));
            sizeNum++;
        } else {
            $rulerHorizontalItem.addClass('rulerHorizontalOne');
        }
        $rulerHorizontalItem.css('padding-left', new unitConversion().mmConversionPx(2, 0) - 1);

        $rulerHorizontal.append($rulerHorizontalItem);
        i++;
        areaW -= (new unitConversion().mmConversionPx(2, 0));
    }
}

function rulerVerticalItem() {
    var $rulerVertical = $(".rulerVertical");
    var areaH = cArea.height();
    $rulerVertical.css('height', cArea.height() + 2);
    var j = 1;
    var sizeNum = 1;
    while (areaH > 0) {
        var $rulerVerticalItem = $('<div>');
        if (j != 0 && j % 5 === 0) {
            $rulerVerticalItem.addClass('rulerVerticalFive');
            $rulerVerticalItem.append($('<div>').addClass('rulerVerticalSize').html(sizeNum));
            sizeNum++;
        } else {
            $rulerVerticalItem.addClass('rulerVerticalOne');
        }
        $rulerVerticalItem.css('padding-top', new unitConversion().mmConversionPx(2, 1) - 1);
        $rulerVertical.append($rulerVerticalItem);
        j++;
        areaH -= (new unitConversion().mmConversionPx(2, 1));
    }
}

//标尺
function rulerInit() {
    rulerHorizontalItem();
    rulerVerticalItem();
}

//设置画布大小
function setAreaWH() {
    var w = new unitConversion().mmConversionPx(areaWidthIn * 25.4, 0);
    var h = new unitConversion().mmConversionPx(areaHeightIn * 25.4, 1);
    $("#ele").css('width', w);
    $("#ele").css('height', h);
    $(".ele").css('width', w);
    $(".ele").css('height', h);
}

function initData() {
    cAreaH = cArea.height(); //容器高度
    cAreaW = cArea.width();  // 容器宽度
}

function init() {
    setAreaWH();
    initData();
    rulerInit();
}

init();
