<!--
	Renders a chess piece
-->
<template>
	<div :class="`flippable piece ${Color[color]}`">
		{{ renderPiece(type) }}
	</div>
</template>

<script setup lang="ts">
	import { Type, Color } from '@/constants'

	defineProps<{
		type: Type,
		color: Color
	}>()

	const renderPiece = (type: Type) => {
		switch (type) {
			case Type.KING:   return '♚'
			case Type.QUEEN:  return '♛'
			case Type.BISHOP: return '♝'
			case Type.KNIGHT: return '♞'
			case Type.ROOK:   return '♜'
			case Type.PAWN:   return '♟'
		}
	}
</script>

<style scoped>
	.piece
	{
		font-size: calc(var(--square-size) * 0.8);
		transform: translateY(calc(var(--square-size) * -0.075));
		width: 100%;
		text-align: center;
		user-select: none;
		pointer-events: none;
	}

	.flip .piece
	{
		transform: rotate(180deg) translateY(calc(var(--square-size) * -0.075));
	}

	.WHITE { color: var(--white); }
	.BLACK { color: var(--black); }
</style>