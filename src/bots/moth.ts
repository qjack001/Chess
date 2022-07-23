import { type ChessBoard, type Color, type Bot, type PlayerAction, Type } from '@/constants'
import { allLegalMoves, by, visualizeHypothetical } from './util'

/**
 * Moth is drawn to the light. The light in this case is the opponent's king. The
 * bot selects the move that leaves the smallest total distance between all of its
 * pieces and the opponent's king.
 */
export const Moth: Bot = {
	name: 'Moth',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		
		const moves = allLegalMoves(currentState, colorToMove, {
			sortBy: distanceFromOpponentsKing,
			order: by.LOWEST_FIRST
		})

		if (moves.length > 0) {
			return moves[0]
		}

		// throw away turn if there are no moves to make
		return { from: [0, 0], to: [0, 0] }
	},
}

function distanceFromOpponentsKing(move: PlayerAction, board: ChessBoard): number {

	const currentColor = board[move.from[0]][move.from[1]].color!
	const hypothetical = visualizeHypothetical(move, board)
	const kingsPosition = findOpponentsKing(currentColor, hypothetical)
	let totalDistance = 0

	for (let row = 0; row < board.length; row++) {
		for (let column = 0; column < board[0].length; column++) {
			if (hypothetical[row][column].color == currentColor) {
				totalDistance += distanceBetween(row, column, kingsPosition)
			}
		}
	}

	return totalDistance
}

function distanceBetween(row: number, column: number, coordinate: [number, number]): number {
	const verticalMovement = Math.abs(row - coordinate[0])
	const horizontalMovement = Math.abs(column - coordinate[1])
	return Math.max(verticalMovement, horizontalMovement)
}

function findOpponentsKing(currentColor: Color, board: ChessBoard): [number, number] {
	
	for (let row = 0; row < board.length; row++) {
		for (let column = 0; column < board[0].length; column++) {
			if (board[row][column].type == Type.KING && board[row][column].color != currentColor) {
				return [row, column]
			}
		}
	}

	return [0, 0]
}