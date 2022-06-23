<template>
	<button v-if="onclick" :onclick="onclick">
		{{ tooltip }}
	</button>
	<a  v-else-if="to" :href="to" target="_blank">
		{{ tooltip }}
	</a>
</template>

<script setup lang="ts">
	defineProps<{
		tooltip: string,
		to?: string,
		onclick?: string,
	}>()
</script>

<style scoped>
	button, a
	{
		display: inline-block;
		background: #1b1a1d;
		color: var(--white);
		font-family: inherit;
		font-size: 1rem;
		line-height: 1.4;
		margin-inline-start: 1ch;

		text-decoration: none;
		text-align: center;

		box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		padding: 0.4rem 1ch calc(0.4rem + 3px);
		cursor: pointer;
		outline: none;
	}

	button:focus-visible, a:focus-visible
	{
		box-shadow:
			inset 0 -4px 0 0 rgba(0, 0, 0, 0.3),
			0 0 0 4px var(--background-black),
			0 0 0 5px var(--white);
	}
</style>