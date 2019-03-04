// pages/scene/scene.js
var app = getApp();
var cfg = {
  photo: {},
  template: {},
  scale: 1,
};
var SCALE = {
  MIN: 0.1,
  MAX: 2,
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    templates: [{
      cover: '../../img/1.png',
    }, {
      cover: '../../img/2.png',
    }, {
      cover: '../../img/3.png',
    }, {
      cover: '../../img/4.png',
    }, {
      cover: '../../img/5.png',
    }, {
      cover: '../../img/6.png',
    },{
      cover: '../../img/7.png', 
    }, {
      cover: '../../img/8.png',
    },{
      cover: '../../img/9.png',
    },{
      cover: '../../img/10.png',
    },{
      cover: '../../img/11.png',
    }],
    currentNewScene: 0,
    canvasWidth: 0,
    canvasHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //设置画布的大小
    this.setCanvasSize();
  },

  setCanvasSize: function() {
    var uploadData = app.globalData.uploadData;
    var that = this;

    //先要知道容器的高度和宽度
    wx.createSelectorQuery().select('#scene-editor').boundingClientRect(function(canvasWrapper) {
      cfg.canvasWrapper = canvasWrapper;

      //要知道图片原始高度和宽度
      wx.getImageInfo({
        src: uploadData.tempFilePaths[0],
        success(res) {
          // console.log(res);
          cfg.photo.path = res.path;
          var originalHeight = cfg.photo.originalHeight = res.height;
          var originalWidth = cfg.photo.originalWidth = res.width;

          //画布的高度、宽度
          if (originalHeight / originalWidth > canvasWrapper.height / canvasWrapper.width) {
            cfg.canvasHeight = canvasWrapper.height;
            cfg.canvasWidth = originalWidth * cfg.canvasHeight / originalHeight;
          } else {
            cfg.canvasWidth = canvasWrapper.width;
            cfg.canvasHeight = originalHeight * cfg.canvasWidth / originalWidth
          }

          that.setData({
            canvasWidth: cfg.canvasWidth,
            canvasHeight: cfg.canvasHeight
          });

          that.drawNewScene(that.data.currentNewScene);
        }
      })
    }).exec();
  },

  drawNewScene: function(index) {
    var uploadData = app.globalData.uploadData;
    var templates = this.data.templates;
    var ctx = wx.createCanvasContext("scene");

    wx.getImageInfo({
      src: templates[index].cover,
      success(res) {
        var width = cfg.template.originalWidth = res.width;
        var height = cfg.template.originalHeight = res.height;
        cfg.template.x = cfg.canvasWidth - 100;
        cfg.template.y = cfg.canvasHeight - 100;
        cfg.template.cover = templates[index].cover;

        ctx.drawImage(uploadData.tempFilePaths[0], 0, 0, cfg.canvasWidth, cfg.canvasHeight);
        ctx.drawImage(templates[index].cover, cfg.canvasWidth - 100, cfg.canvasHeight-100, 100, 100 * height / width);
        ctx.draw();
      }
    })
  },

  onTapScene: function(event) {
    var index = event.currentTarget.dataset.index;

    this.setData({
      currentNewScene: index
    });

    this.drawNewScene(index);
  },

  startMove: function(event) {
    var touchPoint = event.touches[0];
    var x = cfg.template.x;
    var y = cfg.template.y;
    cfg.offsetX = touchPoint.clientX - x;
    cfg.offsetY = touchPoint.clientY - y;
  },

  startZoom: function(event) {
    var xMore = event.touches[1].clientX - event.touches[0].clientX;
    var yMore = event.touches[1].clientY - event.touches[0].clientY;
    cfg.initialDistance = Math.sqrt(xMore * xMore + yMore * yMore);

  },

  onTouchStart: function(event) {
    if (event.touches.length > 1) {
      //开始缩放
      this.startZoom(event);
    } else {
      //开始移动
      this.startMove(event);
    }
  },

  zoom: function(event) {
    var xMore = event.touches[1].clientX - event.touches[0].clientX;
    var yMore = event.touches[1].clientY - event.touches[0].clientY;

    cfg.curDistance = Math.sqrt(xMore * xMore + yMore * yMore);
    cfg.scale = Math.min(cfg.scale + 0.001 * (cfg.curDistance - cfg.initialDistance), SCALE.MAX);
    cfg.scale = Math.max(cfg.scale, SCALE.MIN);

    var uploadData = app.globalData.uploadData;
    var ctx = wx.createCanvasContext("scene");
    var template = cfg.template;
    var newWidth = 100 * cfg.scale;
    var newHight = newWidth * template.originalHeight / template.originalWidth;

    ctx.drawImage(uploadData.tempFilePaths[0], 0, 0, cfg.canvasWidth, cfg.canvasHeight);
    ctx.drawImage(template.cover, template.x, template.y, newWidth, newHight);
    ctx.draw();
  },

  move: function(event) {
    var touchPoint = event.touches[0];
    var uploadData = app.globalData.uploadData;
    var x = touchPoint.clientX - cfg.offsetX;
    var y = touchPoint.clientY - cfg.offsetY;
    var ctx = wx.createCanvasContext("scene");
    cfg.template.x = x;
    cfg.template.y = y;
    var newWidth = 100 * cfg.scale;
    var newHight = newWidth * cfg.template.originalHeight / cfg.template.originalWidth;

    ctx.drawImage(uploadData.tempFilePaths[0], 0, 0, cfg.canvasWidth, cfg.canvasHeight);
    ctx.drawImage(cfg.template.cover, x, y, newWidth, newHight);
    ctx.draw();
  },

  onTouchMove: function(event) {
    if (event.touches.length > 1) {
      //缩放中
      this.zoom(event);
    } else {
      //离上次结束小于600ms不处理，解决缩放bug
      if(new Date().getTime() - cfg.endTime < 600) {
        return;
      }
      //移动中
      this.move(event);
    }
  },

  onTouchEnd: function() {
    const date = new Date();
    cfg.endTime = date.getTime();
  },

  downloadPic: function() {
    wx.canvasToTempFilePath({
      width: cfg.canvasWidth,
      height: cfg.canvasHeight,
      destWidth: cfg.canvasWidth * 2,
      destHeight: cfg.canvasHeight * 2,
      canvasId: 'scene',
      success: function(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showToast({
              title: '保存成功',
            });
          }
        })
      }
    }, this)
  }
})