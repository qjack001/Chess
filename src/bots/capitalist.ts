import { type ChessBoard, type Color, type Bot, type PlayerAction, type Piece, type Empty, Type } from '@/constants'
import * as rules from '@/rules'

/**
 * Capitalist is an individualist chess bot. It does not believe in state control.
 * The bot treats each chess piece as an individual actor, and asks them to make
 * their own decision -- unconcerned with the collective as a whole.
 * 
 * Each piece decides what move it wants to make based on:
 * 
 *		1. The "profit" it can make from its move (i.e. how
 * 		   valuable of a piece it can take).
 * 		2. The risk to its own life.
 * 		3. The potential profit it can make in future moves,
 * 		   as a result of that move.
 * 
 * The pieces do not consider the risk presented to other pieces on their team,
 * nor do they care to collaborate. You will never see this bot purposefully team-
 * up to checkmate or sacrifice a piece to save the king.
 * 
 * Each piece submits its best move, and bids for it with the profit it will make
 * from it; this is the profit of the move (the value of the piece it kills), plus
 * the potential future profits (reduced by 30% per step it takes to get there),
 * plus the risk-avoidance it gains from moving (a penny saved is a penny earned),
 * plus the pre-existing "wealth" the piece was born into (i.e. the value of the
 * piece making the bid). Each of these values are multiplied by weights to balance
 * the system. The most profitable move is selected.
 */
export const Capitalist: Bot = {
	name: 'Capitalist',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		const moveRequests: RankedMove[] = []

		// iterate over all my pieces and collect their desired move
		currentState.forEach((row, rowNumber) => row.forEach((square, columnNumber) => {
				if (square.color == colorToMove) {
					const request = evaluateIndividual(square, rowNumber, columnNumber, currentState)
					if (request.move != undefined) {
						moveRequests.push(request)
						console.debug(`${Type[square.type]} wants ${request.move.to} for $${request.profit}`)
					}
				}
			})
		)

		// either can't move or nobody wants to; throw away turn
		if (moveRequests.length == 0) {
			return { from: [0, 0], to: [0, 0] }
		}

		// make the move with the highest profit
		return moveRequests
			.sort(highestProfitFirst)
			.map(toStandardAction)
			[0] // take first
	},
}

type RankedMove = {
	move?: PlayerAction,
	profit: number,
}

// weights
const VALUE_OF_SELF = 1 // how much the system values the loss of life
const VALUE_OF_PROFIT = 1.5 // how much the system values immediate profit
const VALUE_OF_SPECULATIVE_PROFIT = 0.7 // how much the system values potential future profit
const VALUE_OF_IMPORTANCE = 0.3 // how much the system values status

const MAX_DEPTH = 3 // how many steps ahead the system can look

/**
 * Each piece is evaluated as an individual, considered for its potential to generate
 * profit, not benefit the bot is any deeper way.
 */
function evaluateIndividual(piece: Piece, row: number, column: number, board: ChessBoard): RankedMove {
	
	const desired = findMostProfitableMove(row, column, board, MAX_DEPTH)

	// the piece is allowed to claim the value of itself, if *not* moving could
	// result in the loss of its life.
	const risk = (pieceIsInDanger(row, column, board))
			? getRank(piece) * VALUE_OF_SELF
			: 0
	
	const profit = desired.profit * VALUE_OF_PROFIT
	const importance = getRank(piece) * VALUE_OF_IMPORTANCE

	return {
		move: desired.move,
		profit: (risk + profit) + importance,
	}
}


/**
 * Returns the ranking of the given piece. The rank is based on the piece's perceived
 * value and importance; pawns having the lowest (1) and kings having the highest (10).
 */
function getRank(piece: Piece): number {
	switch (piece.type) {
		case Type.PAWN:   return 1
		case Type.ROOK:   return 3
		case Type.KNIGHT: return 4
		case Type.BISHOP: return 5
		case Type.QUEEN:  return 8
		case Type.KING:   return 10
		default:          return 0
	}
}

/**
 * Takes the current chess board and a hypothetical move, and returns a board where
 * that move has been applied. Does not check move for legality.
 */
function visualizeHypothetical(move: PlayerAction, board: ChessBoard): ChessBoard {
	// hack to deep-clone the board
	const newBoard: ChessBoard = JSON.parse(JSON.stringify(board))

	newBoard[move.to[0]][move.to[1]] = {...board[move.from[0]][move.from[1]]}
	newBoard[move.from[0]][move.from[1]] = {}

	return newBoard
}

/**
 * Returns whether or not the piece at the given row/column is in danger (i.e. can
 * be killed by another piece). 
 */
function pieceIsInDanger(row: number, column: number, board: ChessBoard): boolean {
	// iterate over the entire board and see if any piece can legal move to the
	// given row/column (indicating it can attack)
	for (let fromRow = 0; fromRow < board.length; fromRow++) {
		for (let fromColumn = 0; fromColumn < board.length; fromColumn++) {
			const hypotheticalMove: PlayerAction = {
				from: [fromRow, fromColumn],
				to: [row, column],
			}

			if (rules.isLegalMove(board, hypotheticalMove)) {
				return true
			}
		}
	}

	return false // no piece could move to that location
}

/**
 * Returns all legal moves available to the piece at the given row/column.
 */
function legalMoves(row: number, column: number, board: ChessBoard): PlayerAction[] {
	const legalMoves: PlayerAction[] = []

	for (let toRow = 0; toRow < board.length; toRow++) {
		for (let toColumn = 0; toColumn < board.length; toColumn++) {
			const hypotheticalMove: PlayerAction = {
				from: [row, column],
				to: [toRow, toColumn],
			}

			if (rules.isLegalMove(board, hypotheticalMove)) {
				legalMoves.push(hypotheticalMove)
			}
		}
	}

	return legalMoves
}

/**
 * For the given piece (located at the provided row/column), find the most valuable
 * move it can make. This calls the function recursively to imagine possible futures
 * (up to the limit provided by the `depth` parameter). Note: this does not simulate
 * opponent moves -- it is bullish on things just going its way.
 */
function findMostProfitableMove(row: number, column: number, board: ChessBoard, depth: number): RankedMove {
	// base case (this is a recursive function)
	if (depth < 0) {
		return {
			move: undefined,
			profit: 0,
		}
	}

	const availableMoves = legalMoves(row, column, board) // consider all legal moves the piece can take
		.map((move: PlayerAction): RankedMove => { // rank each move on how important of a piece it kills (i.e. profit)
			const destination = board[move.to[0]][move.to[1]]
			
			return {
				move,
				profit: (destination.type != undefined)
					? getRank(destination)
					: 0 // no value if square is empty
			} 
		})
		.map((option: RankedMove): RankedMove => { // de-rank moves that put the piece in danger
			const { move } = option
			const piece = board[move!.from[0]][move!.from[1]]
			const valueOfSelf = (piece.type != undefined)
					? getRank(piece) * VALUE_OF_SELF
					: 0
			
			const afterMove = visualizeHypothetical(move!, board)
			const risk = (pieceIsInDanger(move!.to[0], move!.to[1], afterMove))
				? valueOfSelf
				: 0
			
			// keeps moves that have a greater profit-incentive than loss of life
			return {
				...option,
				profit: option.profit - risk
			}
		})
		.map((move: RankedMove): RankedMove => { // consider future moves' speculative profit
			const currentMove = move.move
			const nextBoard = visualizeHypothetical(currentMove!, board)

			// find the next most profitable move the piece could take after this one
			// note: this recursively calls this function 
			const nextMove = findMostProfitableMove(currentMove!.to[0], currentMove!.to[1], nextBoard, depth - 1)

			return {
				...move,
				profit: move.profit +
					(nextMove.profit * VALUE_OF_SPECULATIVE_PROFIT) // add potential gains to the value of this move
			}
		})

	if (availableMoves.length == 0) {
		return {
			move: undefined,
			profit: 0,
		}
	}

	return availableMoves
		.sort(highestProfitFirst)
		[0] // take first (highest profit option)
}

/**
 * Sorting function to order lists of RankedMoves by their profit.
 */
function highestProfitFirst(a: RankedMove, b: RankedMove): number {
	if (a.profit == b.profit) {
		return (Math.random() > 0.5) ? 1 : -1
	}
	else {
		return (a.profit < b.profit) ? 1 : -1
	}
}

/**
 * Converts a RankedMove into a standard PlayerAction.
 */
function toStandardAction(ranked: RankedMove): PlayerAction {
	return {
		from: ranked.move!.from,
		to: ranked.move!.to,
	}
}