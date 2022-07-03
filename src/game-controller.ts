import { Color, Type, type ChessBoard, type PlayerAction } from "@/constants";
import { isOutOfBounds, otherColor, isLegalMove, isAtEndOfBoard } from "@/rules";

export interface GameState {
	board: ChessBoard
	currentColor: Color | false // false when game is over
	winner: Color | false // false if no winner
	lastMove: {
		piece: Piece,
		move: PlayerAction
		legal: boolean
		attack: boolean
	}
}

export function submitAction(existingBoard: ChessBoard, currentColor: Color, move: PlayerAction): GameState {

	// hack to deep-clone the board and color value
	const board = JSON.parse(JSON.stringify(existingBoard))
	const color = otherColor(otherColor(currentColor))

	const invalidSquareChosen = (isOutOfBounds(existingBoard, move) ||
			existingBoard[move.from[0]][move.from[1]].color != currentColor)

	if (invalidSquareChosen || !isLegalMove(existingBoard, move)) {

		if (!invalidSquareChosen) {
			board[move.from[0]][move.from[1]] = {}
		}

		// pieces moved invalidly are lost -- so check if that was just the king 
		const justKilledKing = (existingBoard[move.from[0]][move.from[1]].color == currentColor &&
			existingBoard[move.from[0]][move.from[1]].type == Type.KING)
		
		// player forfeits turn. no action is preformed if invalid square was
		// chosen. however, if an otherwise illegal move is taken, player looses
		// the piece. if player illegally moved their king, game has been won by
		// opponent.
		return {
			board: board,
			currentColor: justKilledKing ? false : otherColor(currentColor),
			winner: justKilledKing ? otherColor(currentColor) : false,
			lastMove: {
				move,
				legal: false,
				attack: false,
			}
		}
	}

	const movingPiece = {
		color: existingBoard[move.from[0]][move.from[1]].color,
		type: existingBoard[move.from[0]][move.from[1]].type,
	}

	if (movingPiece.type == Type.PAWN && isAtEndOfBoard(move.to[0], currentColor, board.length)) {
		// pawns that reach the end are turned into queens
		movingPiece.type = Type.QUEEN
	}

	const destination = existingBoard[move.to[0]][move.to[1]]
	const justWon = (destination.type == Type.KING)

	board[move.to[0]][move.to[1]] = movingPiece
	board[move.from[0]][move.from[1]] = {}

	return {
		board: board,
		currentColor: justWon ? false : otherColor(currentColor),
		winner: justWon ? color : false,
		lastMove: {
			piece: {
				type: movingPiece.type!,
				color: movingPiece.color!,
			},
			move,
			legal: true,
			attack: (destination.color != undefined),
		}
	}
}

