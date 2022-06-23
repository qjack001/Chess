import type { ChessBoard, Color, Bot, PlayerAction } from '@/constants'
import * as rules from '@/rules'

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
		const legalMoves: PlayerAction[] = []

		currentState.forEach((row, rowNumber) => row.forEach((square, columnNumber) => {
			if (square.color === colorToMove) {
				legalMoves.push(...allLegalMoves(rowNumber, columnNumber, currentState))
			}
		}))

		if (legalMoves.length == 0) {
			// throw away turn if there are no legal moves to make
			return { from: [0, 0], to: [0, 0] }
		}

		return legalMoves[Math.floor(Math.random() * legalMoves.length)]
	},
}

function allLegalMoves(fromRow: number, fromColumn: number, board: ChessBoard): PlayerAction[] {
	const legalMoves: PlayerAction[] = []

	for (let toRow = 0; toRow < board.length; toRow++) {
		for (let toColumn = 0; toColumn < board.length; toColumn++) {
			const hypotheticalMove: PlayerAction = {
				from: [fromRow, fromColumn],
				to: [toRow, toColumn],
			}

			if (rules.isLegalMove(board, hypotheticalMove)) {
				legalMoves.push(hypotheticalMove)
			}
		}
	}

	return legalMoves
}