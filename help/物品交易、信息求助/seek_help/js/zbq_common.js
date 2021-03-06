/**
 * Created by JetBrains WebStorm.
 * User: k
 * Date: 12-6-1
 * Time: 上午10:08
 * To change this template use File | Settings | File Templates.
 */
 function getStyle(ele) {
    var style;
    if (document.defaultView && document.defaultView.getComputedStyle) {
      style = document.defaultView.getComputedStyle(ele, null);
    } else {
      style = ele.currentStyle;
    };
    return style;
  }

//openBox
var openBox = {
  show: function (id) {
    if (!this.mask) {
      this.createMask();
    };
    var win = getW();
    var obj = document.getElementById(id);
    obj.style.top = win.s + (win.h / 2) - parseInt(getStyle(obj).height) * 0.5 + "px";
    obj.style.display = "block";
    obj.style.zIndex = 99999;
    this.mask.style.display = "block";
  },
  createMask: function () {
    var win = getW();
    this.mask = document.createElement("div");
	if(win.s_h<win.h)win.s_h = win.h; //内容小于屏幕高度
    this.mask.style.height = win.s_h + "px";
    this.mask.style.width = win.w + "px";
    this.mask.style.zIndex = 9999;
    this.mask.style.background = "#000";
    this.mask.style.opacity = "0.8";
    //this.mask.style.position = "absolute";
    //this.mask.style.left = "0px";
    //this.mask.style.top = "0px";
    this.mask.className = "mask_openBox";
    this.mask.style.filter = "alpha(opacity:80)";
    document.body.appendChild(this.mask);
  },
  hide: function (id) {
    if (this.mask) {
      this.mask.style.display = "none";
    };
    var obj = document.getElementById(id);
    obj.style.display = "none";
  }
};

//获取窗口高宽
function getW() {
  var client_h, client_w, scrollTop;
  client_h = document.documentElement.clientHeight || document.body.clientHeight;
  client_w = document.documentElement.clientWidth || document.body.clientWidth;
  screen_h = document.documentElement.scrollHeight || document.body.scrollHeight;
  scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  return o = {
    w: client_w,
    h: client_h,
    s: scrollTop,
    s_h: screen_h
  };
}


var selectBox = {
    init:function(){
        this.li = $("#selectBox .selectList");
        this.li.hover(function(){
             $(this).find("ul").addClass("hover");
        },function(){
             $(this).find("ul").removeClass("hover");
        });
        this.li_chima = $(".chima_li");
        this.li_chima.bind("mouseover",function(){
            $("#chimaName").html($(this).html());
            var sex = $(this).attr("data");
            $("#chimaSelectBox").show();
            $("#chimaSelectBox .hc").hide();
            $("#hc_" + sex).show();
        });
        $("#chimaBox").bind("mouseleave",function(){
           $("#chimaSelectBox").hide();
        });
    }
};



//瀑布流
/*  
  	name:产品名字
	price:价格
  	url:链接地址
	img_url:图片地址
	is_verified:是否鉴定
	Brand:品牌对象
	Brand.BrandName:品牌名字
	Brand.BrandUrl:品牌名字
	Category:分类对象
  	styles:风格数组
	detail_url:详细页地址
 */
var mainList = {
	init:function(){
		var that = this;
		
		$(".btnLike").live("click",function(){			
            var item = $(this).parents('.item');
            var shoe_id = item.attr('shoe_id'),all_id = item.attr('all_id');
            if(!user_id)            {
                commonLogin(); return false;
            }
            if(shoe_id > 0)
            {
                var like_type = 'shoe';
                var like_id = shoe_id;
            }else{
                var like_type = 'all';
                var like_id = all_id;
            }
            var this_btnLike = $(this);
			that.addLike_num = false;
			if($(this).attr("addLike_num")){
				that.addLike_num = $("#addLike_num");
			};
			
            $.post(addlikeUrl,{like_type : like_type,id : like_id}, function(data){
				if(parseInt(data.status) == 1){
                    var pos = {l:this_btnLike.find('span').offset().left,t:this_btnLike.find('span').offset().top};			
                    if(!that.tip){
                        that.tip = document.createElement("span");
                        that.tip.className="like_tip";
                        that.tip.innerHTML = " +1 ";
                        document.body.appendChild(that.tip);
                    };
                    $(that.tip).css({left:pos["l"],top:pos["t"]-10,opacity:1});
                    //document.title = pos["t"]+50;
                    $(that.tip).show();
                    $(that.tip).animate({top:pos["t"]-20},250);
                    $(that.tip).fadeOut(250);  
                    if(that.addLike_num){						
						var newlikeNum = (that.addLike_num.html())?that.addLike_num.html():0;						
						that.addLike_num.html(parseInt(newlikeNum)+1);
						this_btnLike.find("span").html("已收藏");
					}else{
						var newlikeNum = (this_btnLike.find('span').html())?this_btnLike.find('span').html():0;
						this_btnLike.find('span').html(parseInt(newlikeNum)+1);
					};					
                    setTimeout(function(){this_btnLike.attr('class','btnLike_ok')},400);
                }
                if(parseInt(data.status) == -5){
					 if(that.addLike_num){											
						this_btnLike.find("span").html("已收藏");
					}
                    setTimeout(function(){this_btnLike.attr('class','btnLike_ok')},400);
                }
                if(parseInt(data.status) == -2)
                {
                    commonLogin(); return false;
                }
            }, 'json'); 
				
			return false;
		});
		if(typeof items=="undefined")return false;;
		this.box = $("#mianWrap");
		this.li = $("#mianWrap .list");
		this.item = this.box.find(".item");
		this.item.hover(function(){$(this).addClass("item_hover");},function(){$(this).removeClass("item_hover");});
		this.l = items.length;    
		this.c = 0;
		this.boxT = this.box.offset().top;
		this.w_h = getW().h;	
		that.timer = 0;
		this.boxH = this.box.outerHeight(true);	
	//	that.dd = 0;
		this.loading = document.createElement("div");
		this.loading.className = "loading";
		this.loading = $(this.loading);
		this.box.after(this.loading);
		this.maxT = this.boxT + this.boxH-this.w_h;		
		//this.create();
		that.loadOver = false;
		this.scrollFn();
		that.timerLoading = null;
		$(window).bind("scroll",function(){that.scrollFn();});
	},
	scrollFn:function(){
		var that =this;
		if(this.loadOver){return false;}
		that.timer = setTimeout(function(){				
			if((getW().s)>that.maxT){
				that.loading.show();
				clearTimeout(that.timerLoading);
				that.timerLoading = setTimeout(function(){
					that.create();				
				},500);
			};	
		},100);		
	},  
	create:function(){
		var that =this;
		var  o = {};
		for(var n = 1;n<=3;n++){
			for(var i = 0;i<4;i++){
				if(this.c>=this.l) {
					if(!that.loadOver){
						var boxH = this.box.outerHeight(true);
						for(var t = 0;t<4;t++){
							var bgHtml = document.createElement("div");
							bgHtml.style.background = "#f0f0f0";
							bgHtml.style.height = boxH-this.li.eq(t).outerHeight(true) + "px";							
							this.li.eq(t).append(bgHtml);
						};			
						that.loadOver = true;						
					};					
					break;					
					return false;
				};
                o.id = items[this.c]["id"];
                o.data_track = (Math.ceil(this.c/4)+4)+"_"+(i+1);
				o.name = items[this.c]["name"];
				o.price = items[this.c]["price"];
				o.url = items[this.c]["detail_url"];
				o.img_url = items[this.c]["img_url"];
				o.is_verified = items[this.c]["is_verified"];
				o.brand_name = items[this.c]["brand_name"];
				o.brand_id = items[this.c]["brand_id"];
				o.title = items[this.c]["title"];
				o.category_name =items[this.c]["category_name"];
				o.styles = items[this.c]["styles"];
				o.edit_url = items[this.c]['edit_url'];
				o.give_money = items[this.c]['give_money'];
				o.freight_payer  = items[this.c]['freight_payer'];
				o.sold_count = +items[this.c]['sold_count'];
                o.like_count = items[this.c]['like_count'];
                o.like = items[this.c]['like'];
				var $item = $(this.item_html(o));
				this.li.eq(i).append($item);
				$item.hover(function(){$(this).addClass("item_hover");},function(){$(this).removeClass("item_hover");});
				addTrackEvent($item);
					this.c ++;
				};
		};
		this.boxH = this.box.outerHeight(true);
		this.maxT = this.boxT + this.boxH-this.w_h;	
		that.loading.hide();
	},
	item_html:function(o){
		var price_int = o["price"].indexOf(".");
		var html = "";
		html+='<div class="item"  shoe_id="'+o.id+'">';
        html+='<div class="inner">';
        html+='  <div class="photo"> <a data-track="'+ o.name + '-' + (o.brand_name ? o.brand_name : '') + '-index-shoe-pos-'+ o.data_track + '-pic" target="_blank" href="'+o["url"]+'"> <img src="'+o["img_url"]+'" class="errorPic" alt="' + o.title + '" title="'+o.title+'"/></a> '
		if(o["is_verified"]){
			html+='<img src="/images/trade/icon_jd2.gif" alt="经虎扑鉴定团鉴定为正品" title="经虎扑鉴定团鉴定为正品" class="jd" />';
		};
		html+='<div class="jg">¥<span>'+o["price"].substring(0,price_int)+'</span>'+o["price"].substring(price_int)+'</div>';
		html+='<div class="bg"></div>';
		if(o.edit_url){
		  html+='<a target="_blank" href="' + o["edit_url"] + '" class="bj">编辑</a>';
		};	
		if(hasCredential&&o.give_money != "0.00"){
			 html+='<div class="give_money">佣金：'+o.give_money+'</div>';
		};    
		html+='</div><div class="info">';
		html+='<div class="pinpai">';
		html+='<a class="'+(o.like == true?'btnLike_ok':'btnLike')+'" href="javascript:;"><em>收藏<span>'+(o.like_count > 0 ? o.like_count : '')+'</span></em></a>';
			
		if (o.brand_id){
		  html+='<img src="/images/trade/brands/'+o.brand_id+'.gif" class="logo" alt="'+o.brand_name+'" title="'+o.brand_name+'" />';
		};    
		html+='</div>';  
		html+='<div class="btnBox">';
			
		if(o.freight_payer==1){
			html+='<img src="/images/trade/transparent.gif" alt="包邮" title="包邮" width="51" height="23" class="icon_by fl" />';
		};
		 html+='<em class="c_000">' + o.name + '</em>|'; 
		html+='<em>' + o.category_name + '</em>';
		html+='<em>'+o.styles.join("</em><em>")+'</em>';  
		html+='</div>';
		html+='  </div>';
		html+='</div>';
		html+=' </div>';
		return html;
	}	
};

$(function(){
  $("a").focus(function(){
    $(this).blur();    
  });  
  
  addTrackEvent();
  addEventForFeedbackBtn();
  addEventForSendFeedbackBtn();
});

function addTrackEvent(context)
{
    if (!context)
    {
      $context = $(document);
    }
    else
    {
      $context = $(context);
    }
    
    if ($('#no-track').length)
    {
      return;        
    }    
    
    $('[data-track]', $context).click(
      function (e)
      {                      
        e.stopPropagation();
        
        var keyTemplate = $(this).data('track');
        var key = parseKeywords(keyTemplate, $(this));                                

        commonClickLog(key, 'shihuo');
        commonGa(key);
      }
    );
    
    $('[data-track-block]', $context).each(
      function (index, element)
      {                         
        var $element = $(element);
        var keyTemplate = $element.data('track-block');                
                
        $('a', $element).click(
          function (e)
          {
            e.stopPropagation();
            
            var key = parseKeywords(keyTemplate, $(this));
            
            commonClickLog(key, 'shihuo');
            commonGa(key);
          }
        );        
      }
    );    
}

function parseKeywords(key, element)
{  
  var $element = $(element);
  var innerText = $.trim($element.text().replace(' ', ''));  
  var innerText = key.replace('{{innerText}}', innerText);   
  
  return innerText;
}

//returnTop
var returnTop = {
	init:function(){
		this.returnTop = $("#returnTop");
		this.returnTop.hide();
		var that = this;
		$(window).bind("scroll",function(){
			var w_t = getW().s;
			w_t>800?that.returnTop.fadeIn():that.returnTop.fadeOut(); //返回按钮
		});
	}
};

//固定选项栏
var fixedSelect = {
	init:function(){
		var that = this;
		this.pos = $("#pos");
		this.selectWrap = $("#selectWrap");
		this.selectBox = $("#selectBox");			
		this.selectInner = $("#selectInner");
		this.btn = $("#pos_ts");
		this.pos_t = this.pos.offset().top;
		this.h_no = false;
		 
		$(window).bind("scroll",function(){
			//clearTimeout(that.timer);
			//that.timer = setTimeout(function(){that.scrollFn();},100);
			that.scrollFn();				
		});	
		that.timer2 = 0;
		this.isShow = false; 
		
	},
	scrollFn:function(){
		var w_t = getW().s;
		var that = this;
		if(!this.h_no){
			this.selectWrap.height(this.selectWrap.outerHeight(true));
			this.h_no = true;
		};
		
		if(w_t>this.pos_t){	
			that.selectBox.hide();		
			this.isShow = true;		
			this.selectInner.addClass("pos_fixed");
			this.btn.bind("click",function(){
				if(that.isShow){
					clearTimeout(that.timer2);
					//that.timer2 = setTimeout(function(){				
						that.selectBox.slideDown(200);	
					//},500);
				};
			});
			this.btn.bind("mouseover",function(){
				if(that.isShow){
					clearTimeout(that.timer2);
						that.timer2 = setTimeout(function(){				
						that.selectBox.slideDown(200);	
					},250);
				};
			});		
			that.selectWrap.bind("mouseleave",function(){
				if(that.isShow){
					clearTimeout(that.timer2);
					that.timer2 = setTimeout(function(){
						that.selectBox.slideUp(150);	
					},250);				
				};
			});				
		}else{
			this.isShow = false;
			this.selectInner.removeClass("pos_fixed");
			clearTimeout(that.timer2);
			//that.selectBox.stop();
			that.selectBox.show();	
		};
	}
}

function addEventForFeedbackBtn()
{
  $('#btn-feedback').click(
    function (e)
    {
      e.preventDefault();
      e.stopPropagation();      
      openBox.show('fk_openBox');  
    }
  );
   $('#btn-feedback2').click(
    function (e)
    {
	
      e.preventDefault();
      e.stopPropagation();     
      openBox.show('fk_openBox2');  
    }
  );
}

function addEventForSendFeedbackBtn()
{
  $('#btn-send-feedback').click(
    function (e)
    {
      e.stopPropagation();
      e.preventDefault();
            
      var content = $('#content').val();
      var placeholder = $('#content').attr('placeholder');
      
      if (!content || content == placeholder)
      {
        alert('内容不能为空');
        
        return;          
      }            
            
      var email = $.trim($('#email').val());
      var placeholder = $('#email').attr('placeholder');

      if (email && email != placeholder)
      {
        var pattern = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
        
        var validity = pattern.test(email);
        
        if (!validity)
        {
          alert('邮箱地址不正确');
          
          return;
        }      
      }
      
      feedback();
    }
  );
}

function feedback()
{
  $.ajax($('#url-feedback').val(),    
    {
      data: 
      {
        email: $('#email').val() == $('#email').attr('placeholder') ? '' : $('#email').val(),
        content: $('#content').val() == $('#content').attr('placeholder') ? '': $('#content').val()
      },
      dataType: 'json',
      success: function (response)
      {
        alert(response.status.message);   
        
        if (response.status.code == 200)
        {
          openBox.hide('fk_openBox');
          
          $('#content').val('');
          $('#email').val('');
        }
      }
    }
  );  
}

//搜索下拉
var searchLink = {
		init:function(id){
			var that = this;
			if(!id){return false;}			
			this.input = $(id);		
			//this.input.val();
			this.zbqAboutSearch = $("#zbq-aboutSearch");
			this.zbqSearchSubmit = $("#zbq-searchSubmit");
			if(this.zbqSearchSubmit.val()==""){
				this.zbqSearchSubmit.val("产品名、品牌");				
			};
			this.zbqAboutSearch_inner = this.zbqAboutSearch.find("ul");
			this.l = 0;
			this.c = 0;
			this.old = [];
			
			this.input.focus(function(){				
				$(document).keyup(function(event){
					//alert(that.input.val());
					var event  = event || window.event;
					switch(event.keyCode){
						case 37: //左
							//alert("左");
						break;
						case 38: //上
							if(that.l>=1){
								that.c >1 ? that.c-- : that.c = that.l;
								that.setOn();
							};					
						break;
						case 39: //右
							//alert("右");
						break;
						case 40: //下
							if(that.l>=1){
								that.c < that.l ? that.c++ : that.c = 0;
								that.setOn();	
							};
						break;
						case 13 ://回车
							that.keyDownFn();							
							if(that.l>=1){	
								if($.trim(that.zbqSearchSubmit.val())!=""){
									location.href = that.zbqAboutSearch_li.eq(that.c-1).attr("href");
								};								
							};
						break;
						default:							
							that.keyDownFn();
						break;
					};	
				});
			});		
			this.input.blur(function(){
				clearInterval(that.timer);
				$(document).unbind("keyup");
			});	
		},
		keyDownFn:function(){
			var that = this;
			var text = that.input.val();				
				for(var i = 0;i<that.old.length;i++){
					if(text == that.old[i]["name"]){
						searchAbout = that.old[i]["text"];
						that.createHtml();								
						return false;
						break;
					};
				};
				if($.trim(text).length){	
					$.getJSON("/item/search", {q:text},function(data){									
						searchAbout = data;		
						var o = {};								
						o["name"] = text;
						o["text"] = searchAbout;	
						that.old.push(o);
						that.createHtml();
					});
				}else{
					that.zbqAboutSearch.hide();
				};	
		},
		setOn:function(){
			var that = this;
			that.zbqAboutSearch_li.removeClass("on");
			that.zbqAboutSearch_li.eq(that.c-1).addClass("on");		
		},
		bindA:function(){
			var that = this;
			this.zbqAboutSearch_li = this.zbqAboutSearch_inner.find("a");
			this.zbqAboutSearch_li.hover(function(){					
					that.zbqAboutSearch_li.removeClass("on");
					$(this).addClass("on");
				},function(){
					$(this).removeClass("on");
			});
		},
		createHtml:function(){
			var htmlText = "";			
			var brand_results = searchAbout["brand_results"],item_results = searchAbout["item_results"];
			var brand_results_l = brand_results.length || 0;
			var item_results_l = item_results.length || 0;
			this.l = brand_results_l + item_results_l;		
			for(var i = 0;i<brand_results_l;i++){
				var o = brand_results[i];
				htmlText+='<li><a href="'+o.link+'" data-track="search-{{'+o.name+'}}"><span class="text">'+o.name+'</span><span class="num">约'+o.count+'条结果</span></a></li>';
			};
			
			for(var t = 0;t<item_results_l;t++){
				var z = item_results[t];
				htmlText+='<li><a href="'+z.link+'" data-track="search-contains-{{'+z.name+'}}"><span class="text">'+z.name+'</span><span class="num">约'+z.count+'条结果</span></a></li>';
			};
		
			this.zbqAboutSearch_inner.html(htmlText);
			//var li = this.zb
			addTrackEvent(this.zbqAboutSearch_inner);
			if(this.l>0){
				this.zbqAboutSearch.show();
				this.bindA();
			}else{
				this.zbqAboutSearch.hide();			
			};			
		}
};

//首页焦点图
function IndexFocus(o){	
		this.box = $("#"+o["box"]);	
		this.box.css({left:0,top:0});
		this.num = $("#"+o["num"]);
		this.numLi = this.num.find("li");		
		this.l = this.numLi.length;
		var bigHtml = "";
		for(var i = 0;i<this.l;i++){
			this.numLi.eq(i).attr("num",i);
		//	var o = {};
		//		o.text = this.numLi.eq(i).attr("title");
		//		o.bsrc = this.numLi.eq(i).attr("bsrc");
		//		o.link = this.numLi.eq(i).attr("link");				
		//		bigHtml += '<li><a href="'+o.link+'" target="_blank" data-track="shouye-jd-'+i+'"><img src="'+o.bsrc+'" alt="'+o.text+'"  title="'+o.text+'"></a><div class="info">'+o.text+'</div><div class="bg"></div></li>';
		};
		var that = this;	
		//this.box.html(bigHtml);
		this.li = this.box.find("li");
		this.w = this.li.outerWidth(true);
		this.box.width(this.w*this.l);
		this.c = 0;
		this.move();
		this.numLi.bind("mouseover",function(){
			that.c = $(this).attr("num");
			clearInterval(that.timer);
			that.move(true);
		});
		this.autoPlay();
};
IndexFocus.prototype={
	autoPlay:function(){
		var that = this;
		this.timer = setInterval(function(){
			that.c < that.l-1?that.c++:that.c=0;
			that.move();
		},5000);
	},
	move:function(isClick){
		var that= this;
		var pos = -this.c*this.w;
		this.numLi.removeClass("on");
		this.numLi.eq(this.c).addClass("on");
		this.box.stop();
		this.box.animate({left:pos},function(){
			if(isClick){
				that.autoPlay();
			};
		});		
	}
};

//首页焦点图初始化
(function(){
	if($("#focusBig").length>0){
		var focus = new IndexFocus({box:"focusBig",num:"focusNum"});
	};
})();
//movePro
function ProMove(o){
	var that = this;
	this.ul = $("#"+o["ul"]);
	this.li =  this.ul.find("li");
	
	this.num = o["num"] ? $("#"+o["num"]):false;

	this.v = o["v"] || 4;	
	this.w  = this.li.outerWidth(true)*this.v;
	this.maxL = Math.ceil(this.li.length/this.v);
	for(var n = 0;n<this.v;n++){
		this.ul.append(this.li.eq(n).clone(true));
	};
	this.timer = null;
	
	this.ul.css({left:0});
	this.c = 0;
	if(o["num"]){	
		var numHtml = "";
		for(var i = 0;i<this.li.length;i++){
			numHtml += "<a href='javascript:void(0);' i="+i+">"+(i+1)+"</a>";
		};
		this.num.html(numHtml);
		this.numA = this.num.find("a");
		this.numA.bind("click",function(){
			that.c = $(this).attr("i");
			that.move(1);
		});
	};
	if(o["btnP"]){
		this.btnP = $("#"+o["btnP"]);		
		this.btnP[0].onclick = function(){
			if(that.c <= 0) {		
				that.c=that.maxL;
				that.ul.css({left:-that.maxL*that.w});
			};
			that.c--;			
			that.move(1);			
		};
	};
	if(o["btnN"]){
		this.btnN = $("#"+o["btnN"]);
		this.btnN[0].onclick = function(){
			if(that.c >= that.maxL) {
				that.c = 0;
				that.ul.css({left:0});				
			};
			that.c++;			
			that.move(1);
		};
	};
	if(o["auto"]){
		this.autoPlay();
	};
	this.move();
	
};
ProMove.prototype = {
	move:function(test){
		var that= this;
		if(test){
			clearInterval(this.timer);
		};
		var pos = this.c * this.w;
		if(this.num){
			//document.title = this.num; 
			this.numA.removeClass("on");
			this.numA.eq(this.c).addClass("on");
		};
		this.ul.stop();
		this.ul.animate({left:-pos},function(){
			if(test){
				that.autoPlay();
			};
		});
	},
	autoPlay:function(){
		var that= this;
		clearInterval(this.timer);
		this.timer = setInterval(function(){		
			that.c<that.maxL-1 ? that.c ++ :that.c = 0;
			
			that.move();
		},3000);
	}
};

//
var shihuoPro = {
	init:function(id){
		var that = this;
		this.li = $("#"+id).find("li");
		this.li1 = this.li.eq(0);
		this.li2 = this.li.eq(1);
		this.li3 = this.li.eq(2);
		this.li4 = this.li.eq(3);
		this.pos = [{fx:"top",p:-135},{fx:"left",p:330},{fx:"left",p:-330},{fx:"top",p:135}];		
		this.time = 4000;
		this.c = 0;	
	
		this.li1.hover(function(){
			that.pos[0]["p"] = -135;
			clearInterval(that.timer1);
			$(this).find(".mask").stop();				
			$(this).find(".mask").animate({top:that.pos[0]["p"]},200);
		},function(){
			$(this).find(".mask").stop();
			$(this).find(".mask").animate({top:0},200,function(){
				that.autoPlay();
			});
		});
		this.li4.hover(function(){
			that.pos[3]["p"] = 135;
			clearInterval(that.timer1);
			$(this).find(".mask").stop();
			$(this).find(".mask").animate({top:that.pos[3]["p"]},200);
		},function(){
			$(this).find(".mask").stop();
			$(this).find(".mask").animate({top:0},200,function(){
				that.autoPlay();
			});
		});
		this.li2.hover(function(){
			that.pos[1]["p"] = 330;
			var fx = "left";
			clearInterval(that.timer1);
			$(this).find(".mask").stop();
			$(this).find(".mask").animate({left:that.pos[1]["p"]},200);
		},function(){
			$(this).find(".mask").stop();
			$(this).find(".mask").animate({left:0},200,function(){
				that.autoPlay();
			});
		});
		this.li3.hover(function(){
			that.pos[2]["p"] = -330;
			clearInterval(that.timer1);
			$(this).find(".mask").stop();
			$(this).find(".mask").animate({left:that.pos[2]["p"]},200);
		},function(){
			$(this).find(".mask").stop();
			$(this).find(".mask").animate({left:0},200,function(){
				that.autoPlay();
			});
		});
		that.li.eq(0).find(".mask").animate({top:that.pos[0]["p"]},500);
		that.autoPlay();
		this.d = 0;
	},
	autoPlay:function(){
		var that = this;
		clearInterval(that.timer1);
		this.timer1 = setInterval(function(){
			//document.title = that.d++;
			that.c < 3 ? that.c++ : that.c = 0;
			that.move();
		},that.time);
	},
	move:function(){
		var that = this;
		that.li.each(function(i){				
			if(that.c==i){
				switch(i){
					case 0 :
						that.li.eq(0).find(".mask").animate({top:that.pos[0]["p"]},500);
					break;
					case 1 :
						that.li.eq(1).find(".mask").animate({left:that.pos[1]["p"]},500);
					break;
					case 2 :
						that.li.eq(2).find(".mask").animate({left:that.pos[2]["p"]},500);
					break;
					case 3 :
						that.li.eq(3).find(".mask").animate({top:that.pos[3]["p"]},500);
					break;						
				};						
			}else{
				switch(i){
					case 0 :
						that.li.eq(0).find(".mask").animate({top:0},500);
					break;
					case 1 :
						that.li.eq(1).find(".mask").animate({left:0},500);
					break;
					case 2 :
						that.li.eq(2).find(".mask").animate({left:0},500);
					break;
					case 3 :
						that.li.eq(3).find(".mask").animate({top:0},500);
					break;						
				};			
			};
		});
	}
};

function SelectFn(o){
		var that= this;
		this.box = $(o.box);
		this.input = $(o.text);
		this.selectBox = $(o.selectBox);
			
		this.input.bind("click",function(){
			that.selectBox.show();
			return false;
		});
		this.selectBox.find("a").bind("click",function(){
			that.input.html($(this).html());
			that.selectBox.hide();
			return false;
		});
		$(document).bind("click",function(){
			that.selectBox.hide();
		});
};

function SelectFn(o){
		var that= this;
		this.box = $(o.box);
		this.input = $(o.text);
		this.selectBox = $(o.selectBox);
			
		this.input.bind("click",function(){
			that.selectBox.show();
			return false;
		});
		this.selectBox.find("a").bind("click",function(){
			that.input.html($(this).html());
			that.selectBox.hide();
			return false;
		});
		$(document).bind("click",function(){
			that.selectBox.hide();
		});
};


//提示
function tipCommon(str){
	if($("#tipCommon").length<=0){
		var tipHtml = "<div class='tipCommon' id='tipCommon'></div>";
		$("body").append(tipHtml);
	};
	var box = $("#tipCommon");
	box.html(str);
	var win = getW();		
	box.show();
	box.css({top:win.s+win.h/2-10,left:win.w/2-box.width()/2});
	setTimeout(function(){
		$("#tipCommon").fadeOut();
	},2000);
}
function showMsg(o){
	document.title = o;
};

//团购购买处理
$(document).ready(function(){
    
    $('#buynow').click(function(){
         $.ajax({  
            url:$(this).attr('data_link'),  
            dataType:'json',  
            data:{},    
            success:function(result) {  
                return true;
            },
            error:function(a,b,c){
               return true;
            }
        });  
    })
})

function addFavorite(o){
      var ctrl = (navigator.userAgent.toLowerCase()).indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL';
     if (document.all) { 
           try{
               
               window.external.addFavorite('http://www.shihuo.cn','识货 - 高性价比商品导购');
           }catch(err){
              alert('收藏失败\n您可以尝试通过快捷键' + ctrl + ' + D 加入到收藏夹~');
           }
           
      } else if (window.sidebar) { 
          o.attr("rel","sidebar");
          o.attr("href",'http://www.shihuo.cn');
       } else {　　　　//添加收藏的快捷键 
          alert('收藏失败\n您可以尝试通过快捷键' + ctrl + ' + D 加入到收藏夹~') 
      } 
}
$(document).ready(function(){
    $("#guanzhu_shoucang").find(".shoucang a").click(function(){
        __dace.sendEvent('shihuo_favourite');
        addFavorite($(this));
    });
})