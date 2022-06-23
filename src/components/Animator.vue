<template>
	<div class="flippable animation-canvas" role="presentation">
		<!-- <chess-piece :color="Color.WHITE" :type="Type.KING"/> -->
	</div>
</template>

<script setup lang="ts">
	import { toRefs } from 'vue'
	import { Type, Color } from '@/constants'
	import type { GameState } from '@/game-controller'
	import ChessPiece from '@/components/ChessPiece.vue'
	
	export type AnimationController = {
		animate: (lastMove: GameState['lastMove']) => void
	}

	const props = defineProps<{
		controller: AnimationController,
	}>()

	const { controller } = toRefs(props)

	controller.value.animate = async (move: GameState['lastMove']) => {
		const delay = (ms: number) => new Promise(res => setTimeout(res, ms))
		
		
		if (move.attack) {
			document.body.classList.add('shake')
			setTimeout(() => {
				document.body.classList.remove('shake')
			}, 300)
		}

		await delay(100)
	}
</script>

<style scoped>
	.animation-canvas
	{
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9;
		width: calc(var(--square-size) * 6);
		height: calc(var(--square-size)* 6);
		pointer-events: none;
	}
</style>