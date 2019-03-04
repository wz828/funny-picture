//index.js
//获取应用实例
const app = getApp()

Page({
  onUploadPhoto: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original','compressed'],
      sourceType: ['album','camera'],
      success(res) {
        app.globalData.uploadData = res;
        wx.navigateTo({
          url: '/pages/scene/scene',
        });
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths
      },
    })
  }
})
