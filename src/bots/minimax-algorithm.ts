import { Color, type ChessBoard, type PlayerAction } from '@/constants'
import { submitAction } from '@/game-controller'
import { isLegalMove } from '@/rules'

type Node = {
	gameState: string,
	score: number,
	children: NodeChildren | Unexplored,
}

type NodeChildren = {
	[Color.WHITE]: string[],
	[Color.BLACK]: string[],
	isUnexplored: false,
}

type Unexplored = {
	isUnexplored: true,
}

const NEGATIVE_INFINITY = -9999
const POSITIVE_INFINITY = 9999

export default class MiniMax {

	private nodes: Map<string, Node>
	private evaluationFunction: (gameState: ChessBoard) => number
	private maxDepth: number

	constructor() {
		this.nodes = new Map<string, Node>()
		this.evaluationFunction = (_gameState: ChessBoard) => 0
		this.maxDepth = 1
	}

	public setEvaluationFunction(newEvaluationFunction: (gameState: ChessBoard) => number) {
		this.evaluationFunction = newEvaluationFunction
	}

	public setMaxDepth(newMaxDepth: number) {
		this.maxDepth = newMaxDepth
	}

	public getBestMove(board: ChessBoard, colorToMove: Color): PlayerAction | undefined {
		type RankedMove = {
			move: PlayerAction,
			node: Node,
			rank: number,
		}

		const rankedMoves = this.getAllMovesForColor(board, colorToMove)
				.map((move: PlayerAction): RankedMove => {
					const node = this.generateNewNode(move, board)
					return {
						move, node,
						rank: this.getMinimaxRank(node, colorToMove),
					}
				})
				.sort((a, b) => b.rank - a.rank)

		if (rankedMoves.length == 0) {
			return undefined
		}

		console.log(rankedMoves)

		return rankedMoves[0].move
	}

	private getMinimaxRank(node: Node, currentColor: Color): number {
		return this.minimax(node, NEGATIVE_INFINITY, POSITIVE_INFINITY, false, this.otherColor(currentColor), this.maxDepth)
	}

	// https://en.wikipedia.org/wiki/Alpha–beta_pruning
	private minimax(node: Node, minCutoff: number, maxCutoff: number, takeMax: boolean, currentColor: Color, depth: number): number {
		if (depth == 0) {
			return node.score
		}

		let score = (takeMax) ? NEGATIVE_INFINITY : POSITIVE_INFINITY
		node.children = this.getAllChildren(node.gameState)
		
		if (takeMax) {
			for (const child of node.children[currentColor]) {
				score = Math.max(score, this.minimax(
					this.nodes.get(child)!, minCutoff, maxCutoff, !takeMax, this.otherColor(currentColor), depth - 1))

				if (score >= maxCutoff) {
					break
				}

				minCutoff = Math.max(minCutoff, score)
			}
		}
		else {
			for (const child of node.children[currentColor]) {
				score = Math.min(score, this.minimax(
					this.nodes.get(child)!, minCutoff, maxCutoff, !takeMax, this.otherColor(currentColor), depth - 1))

				if (score <= minCutoff) {
					break
				}

				maxCutoff = Math.min(maxCutoff, score)
			}
		}

		return score
	}

	private getAllChildren(gameState: string): NodeChildren {
		// get from node cache if we've seen this one before
		if (this.nodes.has(gameState)) {
			const node = this.nodes.get(gameState)!
			if (!node.children.isUnexplored) {
				return node.children
			}
		}

		const board = this.convertToChessboard(gameState)
		return this.generateAllPossibleFutures(board)
	}


	private convertToString(board: ChessBoard): string {
		return JSON.stringify(board)
	}

	private convertToChessboard(stringifiedBoard: string): ChessBoard {
		return JSON.parse(stringifiedBoard)
	}

	// TODO: could this be more efficient?
	private generateAllPossibleFutures(board: ChessBoard): NodeChildren
	{
		const whiteMoves: PlayerAction[] = []
		const blackMoves: PlayerAction[] = []

		for (let row = 0; row < board.length; row++) {
			for (let column = 0; column < board[0].length; column++) {
				if (board[row][column].color === Color.WHITE) {
					whiteMoves.push(...this.allLegalMoves(row, column, board))
				}
				else if (board[row][column].color === Color.BLACK) {
					blackMoves.push(...this.allLegalMoves(row, column, board))
				}
			}
		}

		const futures: NodeChildren = {
			isUnexplored: false,
			[Color.WHITE]: whiteMoves.map((move) => this.generateNewNode(move, board)).map((node) => node.gameState),
			[Color.BLACK]: blackMoves.map((move) => this.generateNewNode(move, board)).map((node) => node.gameState),
		}

		return futures
	}

	// TODO: could this be more efficient?
	private getAllMovesForColor(board: ChessBoard, colorToMove: Color): PlayerAction[] {
		const moves: PlayerAction[] = []

		for (let row = 0; row < board.length; row++) {
			for (let column = 0; column < board[0].length; column++) {
				if (board[row][column].color === colorToMove) {
					moves.push(...this.allLegalMoves(row, column, board))
				}
			}
		}

		return moves
	}

	// TODO: could this be more efficient?
	private allLegalMoves(fromRow: number, fromColumn: number, board: ChessBoard): PlayerAction[] {
		const legalMoves: PlayerAction[] = []

		for (let toRow = 0; toRow < board.length; toRow++) {
			for (let toColumn = 0; toColumn < board[0].length; toColumn++) {
				const hypotheticalMove: PlayerAction = {
					from: [fromRow, fromColumn],
					to: [toRow, toColumn],
				}

				if (isLegalMove(board, hypotheticalMove)) {
					legalMoves.push(hypotheticalMove)
				}
			}
		}

		return legalMoves
	}

	// TODO: could this be more efficient?
	private visualizeHypothetical(move: PlayerAction, board: ChessBoard): ChessBoard {
		return submitAction(board, board[move.from[0]][move.from[1]].color!, move).board
	}

	private generateNewNode(move: PlayerAction, board: ChessBoard): Node {
		
		const newBoardState = this.visualizeHypothetical(move, board)
		const gameState = this.convertToString(newBoardState)

		// pull from cache if we've seen this one before
		if (this.nodes.has(gameState)) {
			return this.nodes.get(gameState)!
		}

		const newNode: Node = {
			gameState: gameState,
			score: this.evaluationFunction(newBoardState),
			children: { isUnexplored: true }
		}

		this.nodes.set(gameState, newNode)
		return newNode
	}

	private otherColor(color: Color): Color {
		return (color === Color.WHITE)
				? Color.BLACK
				: Color.WHITE
	}
}