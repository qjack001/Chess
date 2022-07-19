import { type ChessBoard, Color, type Bot, type PlayerAction, Type, type Piece, type Empty } from '@/constants'
import { allLegalMoves, by } from './util'

/**
 * Pacifist is an inevitable choice: a bot that never attacks. This isn't strictly
 * true, since it will attack if it is the only move it has or if it has no other
 * way out of check. However, it makes up for this by offering its highest value
 * pieces up near the front. This shows its commitment to not engaging with senseless
 * violence.
 */
export const Pacifist: Bot = {
	name: 'Pacifist',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		
		const moves = allLegalMoves(currentState, colorToMove, {
			sortBy: highRankingForward,
			order: by.HIGHEST_FIRST
		})

		if (moves.length > 0) {
			return moves[0]
		}

		// or throw away turn if there are no moves to make
		return { from: [0, 0], to: [0, 0] }
	},
}

function highRankingForward(move: PlayerAction, board: ChessBoard): number {

	// In the case of an attack: rank last. Pacifist does not wish to engage in violence
	if (board[move.to[0]][move.to[1]].type != undefined) {
		return -1
	}
	
	const movingPiece = board[move.from[0]][move.from[1]]
	const currentColor = movingPiece.color!
	const valueOfPiece = getRank(movingPiece)

	// Avoid moving backwards (retreating) if you can help it
	if ((currentColor == Color.WHITE && move.to[0] > move.from[0])
		|| (currentColor == Color.BLACK && move.to[0] < move.from[0])) {
		
		return 0 // better than attacking tho
	}

	const distanceForward = (currentColor == Color.WHITE)
			? move.from[0] - move.to[0]
			: move.to[0] - move.from[0]
	
	
	return valueOfPiece * distanceForward
}

/**
 * Returns ranking of how much Pacifist wants to move the given piece. Moving
 * higher ranking pieces out in front and up the board is a sign of respect.
 */
function getRank(piece: Piece | Empty): number {
	switch (piece.type) {
		case Type.PAWN:   return 1
		case Type.ROOK:   return 5
		case Type.KNIGHT: return 3
		case Type.BISHOP: return 7
		case Type.QUEEN:  return 9
		case Type.KING:   return 0 // don't move the king tho
		default:          return 0
	}
}