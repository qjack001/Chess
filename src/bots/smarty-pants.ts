import { type ChessBoard, Color, type PlayerAction, type Bot, type Piece, type Empty, Type } from '@/constants'
import Minimax from './minimax-algorithm'

const minimax = new Minimax()

/**
 * SmartyPants is actually programmed the way chess bots are supposed to be programmed.
 */
export const SmartyPants: Bot = {
	name: 'SmartyPants',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		
		minimax.setMaxDepth(4)
		minimax.setEvaluationFunction(pointsOnBoard(colorToMove))
		
		const move = minimax.getBestMove(currentState, colorToMove)

		if (!move) {
			return { from: [0,0], to: [0,0] }
		}

		return move
	},
}

function pointsOnBoard(forColor: Color): (board: ChessBoard) => number {
	return (board: ChessBoard) => {
		var totalEvaluation = 0;
		for (let row = 0; row < board.length; row++) {
			for (let col = 0; col < board.length; col++) {
				const color = board[row][col].color
				if (color === forColor) {
					totalEvaluation = totalEvaluation + getPieceValue(board[row][col])
				}
				else {
					totalEvaluation = totalEvaluation - getPieceValue(board[row][col])
				}
			}
		}

		return totalEvaluation
	}
}

function getPieceValue(piece: Piece | Empty) {
    if (piece.type === undefined) {
        return 0
    }

	switch (piece.type) {
		case Type.PAWN: return 10
		case Type.ROOK: return 50
		case Type.KNIGHT: return 30
		case Type.BISHOP: return 30
		case Type.QUEEN: return 90
		case Type.KING: return 900
		default: return 0
	}
}
