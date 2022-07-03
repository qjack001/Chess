<template>
	<div
		class="flippable animation-canvas"
		role="presentation"
		:style="`--animation-duration: calc(${ANIMATION_DURATION} * 1ms)`"
	>
		<div id="white-clip-path">
			<div id="white-piece">
				<chess-piece :color="Color.WHITE" :type="pieceType[Color.WHITE]"/>
			</div>	
		</div>
		<div id="black-clip-path">
			<div id="black-piece">
				<chess-piece :color="Color.BLACK" :type="pieceType[Color.BLACK]"/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, toRefs } from 'vue'
	import { Type, Color, type Piece, type PlayerAction } from '@/constants'
	import type { GameState } from '@/game-controller'
	import ChessPiece from '@/components/ChessPiece.vue'
	
	export type AnimationController = {
		animate: (lastMove: GameState['lastMove']) => Promise<void>
	}

	const props = defineProps<{
		controller: AnimationController,
	}>()

	const { controller } = toRefs(props)
	const pieceType = ref({
		[Color.WHITE]: Type.PAWN,
		[Color.BLACK]: Type.PAWN,
	})

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
		left: calc(50vw - (var(--square-size) * 3.5));
		z-index: 9;
		width: calc(var(--square-size) * 6);
		height: calc(var(--square-size) * 6);
		pointer-events: none;
	}

	#white-piece, #black-piece
	{
		width: var(--square-size);
		height: var(--square-size);
		overflow: hidden;
		position: absolute;
		padding-top: calc(var(--square-size) * 0.05);
		box-sizing: border-box;
	}

	.flip #white-piece, .flip #black-piece
	{
		padding-top: calc(var(--square-size) * 0.02);
	}

	#white-clip-path, #black-clip-path
	{
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
		opacity: 0;
		transition: clip-path 0ms linear, opacity 200ms ease;
	}

	#white-clip-path.visible, #black-clip-path.visible
	{
		opacity: 1;
	}

	#white-clip-path.animate, #black-clip-path.animate
	{
		transition: clip-path var(--animation-duration) cubic-bezier(.5, 0, 1, .5),
			opacity 200ms ease;
	}

	#white-clip-path.animate-finish, #black-clip-path.animate-finish
	{
		transition: clip-path var(--animation-duration) cubic-bezier(0, .5, .5, 1),
			opacity 200ms ease !important;
	}

	#white-clip-path
	{
		background-image: linear-gradient(#6e1283, #471253);
		opacity: 0;
	}

	#black-clip-path
	{
		background-image: linear-gradient(#a48c6a, #785f3d);
		opacity: 0;
	}
</style>