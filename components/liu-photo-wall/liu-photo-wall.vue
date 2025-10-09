<template>
	<view class="main-info">
		<view class="item" :style="'background-color:'+bgColor[index]" :class="'item' + (index + 1)"
			v-for="(item, index) in dataList" :key="index" v-if="index < 21" @click.stop="clickItem(item)">
			<view class="item-name">{{item}}</view>
		</view>
	</view>
</template>
<script>
	export default {
		props: {
			dataList: {
				type: Array
			},
		},
		data() {
			return {
				bgColor: ['#58b9b3', '#d4584a', '#e58239', '#9ac656', '#60b257', '#387ff6', '#623ab2', '#9132ac',
					'#d04797', '#9d6947', '#333333', '#58b9b3', '#d4584a', '#e58239', '#9ac656', '#60b257', '#387ff6',
					'#623ab2', '#9132ac',
					'#d04797', '#9d6947', '#333333', '#58b9b3', '#d4584a', '#e58239', '#9ac656', '#60b257', '#387ff6',
					'#623ab2', '#9132ac',
					'#d04797', '#9d6947', '#333333'
				],
			}
		},
		methods: {
			clickItem(item) {
				this.$emit('change', item)
			}
		}
	};
</script>
<style lang="scss" scoped>
	.main-info {
		width: 100%;
		position: relative;
		text-align: center;
	}

	.item {
		text-align: center;
		border-radius: 4rpx;
		height: 48rpx;
		line-height: 48rpx;
		padding: 0 32rpx;

		.item-name {
			font-size: 30rpx;
			color: #f0f1f7;
			font-weight: bold;
		}
	}

	.item1 {
		position: absolute;
		right: 0;
		margin-top: 186rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -6.2s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate;
	}

	.item2 {
		position: absolute;
		right: 40rpx;
		margin-top: 48rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -9.2s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -3s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -3s infinite alternate;
	}

	.item3 {
		position: absolute;
		right: 40rpx;
		margin-top: 84rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -11.8s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -6s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -6s infinite alternate;
	}

	.item4 {
		position: absolute;
		right: 72rpx;
		margin-top: 240rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -14.3s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -9s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -9s infinite alternate;
	}

	.item5 {
		position: absolute;
		right: 208rpx;
		margin-top: 184rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -17s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -12s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -12s infinite alternate;
	}

	.item6 {
		position: absolute;
		right: 320rpx;
		margin-top: 24rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -19.7s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -15s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -15s infinite alternate;
	}

	.item7 {
		position: absolute;
		right: 500rpx;
		margin-top: 4rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -22.1s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -17.8s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -17.8s infinite alternate;
	}

	.item8 {
		position: absolute;
		right: 400rpx;
		margin-top: 120rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -24.4s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -19s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -19s infinite alternate;
	}

	.item9 {
		position: absolute;
		right: 492rpx;
		margin-top: 112rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -19.2s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -15s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -15s infinite alternate;
	}

	.item10 {
		position: absolute;
		right: 500rpx;
		margin-top: 236rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -22.5s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -17.8s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -17.8s infinite alternate;
	}

	.item11 {
		position: absolute;
		right: 580rpx;
		margin-top: 48rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -23.9s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -18.9s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -18.9s infinite alternate;
	}

	.item12 {
		position: absolute;
		right: 580rpx;
		margin-top: 200rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -8.8s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -3s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -3s infinite alternate;
	}

	.item13 {
		position: absolute;
		right: 580rpx;
		margin-top: 40rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -14.1s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -9s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -9s infinite alternate;
	}

	.item14 {
		position: absolute;
		right: 208rpx;
		margin-top: 4rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -17s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -12s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -12s infinite alternate;
	}

	.item15 {
		position: absolute;
		right: 460rpx;
		margin-top: 240rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -11.5s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -6s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -6s infinite alternate;
	}

	.item16 {
		position: absolute;
		right: 460rpx;
		margin-top: 20rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -6.5s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate;
	}

	.item17 {
		position: absolute;
		right: 492rpx;
		margin-top: 232rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -19.7s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -15s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -15s infinite alternate;
	}

	.item18 {
		position: absolute;
		right: 72rpx;
		margin-top: 120rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -14.7s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -9s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -9s infinite alternate;
	}

	.item19 {
		position: absolute;
		right: 40rpx;
		margin-top: 0;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -11.4s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -6s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -6s infinite alternate;
	}

	.item20 {
		position: absolute;
		right: 460rpx;
		margin-top: 108rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -6.9s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) 0s infinite alternate;
	}

	.item21 {
		position: absolute;
		right: 500rpx;
		margin-top: 112rpx;
		animation: animX-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -21.9s infinite alternate,
			animY-data-v-c5c85758 10s cubic-bezier(0.36, 0, 0.64, 1) -17.8s infinite alternate,
			scale-data-v-c5c85758 20s cubic-bezier(0.36, 0, 0.64, 1) -17.8s infinite alternate;
	}

	@keyframes animX-data-v-c5c85758 {
		0% {
			right: 0rpx;
		}

		to {
			right: 600rpx;
		}
	}

	@keyframes animY-data-v-c5c85758 {
		0% {
			top: 0;
			opacity: 0.05;
		}

		to {
			top: 60rpx;
			opacity: 1;
		}
	}

	@keyframes scale-data-v-c5c85758 {
		0% {
			transform: scale(0.7) rotateY(-180deg);
		}

		50% {
			transform: scale(1) rotateY(0deg);
		}

		to {
			transform: scale(0.7) rotateY(180deg);
		}
	}
</style>
