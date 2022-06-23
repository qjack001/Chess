import type { ChessBoard, Color, Bot, PlayerAction } from '@/constants'
import { isLegalMove } from '@/rules'

/**
 * Monkey takes inspiration from the Infinite Monkey Theorem, picking moves at
 * random. Its chance of winning has been significantly increased by making sure
 * the move is at least legal. Even though it is one of the worst performing
 * bots that one could write, interestingly, it is likely the only bot here that
 * *could* beat Magnus Carlsen.
 */
export const Monkey: Bot = {
	name: 'Monkey',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		const boardSize = currentState.length
		const legalMoves: PlayerAction[] = []

		// cycles through every square, and checks if moving that square to each
		// other square is allowed. if so, add to the list of legal moves.
		currentState.forEach((row, rowNumber) => row.forEach((square, columnNumber) => {
			if (square.color === colorToMove) {
				for (let i = 0; i < boardSize; i++) {
					for (let j = 0; j < boardSize; j++) {
						const hypotheticalMove: PlayerAction = {
							from: [rowNumber, columnNumber],
							to: [i, j],
						}

						if (isLegalMove(currentState, hypotheticalMove)) {
							legalMoves.push(hypotheticalMove)
						}
					}
				}
			}
		}))

		if (legalMoves.length == 0) {
			// throw away turn if there are no legal moves to make
			return { from: [0, 0], to: [0, 0] }
		}

		return legalMoves[Math.floor(Math.random() * legalMoves.length)]
	},
}