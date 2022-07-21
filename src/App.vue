<template>
	<main>
		<board
			:board="board"
			:manual-turn="isManual ? currentColor : false"
			:manual-move="makeManualMove"
		/>
	</main>
	<footer class="controls">
		<div class="player-select">
			<player-selector :players="players" :onChange="onPlayerChange"/>
		</div>
		<div class="buttons">
			<custom-button text="About" to="https://github.com/qjack001/Chess"/>
			<custom-button text="Rotate" onclick="document.body.classList.toggle('flip')"/>
		</div>
	</footer>
	<animator :controller="animationController"/>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { StartingBoard, FullSized, Color, type PlayerAction, type Players, HumanPlayer } from '@/constants'
	import { toStandardChessNotation } from '@/rules'
	import * as GameController from '@/game-controller'
	import Board from '@/components/Board.vue'
	import Animator, { type AnimationController } from '@/components/Animator.vue'
	import PlayerSelector from '@/components/PlayerSelector.vue'
	import CustomButton from '@/components/CustomButton.vue'

	const urlParams = new URLSearchParams(window.location.search)

	// instantiate with a placeholder animate function
	const animationController = ref<AnimationController>({ animate: async () => {} })

	const board = ref(urlParams.has('full') ? FullSized : StartingBoard)
	const currentColor = ref<Color | false>(Color.WHITE)
	const isManual = ref<boolean>(true)
	const players = ref<Players>({
		[Color.WHITE]: HumanPlayer,
		[Color.BLACK]: HumanPlayer,
	})

	document.body.style.setProperty('--num-of-squares', `${board.value.length}`);

	const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

	const applyChanges = (next: GameController.GameState) => {
		board.value = next.board
		currentColor.value = next.currentColor
		isManual.value = (next.currentColor === false)
				? false
				: players.value[next.currentColor].isManual ?? false
	}

	const performAction = async (move: PlayerAction) => {
		if (currentColor.value === false) {
			return
		}

		const result = GameController.submitAction(board.value, currentColor.value, move)
		await animationController.value.animate(result.lastMove)
		applyChanges(result)

		console.log(toStandardChessNotation(result.lastMove.piece, result.lastMove.move))

		if (result.winner !== false) {
			alert(players.value[result.winner].name + ' wins!')
		}
	}

	const runBotMove = async (currentColor: Color) => {
		// deep clone so malicious bot cannot change source of truth
		const currentBoard = JSON.parse(JSON.stringify(board.value))
		await delay(400) // pretend the bot takes a second to think

		await performAction(players.value[currentColor]
			.move(currentBoard, currentColor))
	}

	const makeManualMove = (move: PlayerAction) => {
		isManual.value = false // suspend further interaction while action is completed
		performAction(move)
			.then(() => {
				// if the player is now a bot, run it's move
				if(!isManual.value && currentColor.value !== false) {
					runBotMove(currentColor.value)
				}
			}
		)
	}

	const onPlayerChange = async () => {
		isManual.value = (currentColor.value === false)
				? false
				: players.value[currentColor.value].isManual ?? false
		
		// run game if both players are bots (or just do the first move if current
		// player is and other is not).
		while (currentColor.value !== false && !players.value[currentColor.value].isManual) {
			await runBotMove(currentColor.value)
		}
	}
</script>

<style>
	:root
	{
		--white: #999289;
		--black: #312e32;
		--background-white: #0f0e0e;
		--background-black: #000000;
		--white-accent: #471253;
		--black-accent: #785f3d;
	}

	body
	{
		/*
		 * Set square-size to 1/7th of the window's shortest width (up to a
		 * maximum of 120px). This way, the full board can always be displayed,
		 * with half of a square's width of padding on either side. 
		 */
		--square-size: min(120px, 100vmin / calc(var(--num-of-squares) + 1));

		font-family: Menlo, monospace;
		background: var(--background-black);
		margin: calc(var(--square-size) / 2);
		position: relative;
	}

	body.shake
	{
		animation: shake 0.35s infinite;
	}

	footer.controls
	{
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: auto;
		margin-top: calc(var(--square-size) / 2);
		max-width: 600px;
	}

	.player-select, .buttons
	{
		display: inline;
	}

	.flippable
	{
		transition: transform 1.5s ease;
	}

	.flip .flippable
	{
		transform: rotate(180deg);
	} 

	@keyframes shake
	{
		0% { transform: translate(5px, 5px); }
		25% { transform: translate(-5px, -5px); }
		60% { transform: translate(5px, 0px); }
		100% { transform: translate(0px, -5px); }
	}
</style>