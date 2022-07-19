import { type ChessBoard, Color, type Bot, type PlayerAction, Type, type Piece, type Empty } from '@/constants'
import { allLegalMoves, by, visualizeHypothetical } from './util'

/**
 * Limiter is an implementation of Tom7's `min_oppt_moves` algorithm (see reference).
 * The bot chooses the move that leaves the other player with the fewest legal moves
 * available. As pointed out by Tom, the beauty of this strategy is that it is incredibly
 * easy to explain (and implement), and actually works fairly well.
 * Reference: http://tom7.org/chess/weak.pdf
 */
export const Limiter: Bot = {
	name: 'Limiter',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		const opponentColor = (colorToMove == Color.WHITE) ? Color.BLACK : Color.WHITE

		const moves = allLegalMoves(currentState, colorToMove, {
			// total legal moves opponent has after action is taken
			sortBy: (move, board) => {
				if (killsKing(move, board)) return -1 // no more moves forever
				const hypotheticalFuture = visualizeHypothetical(move, board)
				return allLegalMoves(hypotheticalFuture, opponentColor).length
			},
			order: by.LOWEST_FIRST
		})

		if (moves.length > 0) {
			return moves[0]
		}

		// or throw away turn if there are no moves to make
		return { from: [0, 0], to: [0, 0] }
	},
}

const killsKing = (move: PlayerAction, board: ChessBoard): boolean => {
	return (board[move.to[0]][move.to[1]].type == Type.KING)
}
