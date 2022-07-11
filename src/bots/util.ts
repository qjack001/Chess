import type { PlayerAction, ChessBoard, Color } from '@/constants'
import * as rules from '@/rules'

export enum by {
	HIGHEST_FIRST,
	LOWEST_FIRST,
}

export type AllLegalMovesProps = {
	sortBy: (move: PlayerAction, board: ChessBoard) => number,
	order: by,
}

export function allLegalMoves(currentState: ChessBoard, colorToMove: Color, props: AllLegalMovesProps): PlayerAction[] {
	const sortFunction = (a: PlayerAction, b: PlayerAction) => {
		if (props.sortBy(a, currentState) < props.sortBy(b, currentState)) {
			return (props.order == by.HIGHEST_FIRST) ? 1 : -1
		}

		return (props.order == by.LOWEST_FIRST) ? 1 : -1
	}
	
	const moves: PlayerAction[] = []

	currentState.forEach((row, rowNumber) => row.forEach((square, columnNumber) => {
		if (square.color == colorToMove) {
			moves.push(...legalMoves(rowNumber, columnNumber, currentState))
		}
	}))
	
	return moves.sort(sortFunction)
}

export function legalMoves(row: number, column: number, board: ChessBoard): PlayerAction[] {
	const legalMoves: PlayerAction[] = []

	for (let toRow = 0; toRow < board.length; toRow++) {
		for (let toColumn = 0; toColumn < board.length; toColumn++) {
			const hypotheticalMove: PlayerAction = {
				from: [row, column],
				to: [toRow, toColumn],
			}

			if (rules.isLegalMove(board, hypotheticalMove) && !rules.willBeInCheck(board, hypotheticalMove)) {
				legalMoves.push(hypotheticalMove)
			}
		}
	}

	return legalMoves
}

export function visualizeHypothetical(move: PlayerAction, board: ChessBoard): ChessBoard {
	// hack to deep-clone the board
	const newBoard: ChessBoard = JSON.parse(JSON.stringify(board))

	newBoard[move.to[0]][move.to[1]] = {...board[move.from[0]][move.from[1]]}
	newBoard[move.from[0]][move.from[1]] = {}

	return newBoard
}