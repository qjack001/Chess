import { type ChessBoard, type Color, type Bot, type PlayerAction, type Piece, Type } from '@/constants'
import { allLegalMoves, by } from './util'
import * as rules from '@/rules'

/**
 *
 */
export const VinDiesel: Bot = {
	name: 'Vin Diesel',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		
		const moves = allLegalMoves(currentState, colorToMove, {
			sortBy: howProtected,
			order: by.HIGHEST_FIRST
		})

		if (moves.length > 0) {
			return moves[0]
		}

		return { from: [0, 0], to: [0, 0] } // throw away turn if there are no moves to make
	},
}

const VALUE_OF_HAVING_EACH_OTHERS_BACK = 1
const VALUE_OF_STAYING_OUT_OF_HARMS_WAY = 3

function howProtected(move: PlayerAction, board: ChessBoard): number {

	if (board[move.to[0]][move.to[1]].type == Type.KING) {
		return 9999
	}

	const currentColor = board[move.from[0]][move.from[1]].color
	const tragedy = visualizePiecesDeath(move, board)

	let piecesThatThreaten = 0
	let piecesThatCanAvenge = 0
	const diminishingReturns = 0.5
	
	for (let fromRow = 0; fromRow < board.length; fromRow++) {
		for (let fromColumn = 0; fromColumn < board[0].length; fromColumn++) {
		
			const hypotheticalMove: PlayerAction = {
				from: [fromRow, fromColumn],
				to: [move.to[0], move.to[1]],
			}

			
			if (rules.isLegalMove(tragedy, hypotheticalMove) &&
				!rules.willBeInCheck(tragedy, hypotheticalMove)) {
				
				if (tragedy[fromRow][fromColumn].color != currentColor) {
					piecesThatThreaten = 1 + (piecesThatThreaten * diminishingReturns)
				}
				else {
					piecesThatCanAvenge = 1 + (piecesThatCanAvenge * diminishingReturns)
				}
			}
		}
	}

	return (piecesThatCanAvenge * VALUE_OF_HAVING_EACH_OTHERS_BACK)
		- (piecesThatThreaten * VALUE_OF_STAYING_OUT_OF_HARMS_WAY)
}

function visualizePiecesDeath(move: PlayerAction, board: ChessBoard): ChessBoard {
	// hack to deep-clone the board
	const newBoard: ChessBoard = JSON.parse(JSON.stringify(board))
	newBoard[move.from[0]][move.from[1]] = {}

	return newBoard
}

function getRank(piece: Piece): number {
	switch (piece.type) {
		case Type.PAWN:   return 1
		case Type.ROOK:   return 5
		case Type.KNIGHT: return 3
		case Type.BISHOP: return 3
		case Type.QUEEN:  return 9
		case Type.KING:   return 10
		default:          return 0
	}
}
