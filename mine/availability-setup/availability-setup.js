// pages/mine/availability-setup/availability-setup.js
const db = wx.cloud.database();
const _ = db.command;

// 生成默认的 09:00 - 18:00 时间槽
const generateDefaultSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    for (let h = startHour; h < endHour; h++) {
        if (h === 12) continue; // 午休
        const startStr = `${h.toString().padStart(2, '0')}:00`;
        const endStr = `${(h + 1).toString().padStart(2, '0')}:00`;
        slots.push({
            startTime: startStr,
            endTime: endStr,
            status: 'unavailable' // 默认为忙碌，让老师主动勾选
        });
    }
    return slots;
};

Page({
    data: {
        // 老师列表 (需与云函数保持一致，或者后续改为动态拉取)
        teachers: [
            { id: 0, name: '王贞贞' },
            { id: 1, name: '姚双雁' },
            { id: 2, name: '李亚玲' }
        ],
        currentTeacherIndex: 0,

        mode: 'weekly', // 'weekly' or 'specific'

        // 周模式数据
        weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        currentWeekDay: 1, // 默认周一

        // 特定日期模式数据
        currentDate: '',

        timeSlots: [],
        isSaving: false
    },

    onLoad(options) {
        //不仅设置今天日期
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        this.setData({
            currentDate: dateStr,
            currentWeekDay: now.getDay() // 默认选中今天是星期几，方便直接操作
        });

        this.fetchData();
    },

    // 切换老师
    onTeacherChange(e) {
        this.setData({ currentTeacherIndex: Number(e.detail.value) });
        this.fetchData();
    },

    // 切换模式
    switchMode(e) {
        const mode = e.currentTarget.dataset.mode;
        this.setData({ mode });
        this.fetchData();
    },

    // 切换星期
    selectWeekDay(e) {
        const day = Number(e.currentTarget.dataset.day);
        this.setData({ currentWeekDay: day });
        this.fetchData();
    },

    // 选择日期
    onDateChange(e) {
        this.setData({ currentDate: e.detail.value });
        this.fetchData();
    },

    // 核心：拉取数据
    fetchData() {
        const { mode, teachers, currentTeacherIndex, currentWeekDay, currentDate } = this.data;
        const teacherId = teachers[currentTeacherIndex].id;

        wx.showLoading({ title: '加载中...' });

        // 构造请求参数
        let payload = {
            type: 'get',
            teacherId: teacherId,
            data: {}
        };

        if (mode === 'weekly') {
            payload.data = {
                queryType: 'weekly',
                queryData: { dayOfWeek: currentWeekDay }
            };
        } else {
            // 特定日期模式需要同时传 date 和 dayOfWeek 以便计算继承
            const dateObj = new Date(currentDate);
            const dayOfWeek = dateObj.getDay();

            payload.data = {
                queryType: 'specific',
                queryData: {
                    date: currentDate,
                    dayOfWeek: dayOfWeek
                }
            };
        }

        // 调用云函数获取数据（绕过前端数据库权限限制）
        wx.cloud.callFunction({
            name: 'updateAvailability',
            data: payload
        }).then(res => {
            wx.hideLoading();
            if (!res.result.success) {
                console.error('Fetch failed:', res.result.message);
                this.setData({ timeSlots: generateDefaultSlots() });
                return;
            }

            const resultData = res.result.data;

            if (mode === 'weekly') {
                // 周模式逻辑
                if (resultData && resultData.length > 0) {
                    this.setData({ timeSlots: resultData[0].timeSlots });
                } else {
                    this.setData({ timeSlots: generateDefaultSlots() });
                }
            } else {
                // 特定日期模式逻辑
                const { specific, weekly } = resultData;
                let finalSlots = [];

                if (specific && specific.length > 0) {
                    // 有明确覆盖
                    finalSlots = specific[0].timeSlots;
                } else if (weekly && weekly.length > 0) {
                    // 继承周模板
                    finalSlots = weekly[0].timeSlots;
                } else {
                    // 默认
                    finalSlots = generateDefaultSlots();
                }
                this.setData({ timeSlots: finalSlots });
            }

        }).catch(err => {
            wx.hideLoading();
            console.error('Cloud function call failed', err);
            this.setData({ timeSlots: generateDefaultSlots() });
        });
    },

    // 切换时间槽状态
    toggleSlot(e) {
        const index = e.currentTarget.dataset.index;
        const slots = this.data.timeSlots;
        const slot = slots[index];

        // 状态翻转
        slot.status = slot.status === 'available' ? 'unavailable' : 'available';

        this.setData({
            [`timeSlots[${index}]`]: slot
        });
    },

    // 保存设置
    saveSettings() {
        this.setData({ isSaving: true });
        const { mode, teachers, currentTeacherIndex, currentWeekDay, currentDate, timeSlots } = this.data;
        const teacherId = teachers[currentTeacherIndex].id;

        let payload = {};
        if (mode === 'weekly') {
            payload = {
                type: 'weekly',
                teacherId: teacherId,
                data: {
                    dayOfWeek: currentWeekDay,
                    timeSlots: timeSlots
                }
            };
        } else {
            payload = {
                type: 'specific',
                teacherId: teacherId,
                data: {
                    date: currentDate,
                    timeSlots: timeSlots
                }
            };
        }

        wx.cloud.callFunction({
            name: 'updateAvailability',
            data: payload
        }).then(res => {
            this.setData({ isSaving: false });
            if (res.result.success) {
                wx.showToast({ title: '保存成功', icon: 'success' });
            } else {
                wx.showToast({ title: '保存失败', icon: 'none' });
            }
        }).catch(err => {
            this.setData({ isSaving: false });
            console.error('Save failed', err);
            wx.showToast({ title: '调用失败', icon: 'none' });
        });
    }
})
