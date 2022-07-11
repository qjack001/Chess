import { type PlayerAction, type ChessBoard, Type, Color, type Piece } from '@/constants'


/**
 * Determines if the provided move is allowed (given the current game state).
 * Note: this does not account for whether you are in check or putting yourself
 * into check. Use `isInCheck()` or `willBeInCheck()` for that.
 */
export function isLegalMove(currentState: ChessBoard, move: PlayerAction): boolean {

	if (isOutOfBounds(currentState, move)) {
		return false
	}

	const movingPiece = currentState[move.from[0]][move.from[1]]
	const destination = currentState[move.to[0]][move.to[1]]

	if (movingPiece.color == undefined) {
		// implies empty square -- you must move a piece
		return false
	}
	if (destination.color == movingPiece.color) {
		// you cannot eat your own pieces
		return false
	}
	if (movingPiece.type == Type.PAWN && !isAllowedPawnMove(currentState, move)) {
		return false
	}
	if (movingPiece.type == Type.ROOK && !isAllowedRookMove(move)) {
		return false
	}
	if (movingPiece.type == Type.KNIGHT && !isAllowedKnightMove(move)) {
		return false
	}
	if (movingPiece.type == Type.BISHOP && !isAllowedBishopMove(move)) {
		return false
	}
	if (movingPiece.type == Type.QUEEN && !isAllowedQueenMove(move)) {
		return false
	}
	if (movingPiece.type == Type.KING && !isAllowedKingMove(move)) {
		return false
	}
	if (movingPiece.type != Type.KNIGHT && piecesInbetween(move.from, move.to, currentState)) {
		// only knights can move over other pieces
		return false
	}

	return true
}

export function isOutOfBounds(board: ChessBoard, move: PlayerAction) {
	return (move == undefined || move.from == undefined || move.to == undefined ||
		move.from[0] == undefined || move.from[1] == undefined || 
		move.to[0] == undefined || move.to[1] == undefined ||
		move.from[0] < 0 || move.from[0] >= board.length ||
		move.from[1] < 0 || move.from[1] >= board.length ||
		move.to[0] < 0 || move.to[0] >= board.length ||
		move.to[1] < 0 || move.to[1] >= board.length)
}

/**
 * Simple utility to tell if there are pieces inbetween a start and a finish
 * coordinate. This excludes the starting and ending spot, just checking in-between
 * the two.
 * 
 * @param start the coordinates to start on in [row, column] format
 * @param end the coordinates to finish on in [row, column] format
 * @param currentState 
 */
export function piecesInbetween(start: [number, number], end: [number, number], currentState: ChessBoard): boolean {
	// horizontal moves
	if (start[0] - end[0] == 0) {
		const inbetween = range(start[1], end[1]).map((column, index, range) => {
			if (currentState[start[0]][column].type  == undefined ||
				index == 0 || index == range.length - 1) // exclude first/last; just look between
			{
				return false
			}
			return true
		})

		return inbetween.includes(true)
	}

	// vertical move
	if (start[1] - end[1] == 0) {
		const inbetween = range(start[0], end[0]).map((row, index, range) => {
			if (currentState[row][start[1]].type == undefined ||
				index == 0 || index == range.length - 1)
			{
				return false
			}
			return true
		})

		return inbetween.includes(true)
	}

	// diagonal movement
	if (Math.abs(start[0] - end[0]) == Math.abs(start[1] - end[1])) {
		const verticalMovement = range(start[0], end[0])
		const horizontalMovement = range(start[1], end[1])
		const inbetween = verticalMovement.map((row, index, range) => {
			if (currentState[row][horizontalMovement[index]].type == undefined ||
				index == 0 || index == range.length - 1)
			{
				return false
			}
			return true
		})

		return inbetween.includes(true)
	}

	// the only type of move that is not vertical, horizontal, or diagonal is
	// the L-shaped move the knight makes (which doesn't care that there are
	// pieces in-between).
	return false
}

/**
 * Checks if player (based on who is moving) will be in check after the move is
 * complete. Note: expects a valid PlayerAction (use `isLegalMove()` for that).
 */
export function willBeInCheck(currentState: ChessBoard, move: PlayerAction): boolean {
	const movingPiece = {
		type: currentState[move.from[0]][move.from[1]].type,
		color: currentState[move.from[0]][move.from[1]].color,
	}

	// exit early on invalid moves
	if (movingPiece.color == undefined) {
		return true
	}

	// hack to deep-clone the board
	const hypotheticalState = JSON.parse(JSON.stringify(currentState))

	hypotheticalState[move.to[0]][move.to[1]] = movingPiece
	hypotheticalState[move.from[0]][move.from[1]] = {}

	return isInCheck(movingPiece.color, hypotheticalState)
}

/**
 * Simply utility to determine if the given player is in check.
 * 
 * @param currentColor which player to check
 * @param currentState the game board
 */
export function isInCheck(currentColor: Color, currentState: ChessBoard): boolean {
	const opposingColor = otherColor(currentColor)

	let kingsRow = 0
	let kingsColumn = 0

	// finds the currentColor's king on the board
	currentState.forEach((row, rowNumber) => row.forEach((square, columnNumber) => {
		if (square.type == Type.KING && square.color == currentColor) {
			kingsRow = rowNumber
			kingsColumn = columnNumber
			return
		}
	}))

	let inCheck = false
	currentState.forEach((row, rowNumber) => row.forEach((square, columnNumber) => {
		if (square.color == opposingColor) {
			
			// for each of the opposing players pieces, checks if they can
			// legally move to the location of the king (in which case, yes,
			// you are in check).
			if (isLegalMove(currentState, {
				from: [rowNumber, columnNumber],
				to: [kingsRow, kingsColumn]
			})) {
				inCheck = true
				return
			}
		}
	}))

	return inCheck
}

/**
 * Determine if the given move is allowed for a pawn. Does not test the legality
 * of the action, whether it's within the board boundaries, or anything like that.
 * Just whether the movement described matches the expected pattern for pawns.
 * 
 * Pawns can move forward (up the board for White, down the board for Black) by
 * one square, and attack on a forward-diagonal.
 */
export function isAllowedPawnMove(currentState: ChessBoard, move: PlayerAction): boolean {
	const movingPiece = currentState[move.from[0]][move.from[1]]
	const destination = currentState[move.to[0]][move.to[1]]

	const expectedVerticalMovement = (movingPiece.color == Color.WHITE)
			? -1 // white moves *up* the board
			: 1 
	
	const expectedHorizontalMovement = (destination.type != undefined)
			? 1 // must attack from diagonal
			: 0 // otherwise, must be moving straight forward

	const verticalMovement = move.to[0] - move.from[0]
	const horizontalMovement = Math.abs(move.to[1] - move.from[1])

	return (verticalMovement == expectedVerticalMovement &&
		horizontalMovement == expectedHorizontalMovement)
}

/**
 * Determine if the given move is allowed for a rook. Does not test the legality
 * of the action, whether it's within the board boundaries, or anything like that.
 * Just whether the movement described matches the expected pattern for rooks.
 * 
 * Rooks can move vertically or horizontally in straight lines.
 */
export function isAllowedRookMove(move: PlayerAction): boolean {
	const verticalMovement = move.to[0] - move.from[0]
	const horizontalMovement = move.to[1] - move.from[1]

	// the rook must move straight vertically, or straight horizontally
	return (verticalMovement == 0 || horizontalMovement == 0)
}

/**
 * Determine if the given move is allowed for a knight. Does not test the legality
 * of the action, whether it's within the board boundaries, or anything like that.
 * Just whether the movement described matches the expected pattern for knights.
 * 
 * Knights can move in an L-shaped pattern; two squares in one direction, one square
 * in the other.
 */
export function isAllowedKnightMove(move: PlayerAction): boolean {
	const verticalMovement = Math.abs(move.to[0] - move.from[0])
	const horizontalMovement = Math.abs(move.to[1] - move.from[1])

	// accept any orientation of the L-shape
	return ((verticalMovement == 1 && horizontalMovement == 2) ||
		(verticalMovement == 2 && horizontalMovement == 1))
}

/**
 * Determine if the given move is allowed for a bishop. Does not test the legality
 * of the action, whether it's within the board boundaries, or anything like that.
 * Just whether the movement described matches the expected pattern for bishops.
 * 
 * Bishops can move in a diagonal path.
 */
export function isAllowedBishopMove(move: PlayerAction): boolean {
	const verticalMovement = Math.abs(move.to[0] - move.from[0])
	const horizontalMovement = Math.abs(move.to[1] - move.from[1])

	// diagonals exist when the vertical movement is the same as the
	// horizontal movement
	return (verticalMovement == horizontalMovement)
}

/**
 * Determine if the given move is allowed for a queen. Does not test the legality
 * of the action, whether it's within the board boundaries, or anything like that.
 * Just whether the movement described matches the expected pattern for queens.
 * 
 * Queens can move in a diagonal path, a straight vertical path, or a straight
 * horizontal path.
 */
export function isAllowedQueenMove(move: PlayerAction): boolean {
	const verticalMovement = Math.abs(move.to[0] - move.from[0])
	const horizontalMovement = Math.abs(move.to[1] - move.from[1])

	return (verticalMovement == 0 || horizontalMovement == 0 || verticalMovement == horizontalMovement)
}

/**
 * Determine if the given move is allowed for a king. Does not test the legality
 * of the action, whether it's within the board boundaries, or anything like that.
 * Just whether the movement described matches the expected pattern for kings.
 * 
 * Kings can move in any direction, by one square.
 */
export function isAllowedKingMove(move: PlayerAction): boolean {
	const verticalMovement = Math.abs(move.to[0] - move.from[0])
	const horizontalMovement = Math.abs(move.to[1] - move.from[1])

	return (verticalMovement <= 1 && horizontalMovement <= 1)
}

/**
 * Whether or not the given row is at the end of the board for the given color.
 */
export function isAtEndOfBoard(destinationRow: number, currentColor: Color, boardLength: number) {
	return ((currentColor == Color.WHITE && destinationRow == 0) ||
		(currentColor == Color.BLACK && destinationRow == boardLength - 1))
}

/**
 * Simple utility function to get the other color than the one given.
 */
export function otherColor(input: Color): Color {
	return (input == Color.WHITE)
			? Color.BLACK
			: Color.WHITE
}

/**
 * Returns a string representation of the given action in "algebraic notation".
 * See: https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
 */
export function toStandardChessNotation(piece: Piece, move: PlayerAction): string {
	
	const renderPiece = (piece: Piece) => {
		switch (piece.type) {
			case Type.KING:   return '♚'
			case Type.QUEEN:  return '♛'
			case Type.BISHOP: return '♝'
			case Type.KNIGHT: return '♞'
			case Type.ROOK:   return '♜'
			default:          return '' // pawns do not receive a symbol
		}
	}

	const renderCoordinates = (coordinates: [number, number]) => {
		const x = String.fromCharCode(97 + coordinates[1])
		const y = 6 - coordinates[0]
		return `${x}${y}`
	}

	return `${renderPiece(piece)}${renderCoordinates(move.from)}${renderCoordinates(move.to)}`
}

/**
 * Utility function to generate a list of numbers in order. For example:
 * ```
 * range(12, 6) => [12, 11, 10, 9 , 8, 7, 6]
 * ```
 */
function range(start: number, end: number): number[] {
	const allNumbersBetween = Array(Math.max(start, end) - Math.min(start, end) + 1).fill(0)
		.map((_, index) => Math.min(start, end) + index)

	return (start > end)
			? allNumbersBetween.reverse()
			: allNumbersBetween
}