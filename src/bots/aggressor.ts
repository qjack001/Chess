import { type ChessBoard, Color, type Bot, type PlayerAction, Type } from '@/constants'
import { isInCheck } from '@/rules'
import { allLegalMoves, by, visualizeHypothetical } from './util'

/**
 * Aggressor is roided-up and mad. Plays aggressively (as the name would suggest),
 * but not intelligently. Tries to find the shortest path to check, not considering
 * the loss of its own pieces. In fact, it doesn't even consider the other player's
 * moves at all.
 * 
 * TODO: make more efficient.
 */
export const Aggressor: Bot = {
	name: 'Aggressor',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		
		const maxDepth = 3
		const moves = allLegalMoves(currentState, colorToMove, {
			sortBy: (move, board) => movesUntilCheck(move, board, maxDepth),
			order: by.LOWEST_FIRST
		})

		if (moves.length > 0) {
			return moves[0]
		}

		// or throw away turn if there are no moves to make
		return { from: [0, 0], to: [0, 0] }
	},
}


const BIG_NUMBER = 82 // this seems big enough. i cant even think of anything bigger


const killsKing = (move: PlayerAction, board: ChessBoard): boolean => {
	return (board[move.to[0]][move.to[1]].type == Type.KING)
}

function movesUntilCheck(move: PlayerAction, board: ChessBoard, maxDepth: number): number {
	const myColor = getMyColor(move, board)
	const opponentColor = getOpponentColor(move, board)

	if (killsKing(move, board)) {
		return -1 // we've already reached checkmate, now we're finishing the job
	}

	if (isInCheck(opponentColor, board)) {
		return 0 // we found it!
	}

	if (maxDepth <= 0) {
		return BIG_NUMBER // we hit the end of the road, assume infinite moves to mate
	}


	const hypotheticalFuture = visualizeHypothetical(move, board)
	const moves = allLegalMoves(hypotheticalFuture, myColor)
		.map((move) => movesUntilCheck(move, hypotheticalFuture, maxDepth - 1))
		.sort()

	return 1 + moves[0]
}

function getMyColor(move: PlayerAction, board: ChessBoard): Color {
	return board[move.from[0]][move.from[1]].color!
}

function getOpponentColor(move: PlayerAction, board: ChessBoard): Color {
	return board[move.from[0]][move.from[1]].color == Color.WHITE
			? Color.BLACK
			: Color.WHITE
}