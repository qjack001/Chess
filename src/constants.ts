export enum Type {
	KING,
	QUEEN,
	BISHOP,
	KNIGHT,
	ROOK,
	PAWN,
}

export enum Color {
	WHITE,
	BLACK,
}

export type Piece = {
	type: Type,
	color: Color,
}

export type Empty = {}

export type ChessBoard = (Piece | Empty)[][]

export type PlayerAction = {
	from: [number, number],
	to: [number, number],
}

export interface Player {
	name: string,
	move: (currentState: ChessBoard, colorToMove: Color) => PlayerAction,
}

export const StartingBoard: ChessBoard = [
	[
		{ color: Color.BLACK, type: Type.ROOK },
		{ color: Color.BLACK, type: Type.KNIGHT },
		{ color: Color.BLACK, type: Type.QUEEN },
		{ color: Color.BLACK, type: Type.KING },
		{ color: Color.BLACK, type: Type.KNIGHT },
		{ color: Color.BLACK, type: Type.ROOK },
	],
	[
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
	],
	[
		{}, {}, {}, {}, {}, {},
	],
	[
		{}, {}, {}, {}, {}, {},
	],
	[
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
	],
	[
		{ color: Color.WHITE, type: Type.ROOK },
		{ color: Color.WHITE, type: Type.KNIGHT },
		{ color: Color.WHITE, type: Type.QUEEN },
		{ color: Color.WHITE, type: Type.KING },
		{ color: Color.WHITE, type: Type.KNIGHT },
		{ color: Color.WHITE, type: Type.ROOK },
	],
]