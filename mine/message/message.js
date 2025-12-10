Page({
    data: {
        messages: []
    },
    onLoad() {
        this.getMessages();
    },
    getMessages() {
        wx.showLoading({ title: '加载中' });

        wx.cloud.callFunction({
            name: 'markRead',
            success: res => {
                wx.hideLoading();
                if (res.result.success) {
                    const rawList = res.result.data || [];
                    const messages = rawList.map(msg => {
                        // 格式化时间
                        let timeDisplay = '';
                        if (msg.createTime) {
                            const date = new Date(msg.createTime);
                            timeDisplay = `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                        }

                        let senderName = '未知用户';
                        let senderAvatar = 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/默认头像.jpeg';

                        if (msg.senderInfo && msg.senderInfo.length > 0) {
                            senderName = msg.senderInfo[0].nickName || senderName;
                            senderAvatar = msg.senderInfo[0].avatarUrl || senderAvatar;
                        }

                        return {
                            ...msg,
                            timeDisplay,
                            senderName,
                            senderAvatar
                        };
                    });

                    this.setData({ messages });
                } else {
                    wx.showToast({ title: '加载失败', icon: 'none' });
                }
            },
            fail: err => {
                wx.hideLoading();
                console.error('云函数调用失败', err);
                wx.showToast({ title: '网络错误', icon: 'none' });
            }
        });
    },

    onPullDownRefresh() {
        this.getMessages();
        wx.stopPullDownRefresh();
    },

    onItemTap(e) {
        const articleId = e.currentTarget.dataset.articleid;
        // 检查是否有关联的ID，如果有则跳转
        if (articleId) {
            wx.navigateTo({
                url: `/home/read/detail/detail?id=${articleId}`,
                fail: err => {
                    console.error('跳转详情页失败', err);
                    wx.showToast({
                        title: '无法查看详情',
                        icon: 'none'
                    });
                }
            });
        } else {
            wx.showToast({
                title: '该消息无法跳转',
                icon: 'none'
            });
        }
    }
})
