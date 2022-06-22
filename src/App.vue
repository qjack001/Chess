<template>
	<board :board="board" :manual-turn="currentColor" :manaul-move="performAction"/>

	<button onclick="document.body.classList.toggle('flip')">FLIP</button>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import Board from './components/Board.vue'
	import { StartingBoard, Color, type PlayerAction, Type } from '@/constants'
	
	const board = ref(StartingBoard)
	const currentColor = ref<Color | false>(Color.WHITE)

	const performAction = (move: PlayerAction) => {
		let movingPiece = board.value[move.from[0]][move.from[1]]
		const destination = board.value[move.to[0]][move.to[1]]
		
		// draw animation

		if (destination.color != undefined) { // screen shake on attacks
			document.body.classList.add('shake')
		}


		if (movingPiece.type == Type.PAWN &&
			((movingPiece.color == Color.WHITE && move.to[0] == 0) ||
			(movingPiece.color == Color.BLACK && move.to[0] == board.value.length)))
		{
			// pawns that reach the end are turned into queens
			movingPiece = { type: Type.QUEEN, color: movingPiece.color }
		}

		board.value[move.to[0]][move.to[1]] = movingPiece
		board.value[move.from[0]][move.from[1]] = {}


		const nextColor = currentColor.value == Color.WHITE
			? Color.BLACK
			: Color.WHITE

		currentColor.value = false


		setTimeout(() => {
			document.body.classList.remove('shake')
			currentColor.value = nextColor
		}, 350)
	}
</script>

<style>
	:root
	{
		/*
		 * Set square-size to 1/7th of the window's shortest width (up to a
		 * maximum of 120px). This way, the full board can always be displayed,
		 * with half of a square's width of padding on either side. 
		 */
		--square-size: min(120px, 100vmin/7);

		--white: #999289;
		--black: #312e32;
		--background-white: #0f0e0e;
		--background-black: #000000;
		--white-accent: #471253;
		--black-accent: #785f3d;
	}

	body
	{
		background: var(--background-black);
		margin: calc(var(--square-size) / 2);
	}

	body.shake
	{
		animation: shake 0.35s infinite;
	}

	@keyframes shake
	{
		0% { transform: translate(5px, 5px); }
		25% { transform: translate(-5px, -5px); }
		60% { transform: translate(5px, 0px); }
		100% { transform: translate(0px, -5px); }
	}
</style>