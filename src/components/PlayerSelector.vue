<template>
	<label for="player-select-white">
		Player for the white team
	</label>
	<select
		v-model="players[Color.WHITE]"
		v-on:change="onChange"
		id="player-select-white"
		class="white"
	>
		<option
			v-for="option in options"
			:value="option"
		>
			{{ option.name }}
		</option>
	</select>
	<p class="vs-text">
		VS
	</p>
	<label for="player-select-black">
		Player for the black team
	</label>
	<select
		v-model="players[Color.BLACK]"
		v-on:change="onChange"
		id="player-select-black"
		class="black"
	>
		<option
			v-for="option in options"
			:value="option"
		>
			{{ option.name }}
		</option>
	</select>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { type Player, type Players, type Bot, HumanPlayer, Color } from '@/constants'
	import * as importedBots from '@/bots'

	defineProps<{
		players: Players,
		onChange: () => void,
	}>()

	const bots: Bot[] = []
	for (let name in importedBots) {
		// @ts-ignore
		bots.push(importedBots[name])
	}

	const options = ref<Player[]>([HumanPlayer, ...bots])
</script>

<style scoped>
	.vs-text
	{
		display: inline;
		color: var(--white);
		font-size: 0.8rem;
		margin: 0 0.5ch;
	}

	/* visually hide select labels.
	 */
	label
	{
		border: 0;
		clip: rect(0 0 0 0);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		width: 1px;
	}

	select
	{
		color: var(--foreground);
		background-color: var(--background);

		box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		padding: 0.4rem 1ch calc(0.4rem + 3px);

		-webkit-appearance: none;
		font-size: 1rem;
		font-family: inherit;
		outline: none;
		cursor: pointer;
	}

	select:focus-visible
	{
		box-shadow:
			inset 0 -4px 0 0 rgba(0, 0, 0, 0.3),
			0 0 0 4px var(--background-black),
			0 0 0 5px var(--white);
	}

	select.white
	{
		--background: var(--white);
		--foreground: var(--background-black)
	}

	select.black
	{
		--background: var(--black);
		--foreground: var(--white)
	}
</style>