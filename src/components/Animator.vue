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

	type Point = { x: number, y: number }

	const props = defineProps<{
		controller: AnimationController,
	}>()

	const { controller } = toRefs(props)
	const pieceType = ref({
		[Color.WHITE]: Type.PAWN,
		[Color.BLACK]: Type.PAWN,
	})

	const ANIMATION_DURATION = 300 // milliseconds
	const delay = (ms: number) => new Promise(res => setTimeout(res, ms))


	controller.value.animate = async (lastMove: GameState['lastMove']) => {
		const { move, attack, piece } = lastMove

		positionPiece(piece, move.to)
		await animateMovement(move, piece.color)
		if (attack) { shakeScreen() }
	}

	const animateMovement = async (move: PlayerAction, color: Color) => {
		const verticalMovement = Math.abs(move.to[0] - move.from[0])
		const horizontalMovement = Math.abs(move.to[1] - move.from[1])

		if (verticalMovement == horizontalMovement) {
			await animateDiagonal(move, color)
		}
		else if (verticalMovement == 0) {
			await animateHorizontal(move, color)
		}
		else if (horizontalMovement == 0) {
			await animateVertical(move, color)
		}
	}

	const positionPiece = (piece: Piece, location: [number, number]) => {
		const element = (piece.color == Color.WHITE)
				? document.getElementById('white-piece')
				: document.getElementById('black-piece')


		if (!element) {
			return
		}

		pieceType.value[piece.color] = piece.type
		element.style.top = `calc(${location[0]} * var(--square-size))`
		element.style.left = `calc(${location[1]} * var(--square-size))`
	}

	const setAnimation = (turnAnimationOn: boolean, color: Color, isEnd?: boolean) => {
		const element = (color == Color.WHITE)
				? document.getElementById('white-clip-path')
				: document.getElementById('black-clip-path')
		
		if (!element) {
			return
		}

		if (turnAnimationOn) {
			element.classList.add(isEnd ? 'animate-finish' : 'animate')
		}
		else {
			element.classList.remove('animate')
			element.classList.remove('animate-finish')
		}
	}
	
	const setClipPath = (points: Point[], color: Color) => {
		const element = (color == Color.WHITE)
				? document.getElementById('white-clip-path')
				: document.getElementById('black-clip-path')

		if (!element) {
			return
		}
		
		let clipPath = 'polygon('
		points.forEach((point, i) => {
			clipPath = clipPath +
				`calc(${point.x} * var(--square-size)) calc(${point.y} * var(--square-size))`
			
			if (i != points.length - 1) {
				clipPath += ','
			}
		})
		clipPath += ')'
		
		element.style.clipPath = clipPath
	}

	const setVisible = (isVisible: boolean, color: Color) => {
		const element = (color == Color.WHITE)
				? document.getElementById('white-clip-path')
				: document.getElementById('black-clip-path')

		if (!element) {
			return
		}

		element.classList.toggle('visible', isVisible)
	}

	const shakeScreen = async () => {
		document.body.classList.add('shake')
		await delay(300)
		document.body.classList.remove('shake')
	}

	/**
	 * This function animates a diagonal chess move.
	 * 
	 * @param move The board coordinates the player is moving from and to.
	 * Expects the given move to be a valid diagonal move already.
	 * @param color The player color taking the action.
	 */
	const animateDiagonal = async (move: PlayerAction, color: Color) => {
		/*
			Diagonals are shaped like stretched-out hexagons. We will define six
			points for the clip-path, working clock-wise around the shape to
			assign each vertex. The points lie on the chess board's grid, so we
			only have to keep track of their row/column position on the board
			(not any actual pixel values... yet).
		*/

		const points: Point[] = []

		/*
			Depending on the direction  of the movement, the resulting hexagon
			is either right-leaning or left-leaning. The difference is important,
			as it changes how the points are distributed around the shape. For
			right-leaning diagonals, the 3rd point (#2) sits on the upper-most
			square's bottom-right corner, & the 6th point (#5) sits on the lower
			square's top-left corner. As you can see, this is not the case for 
			left-leaning diagonals. The points are zero-indexed to make mapping
			to the array more clear.

            Right-leaning:    Left-leaning:

			     0 ---- 1     0 ---- 1
                /       |     |       \
			   /        |     |        \
			  /         2     5         \
			 /         /       \         \
			5         /         \         2
			|        /           \        |
			|       /             \       |
			4 ---- 3               4 ---- 3
		
			Any piece moving in a *positive* horizontal direction and *negative*
			vertical direction will create a right-leaning diagonal. As will any
			piece moving in a *negative* horizontal and *positive* vertical
			direction. However, if the directions are homogenous (both positive
			or both negative), we know it must be left-leaning. The actual
			direction the piece is moving along this diagonal doesn't matter.
		*/

		const verticalMovement = move.to[0] - move.from[0]
		const horizontalMovement = move.to[1] - move.from[1]
		const isRightLeaning = (
			(verticalMovement > 0 && horizontalMovement < 0) ||
			(verticalMovement < 0 && horizontalMovement > 0)
		)
		
		/*
			In order to animate out into this final shape properly, the starting
			position must be set up with this later arrangement in mind. We want
			the diagonal to grow smoothly out from the starting square. Thus, if
			we're right-leaning, we want to bisect the hexagon between points
			5-to-0 and 2-to-3. This collapses the hexagon into a square, but with
			doubled-up points on the corners that need to grow. For the left-
			leaning hexagons, bisect between points 4-to-5 and 1-to-2.

			Right-leaning:    Left-leaning:

			 0/5 --- 1          0 --- 1/2
			  |      |          |      |
			  |      |          |      |
			  4 --- 2/3        4/5 --- 3

			This really just effects where we draw points 2 and 5. All the other
			points are the same regardless: just draw the square from the initial
			position (the `move.from` coordinates will be the coordinates of the
			top-left corner of the square).
		*/

		points[0] = { x: move.from[1], y: move.from[0] }
		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[3] = { x: points[0].x + 1, y: points[0].y + 1 }
		points[4] = { x: points[0].x, y: points[0].y + 1 }

		points[2] = (isRightLeaning)
				? points[3]
				: points[1]

		points[5] = (isRightLeaning)
				? points[0]
				: points[4]

		/*
			Before committing these starting points to the clip-path, make sure
			to turn animations OFF. This will snap the shape into position
			immediately, rather than slowly animating from its previous state.
		*/

		setAnimation(false, color)
		setClipPath(points, color)
		setVisible(true, color)
		await delay(1) // wait a sec so the clip-path can be set before future
		               // steps turn animations on

		/*
			Now we can construct the full hexagon, referring back to those two
			diagrams above. We need to figure out which square (either the "from"
			or the "to") is the upper square, so that we know which coordinates
			to use for the 0-point. This can be found by checking which row-value
			is larger -- the smaller row-value is the upper square (since the
			grid goes from top-to-bottom). We will refer to the "to" position as
			the "destination".
		*/

		const destinationIsUpperSquare = (move.to[0] < move.from[0])

		points[0] = (destinationIsUpperSquare)
				? { x: move.to[1], y: move.to[0] }
				: { x: move.from[1], y: move.from[0] }

		/*
			Point-3 will be used as reference for all the other bottom square
			coordinates, similar to how point-0 is used for the upper square.
			Note that we must add 1 to the x and y values, since we are getting
			the top-left corner of the square (which may actually sit *inside*
			the hexagon), and we want the bottom-right corner.
		*/
		
		points[3] = (destinationIsUpperSquare)
				? { x: move.from[1] + 1, y: move.from[0] + 1 }
				: { x: move.to[1] + 1, y: move.to[0] + 1 }

		/*
			The remaining vertices can now be calculated off of those two
			reference points.
		*/

		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[4] = { x: points[3].x - 1, y: points[3].y }

		if (isRightLeaning) {
			points[2] = { x: points[0].x + 1, y: points[0].y + 1 }
			points[5] = { x: points[3].x - 1, y: points[3].y - 1 }
		}
		else {
			points[2] = { x: points[3].x, y: points[3].y - 1 }
			points[5] = { x: points[0].x, y: points[0].y + 1 }
		}

		/*
			Now we *do* want animations on, so the transition is smooth and...
			animated (duh).
		*/

		setAnimation(true, color)
		setClipPath(points, color)

		/*
			Once the animation into the full hexagon is complete, we want to
			shrink it back down to a square; this time, the destination square.
			We will follow the same process we used to find the starting square
			points and make sure they line-up with the full hexagon to ensure a
			fluid animation. However, this time using the "to" location.
		*/

		await delay(ANIMATION_DURATION)

		points[0] = { x: move.to[1], y: move.to[0] }
		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[3] = { x: points[0].x + 1, y: points[0].y + 1 }
		points[4] = { x: points[0].x, y: points[0].y + 1 }

		points[2] = (isRightLeaning)
				? points[3]
				: points[1]

		points[5] = (isRightLeaning)
				? points[0]
				: points[4]

		setAnimation(true, color, true)
		setClipPath(points, color)

		/*
			The function will return here. The animation into the full hexagon
			will be completed (we await-ed that one), but the animation into the
			destination square will still be on-going. This allows us to start
			doing other stuff while it animates out (like shake the screen and
			actually move the board pieces). The call-back below will fade the
			shape out once everything is complete.
		*/

		delay(ANIMATION_DURATION)
			.then(() => setVisible(false, color))
	}

	/**
	 * This function animates a horizontal chess move.
	 * 
	 * @param move The board coordinates the player is moving from and to.
	 * Expects the given move to be a valid horizontal move already.
	 * @param color The player color taking the action.
	 */
	const animateHorizontal = async (move: PlayerAction, color: Color) => {
		/*
			The process here is going to be, in broad stokes, the same as for
			diagonal movement. So feel free to read through that method to get
			a sense for how this works.
		*/
		
		const points: Point[] = []

		/*
			There is no special considerations we need to make for the starting
			shape (unlike w/ diagonals). Just collect the vertices of the square.
		*/

		points[0] = { x: move.from[1], y: move.from[0] }
		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[2] = { x: points[0].x + 1, y: points[0].y + 1 }
		points[3] = { x: points[0].x, y: points[0].y + 1 }

		setAnimation(false, color)
		setClipPath(points, color)
		setVisible(true, color)
		await delay(1)

		/*
			The "full shape" here is a rectangle, stretched from the left-most
			square to the right-most square.
		*/

		points[0] = {
			x: Math.min(move.from[1], move.to[1]), // take left-most
			y: move.from[0], // same as destination's row (since horizontal)
		}

		points[1] = {
			x: Math.max(move.from[1], move.to[1]) + 1, // take right-most
			y: move.from[0],
		}

		points[2] = { x: points[1].x, y: points[1].y + 1 }
		points[3] = { x: points[0].x, y: points[0].y + 1 }

		setAnimation(true, color)
		setClipPath(points, color)
		await delay(ANIMATION_DURATION)

		/*
			Set to destination square to finish.
		*/

		points[0] = { x: move.to[1], y: move.to[0] }
		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[2] = { x: points[0].x + 1, y: points[0].y + 1 }
		points[3] = { x: points[0].x, y: points[0].y + 1 }

		setAnimation(true, color, true)
		setClipPath(points, color)
		delay(ANIMATION_DURATION)
			.then(() => setVisible(false, color))
	}

	/**
	 * This function animates a horizontal chess move.
	 * 
	 * @param move The board coordinates the player is moving from and to.
	 * Expects the given move to be a valid horizontal move already.
	 * @param color The player color taking the action.
	 */
	const animateVertical = async (move: PlayerAction, color: Color) => {
				const points: Point[] = []

		/*
			There is no special considerations we need to make for the starting
			shape (unlike w/ diagonals). Just collect the vertices of the square.
		*/

		points[0] = { x: move.from[1], y: move.from[0] }
		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[2] = { x: points[0].x + 1, y: points[0].y + 1 }
		points[3] = { x: points[0].x, y: points[0].y + 1 }

		setAnimation(false, color)
		setClipPath(points, color)
		setVisible(true, color)
		await delay(1)

		/*
			The "full shape" here is a rectangle, stretched from the left-most
			square to the right-most square.
		*/

		points[0] = {
			x: move.from[1], // same as destination's column (since vertical)
			y: Math.min(move.from[0], move.to[0]), // take upper square (lower value)
		}

		points[3] = {
			x: move.from[1],
			y: Math.max(move.from[0], move.to[0]) + 1, // lowest square (higher value)
		}

		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[2] = { x: points[3].x + 1, y: points[3].y }

		setAnimation(true, color)
		setClipPath(points, color)
		await delay(ANIMATION_DURATION)

		/*
			Set to destination square to finish.
		*/

		points[0] = { x: move.to[1], y: move.to[0] }
		points[1] = { x: points[0].x + 1, y: points[0].y }
		points[2] = { x: points[0].x + 1, y: points[0].y + 1 }
		points[3] = { x: points[0].x, y: points[0].y + 1 }

		setAnimation(true, color, true)
		setClipPath(points, color)
		delay(ANIMATION_DURATION)
			.then(() => setVisible(false, color))
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