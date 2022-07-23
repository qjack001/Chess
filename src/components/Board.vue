<!--
	Renders an interactive game board
-->
<template>
	<section class="flippable game-board">
		<template v-for="(row, rowNumber) in board">
			<button
				v-for="(square, columnNumber) in row"
				:class="{
					'square': true,
					[getSquareColor(rowNumber, columnNumber)]: true,
					'selected': isSelected(rowNumber, columnNumber),
					'option': isOption(rowNumber, columnNumber, board),
				}"
				:disabled="manualTurn !== square.color && !isOption(rowNumber, columnNumber, board)"
				:onclick="() => select(rowNumber, columnNumber, board, manualMove)"
			>
				<chess-piece v-if="square.type != undefined" :type="square.type" :color="square.color"/>
			</button>
		</template>
	</section>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { useSound } from '@vueuse/sound'
	import { type ChessBoard, Color, type PlayerAction } from '@/constants'
	import { isLegalMove, willBeInCheck } from '@/rules'
	import ChessPiece from '@/components/ChessPiece.vue'

	defineProps<{
		board: ChessBoard,
		manualTurn: Color | false,
		manualMove: (move: PlayerAction) => void
	}>()

	const { play } = useSound('/public/sounds.mp3', { sprite: {
		'click': [3000, 300],
	}})

	const selectedRow = ref(-1)
	const selectedColumn = ref(-1)

	const getSquareColor = (rowNumber: number, columnNumber: number) => {
		const color = (rowNumber + columnNumber) % 2 == 0
					? Color.WHITE
					: Color.BLACK

		return Color[color]
	}

	const select = (rowNumber: number, columnNumber: number, board: ChessBoard, onAction: (move: PlayerAction) => void) => {
		if (isOption(rowNumber, columnNumber, board)) {
			onAction({
				from: [selectedRow.value, selectedColumn.value],
				to: [rowNumber, columnNumber],
			})
			selectedRow.value = -1
			selectedColumn.value = -1
		}
		else {
			// @ts-ignore
			play({ id: 'click' }) // sound effect

			// if not a legal option, select the piece instead
			selectedRow.value = rowNumber
			selectedColumn.value = columnNumber
		}
	}

	const isSelected = (rowNumber: number, columnNumber: number) => {
		return (rowNumber == selectedRow.value && columnNumber == selectedColumn.value)
	}

	const nothingSelected = () => {
		return (selectedRow.value == -1 && selectedColumn.value == -1)
	}

	const isOption = (rowNumber: number, columnNumber: number, board: ChessBoard) => {
		if (nothingSelected()) {
			return false
		}

		return isLegalMove(board, {
			from: [selectedRow.value, selectedColumn.value],
			to: [rowNumber, columnNumber],
		}) && !willBeInCheck(board, {
			from: [selectedRow.value, selectedColumn.value],
			to: [rowNumber, columnNumber],
		})
	}
</script>

<style scoped>
	section.game-board
	{
		display: grid;
		grid-template-columns: repeat(var(--num-of-squares), 1fr);
		width: calc(var(--num-of-squares) * var(--square-size));
		margin: auto;
	}

	button.square
	{
		display: block;
		width: var(--square-size);
		height: var(--square-size);
		overflow: hidden;
		position: relative;
		border: none;
		padding: 0;
		margin: 0;
		cursor: pointer;
	}

	button.square:disabled
	{
		cursor: default;
	}

	button.square.selected
	{
		box-shadow: inset 0 0 0 calc(var(--square-size) * 0.1) var(--white);
	}

	button.square.option::after
	{
		content: "";
		display: block;
		position: absolute;
		top: 40%;
		left: 40%;
		width: 20%;
		height: 20%;
		background: var(--white);
		box-shadow: 0 0 0 calc(var(--square-size) * 0.06) var(--background-color);
		border-radius: 100%;
	}

	.WHITE.square
	{
		background: var(--background-white);
		--background-color: var(--background-white);
	}
	.BLACK.square
	{
		background: var(--background-black);
		--background-color: var(--background-black);
	}
</style>