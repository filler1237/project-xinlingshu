// competition/pages/admin/exportResults/exportResults.js
Page({
  data: {
    activities: [],
    activityOptions: [{ id: '', name: '请选择活动' }],
    selectedActivityIndex: 0,
    selectedActivity: null,
    exporting: false,
    loading: true,
    exportHistory: []
  },

  onLoad() {
    this.loadActivities();
    this.loadExportHistory();
  },

  /**
   * 加载活动列表（只显示有评分的活动）
   */
  loadActivities() {
    this.setData({ loading: true });

    // 先获取所有活动
    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        status: 'all',
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        if (res.result.success && res.result.data) {
          const allActivities = res.result.data;
          
          // 检查每个活动是否有已评分的作品
          this.checkActivitiesWithScores(allActivities);
        } else {
          this.setData({ loading: false });
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({ loading: false });
        console.error('加载活动列表失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 检查活动是否有已评分的作品
   */
  checkActivitiesWithScores(activities) {
    if (!activities || activities.length === 0) {
      this.setData({ 
        loading: false,
        activities: [],
        activityOptions: [{ id: '', name: '请选择活动' }]
      });
      wx.showToast({
        title: '暂无活动',
        icon: 'none'
      });
      return;
    }

    // 并行检查每个活动是否有已评分的作品
    const checkPromises = activities.map(activity => {
      const activityId = activity.id || activity._id;
      
      return new Promise((resolve) => {
        const db = wx.cloud.database();
        db.collection('works')
          .where({
            activityId: activityId,
            status: db.command.neq('deleted'),
            judgeCount: db.command.gt(0), // 至少有一个评委评分
            averageScore: db.command.gt(0) // 平均分大于0
          })
          .count()
          .then(res => {
            resolve({
              activity: activity,
              hasScores: res.total > 0,
              workCount: res.total
            });
          })
          .catch(err => {
            console.error('检查活动评分失败:', err);
            resolve({
              activity: activity,
              hasScores: false,
              workCount: 0
            });
          });
      });
    });

    Promise.all(checkPromises).then(results => {
      // 只保留有评分的活动
      const activitiesWithScores = results
        .filter(result => result.hasScores)
        .map(result => ({
          ...result.activity,
          scoredWorkCount: result.workCount
        }));

      this.setData({ loading: false });

      if (activitiesWithScores.length === 0) {
        wx.showToast({
          title: '暂无有评分的活动',
          icon: 'none',
          duration: 2000
        });
      }

      const options = [
        { id: '', name: '请选择活动' },
        ...activitiesWithScores.map(a => ({
          id: a.id || a._id,
          name: `${a.theme || a.title || '未命名活动'} (${a.scoredWorkCount}个已评分)`
        }))
      ];

      this.setData({
        activities: activitiesWithScores,
        activityOptions: options
      });
    });
  },

  /**
   * 活动选择改变
   */
  onActivityChange(e) {
    const index = e.detail.value;
    const activityId = this.data.activityOptions[index].id;
    
    this.setData({
      selectedActivityIndex: index
    });
    
    if (activityId) {
      const activity = this.data.activities.find(a => 
        (a.id === activityId || a._id === activityId)
      );
      
      if (activity) {
        this.setData({
          selectedActivity: activity
        });
      }
    } else {
      this.setData({
        selectedActivity: null
      });
    }
  },

  /**
   * 导出结果
   */
  onExport() {
    const activity = this.data.selectedActivity;
    
    if (!activity) {
      wx.showToast({
        title: '请先选择活动',
        icon: 'none'
      });
      return;
    }

    // 再次确认活动有已评分的作品
    if (!activity.scoredWorkCount || activity.scoredWorkCount === 0) {
      wx.showToast({
        title: '该活动暂无已评分的作品',
        icon: 'none',
        duration: 3000
      });
      return;
    }

    wx.showModal({
      title: '确认导出',
      content: `确定要导出"${activity.theme || activity.title}"的活动结果吗？\n\n将导出 ${activity.scoredWorkCount} 个已评分的作品。`,
      success: (res) => {
        if (res.confirm) {
          this.doExport(activity.id || activity._id);
        }
      }
    });
  },

  /**
   * 执行导出
   */
  doExport(activityId) {
    this.setData({ exporting: true });

    wx.showLoading({
      title: '正在导出...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'exportActivityResults',
      data: {
        activityId: activityId
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({ exporting: false });
        
        console.log('📥 导出云函数返回结果:', res);
        console.log('📊 返回数据:', res.result);
        
        if (res.result.success) {
          const exportData = res.result.data;
          console.log('✅ 导出数据:', exportData);
          
          // 如果云存储上传成功，获取下载链接
          if (exportData.fileID) {
            console.log('📁 文件已上传到云存储，fileID:', exportData.fileID);
            // 获取临时下载链接
            this.getFileDownloadUrl(exportData.fileID, exportData.fileName, exportData.totalCount);
            
            // 保存到历史记录
            this.saveExportHistory(exportData);
          } else if (exportData.csvContent) {
            console.log('📄 返回CSV内容，长度:', exportData.csvContent.length);
            // 如果返回了CSV内容，提供多种查看方式
            this.handleCSVContent(exportData.csvContent, exportData.fileName, exportData.totalCount);
            
            // 保存到历史记录
            this.saveExportHistory({
              ...exportData,
              fileID: 'local_' + Date.now() // 本地文件标记
            });
          } else {
            console.warn('⚠️ 导出数据格式异常:', exportData);
            wx.showModal({
              title: '导出成功',
              content: `文件已生成：${exportData.fileName || '未知文件'}\n\n共导出 ${exportData.totalCount || 0} 条记录\n\n请查看云开发控制台的存储管理`,
              confirmText: '知道了',
              showCancel: false
            });
          }
        } else {
          console.error('❌ 导出失败:', res.result);
          wx.showToast({
            title: res.result.message || '导出失败',
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ exporting: false });
        console.error('导出失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  /**
   * 获取文件下载链接并提示用户
   */
  getFileDownloadUrl(fileID, fileName, totalCount) {
    console.log('🔗 开始获取下载链接，fileID:', fileID);
    wx.showLoading({
      title: '获取下载链接...',
      mask: true
    });

    // 获取临时下载链接
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        wx.hideLoading();
        console.log('✅ 获取下载链接成功:', res);
        
        if (res.fileList && res.fileList.length > 0) {
          const fileInfo = res.fileList[0];
          const downloadUrl = fileInfo.tempFileURL;
          console.log('📥 下载链接:', downloadUrl);
          
          // 直接显示下载链接，让用户复制
          wx.showModal({
            title: '✅ 导出成功！',
            content: `文件已生成：${fileName}\n\n共导出 ${totalCount} 条记录\n\n下载链接：\n${downloadUrl}\n\n请复制链接到浏览器中打开下载`,
            confirmText: '复制链接',
            cancelText: '下载到本地',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 复制下载链接到剪贴板
                wx.setClipboardData({
                  data: downloadUrl,
                  success: () => {
                    console.log('✅ 链接已复制到剪贴板');
                    wx.showModal({
                      title: '✅ 链接已复制',
                      content: `下载链接已复制到剪贴板！\n\n操作步骤：\n1. 在电脑浏览器中打开\n2. 粘贴链接并访问\n3. 文件会自动下载\n\n链接：${downloadUrl}`,
                      confirmText: '知道了',
                      showCancel: false
                    });
                  },
                  fail: (err) => {
                    console.error('❌ 复制失败:', err);
                    wx.showToast({
                      title: '复制失败，请手动复制',
                      icon: 'none',
                      duration: 3000
                    });
                  }
                });
              } else {
                // 下载到本地
                console.log('📥 用户选择下载到本地');
                this.downloadFileToLocal(fileID, fileName);
              }
            }
          });
        } else {
          console.error('❌ 获取下载链接失败，fileList为空');
          wx.showToast({
            title: '获取下载链接失败',
            icon: 'none'
          });
          // 尝试直接下载
          this.downloadFileToLocal(fileID, fileName);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('❌ 获取下载链接失败:', err);
        // 如果获取链接失败，尝试直接下载
        this.downloadFileToLocal(fileID, fileName);
      }
    });
  },

  /**
   * 下载文件到本地（从云存储）
   */
  downloadFileToLocal(fileID, fileName) {
    console.log('📥 开始下载文件到本地，fileID:', fileID);
    wx.showLoading({
      title: '正在下载...',
      mask: true
    });

    // 下载云存储文件
    wx.cloud.downloadFile({
      fileID: fileID,
      success: (res) => {
        console.log('✅ 文件下载成功，临时路径:', res.tempFilePath);
        wx.hideLoading();
        
        // 保存文件到本地
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            console.log('✅ 文件保存成功，路径:', saveRes.savedFilePath);
            wx.showModal({
              title: '✅ 下载成功',
              content: `文件已保存到本地\n\n文件名：${fileName}\n\n保存路径：${saveRes.savedFilePath}\n\n注意：小程序本地文件无法直接在文件管理器中打开，建议使用"复制链接"方式在浏览器中下载`,
              confirmText: '知道了',
              showCancel: false
            });
          },
          fail: (err) => {
            console.error('❌ 保存文件失败:', err);
            wx.showToast({
              title: '保存失败，请使用复制链接方式',
              icon: 'none',
              duration: 3000
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('❌ 下载文件失败:', err);
        wx.showModal({
          title: '下载失败',
          content: `下载失败，请尝试以下方式：\n\n1. 使用"复制链接"方式\n2. 在云开发控制台的存储管理中查看\n3. 文件ID：${fileID}`,
          confirmText: '知道了',
          showCancel: false
        });
      }
    });
  },

  /**
   * 处理CSV内容（提供多种查看方式）
   */
  handleCSVContent(csvContent, fileName, totalCount) {
    wx.showModal({
      title: '导出成功',
      content: `文件已生成：${fileName}\n\n共导出 ${totalCount} 条记录\n\n请选择查看方式：`,
      confirmText: '复制内容',
      cancelText: '查看内容',
      success: (modalRes) => {
        if (modalRes.confirm) {
          // 复制CSV内容到剪贴板
          wx.setClipboardData({
            data: csvContent,
            success: () => {
              wx.showModal({
                title: '内容已复制',
                content: `CSV内容已复制到剪贴板\n\n您可以将内容粘贴到Excel中保存\n\n提示：在Excel中选择"数据" -> "从文本/CSV"导入`,
                confirmText: '知道了',
                showCancel: false
              });
            },
            fail: (err) => {
              console.error('复制失败:', err);
              wx.showToast({
                title: '复制失败，请重试',
                icon: 'none'
              });
            }
          });
        } else {
          // 显示CSV内容（前1000个字符）
          const previewContent = csvContent.length > 1000 
            ? csvContent.substring(0, 1000) + '\n\n...（内容已截断，请复制完整内容）'
            : csvContent;
          
          wx.showModal({
            title: 'CSV文件内容',
            content: previewContent,
            confirmText: '复制全部',
            cancelText: '关闭',
            success: (copyRes) => {
              if (copyRes.confirm) {
                wx.setClipboardData({
                  data: csvContent,
                  success: () => {
                    wx.showToast({
                      title: '已复制全部内容',
                      icon: 'success'
                    });
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  /**
   * 保存导出历史
   */
  saveExportHistory(exportData) {
    try {
      const history = wx.getStorageSync('exportHistory') || [];
      history.unshift({
        activityId: this.data.selectedActivity.id || this.data.selectedActivity._id,
        activityName: exportData.activityName,
        fileName: exportData.fileName,
        fileID: exportData.fileID,
        exportTime: this.formatTime(new Date()),
        totalCount: exportData.totalCount
      });
      
      // 只保留最近10条
      if (history.length > 10) {
        history.splice(10);
      }
      
      wx.setStorageSync('exportHistory', history);
      this.loadExportHistory();
    } catch (error) {
      console.error('保存导出历史失败:', error);
    }
  },

  /**
   * 加载导出历史
   */
  loadExportHistory() {
    try {
      const history = wx.getStorageSync('exportHistory') || [];
      this.setData({
        exportHistory: history
      });
    } catch (error) {
      console.error('加载导出历史失败:', error);
    }
  },

  /**
   * 从历史记录下载文件
   */
  onDownloadFile(e) {
    const fileID = e.currentTarget.dataset.fileid;
    const fileName = e.currentTarget.dataset.filename;
    
    // 如果是本地文件标记，提示用户
    if (fileID && fileID.startsWith('local_')) {
      wx.showToast({
        title: '该文件为本地导出，请重新导出',
        icon: 'none',
        duration: 3000
      });
      return;
    }
    
    if (fileID) {
      // 获取下载链接
      this.getFileDownloadUrl(fileID, fileName, 0);
    } else {
      wx.showToast({
        title: '文件不存在',
        icon: 'none'
      });
    }
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
});

