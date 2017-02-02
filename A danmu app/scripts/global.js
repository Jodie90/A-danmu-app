$(document).ready(function() {
	//创建数据库引用，自己创建的一个应用
	var config = {
		syncURL: "http://dmq-20170115.wilddogio.com"
	};
	wilddog.initializeApp(config);
	var ref = wilddog.sync().ref();
	var arr = [];	// 此数组用来存放所有的消息元素	

	$("#say_txt").keypress(function(event) {
		if(event.keyCode == "13") {
			$("#danmu_send").trigger("click");
		}
	});

	//功能1：发送消息。将输入框数据发送到野狗弹幕墙app
	$("#send").on("click",function() {
		var text = $("#say_txt").val();  //获取输入框的数据
		ref.child("message").push(text);  //将数据写到云端message节点下，child用来定位子节点
		$("#say_txt").val("");
	});

	//功能2：清屏
	$("#clear").on("click",function() {
		ref.remove();
		arr = [];
		$("#danmu_show").empty();
	});

	//功能3：显示数据
	//绑定"child_added"事件，当message节点下有子节点新增时，就会触发回调，回调的"snapshot"对象包含了新增的数据
	ref.child("message").on("child_added",function(snapshot) {
		var text = snapshot.val();
		arr.push(text);
		var textObj = $("<div id=\"danmu_message\"></div>");
		textObj.text(text);
		$("#danmu_show").append(textObj);
		moveObj(textObj);
	});

	ref.on("child_removed",function() {
		arr = [];
		$("#danmu_show").empty();
	});

	//滚动及逐行显示
	var topMin = $("#danmu_mask").offset().top; 	 // 显示框距顶部距离
	var topMax = topMin + $("#danmu_mask").height(); // 显示框底部距顶部距离
	var _top = topMin; // 每个滚动消息距顶部距离

	var moveObj = function(obj) {
		var _left = $("#danmu_mask").width() - obj.width();
		_top = _top + 50;
		if (_top > (topMax - 50)) {
			_top = topMin;
		}
		obj.css({
			left : _left,
			top : _top,
			color : getRandomColor()  // 获取随机颜色，之后讲
		});
		var time = 20000 + 10000 * Math.random();
		// animate() 方法执行 CSS 属性集的自定义动画。逐渐改变的，这样就可以创建动画效果。
		obj.animate({								
			left : "-" + _left + "px"  // 让消息距左距离逐渐减小，产生右向左滚动动画。
		}, time, function() {
			obj.remove();
		});
	}

	//生成随机颜色
	var getRandomColor = function() {
		return '#' + (function(h) {
			return new Array(7 - h.length).join("0") + h
		})((Math.random() * 0x1000000 << 0).toString(16))
	}

	//每 3s 随机选取一条消息播放
	var getAndRun = function() {
		if (arr.length > 0) {
			var n = Math.floor(Math.random() * arr.length + 1) - 1;
			var textObj = $("<div>" + arr[n] + "</div>");
			$("#danmu_show").append(textObj);
			moveObj(textObj);
		}
		setTimeout(getAndRun, 3000);
	}
	jQuery.fx.interval = 50;
	getAndRun();
});