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

export type Empty = {
	type?: undefined,
	color?: undefined,
}

export type ChessBoard = (Piece | Empty)[][]

export type PlayerAction = {
	from: [number, number],
	to: [number, number],
}

export interface Player {
	name: string,
	isManual?: boolean,
	move: (currentState: ChessBoard, colorToMove: Color) => PlayerAction,
}

export interface Bot extends Player {
	isManual?: undefined,
}

export const HumanPlayer: Player = {
	name: 'Human Player',
	isManual: true,
	move: (_currentState: ChessBoard, _colorToMove: Color): PlayerAction => {
		throw new Error('HumanPlayer does not actually have a move action.')
	},
}

export type Players = {
	[Color.WHITE]: Player,
	[Color.BLACK]: Player,
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

export const WithBishops: ChessBoard = [
	[
		{ color: Color.BLACK, type: Type.ROOK },
		{ color: Color.BLACK, type: Type.BISHOP },
		{ color: Color.BLACK, type: Type.QUEEN },
		{ color: Color.BLACK, type: Type.KING },
		{ color: Color.BLACK, type: Type.BISHOP },
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
		{ color: Color.WHITE, type: Type.BISHOP },
		{ color: Color.WHITE, type: Type.QUEEN },
		{ color: Color.WHITE, type: Type.KING },
		{ color: Color.WHITE, type: Type.BISHOP },
		{ color: Color.WHITE, type: Type.ROOK },
	],
]

export const FullSized: ChessBoard = [
	[
		{ color: Color.BLACK, type: Type.ROOK },
		{ color: Color.BLACK, type: Type.KNIGHT},
		{ color: Color.BLACK, type: Type.BISHOP },
		{ color: Color.BLACK, type: Type.QUEEN },
		{ color: Color.BLACK, type: Type.KING },
		{ color: Color.BLACK, type: Type.BISHOP },
		{ color: Color.BLACK, type: Type.KNIGHT},
		{ color: Color.BLACK, type: Type.ROOK },
	],
	[
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
		{ color: Color.BLACK, type: Type.PAWN },
	],
	[
		{}, {}, {}, {}, {}, {}, {}, {},
	],
	[
		{}, {}, {}, {}, {}, {}, {}, {},
	],
	[
		{}, {}, {}, {}, {}, {}, {}, {},
	],
	[
		{}, {}, {}, {}, {}, {}, {}, {},
	],
	[
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
		{ color: Color.WHITE, type: Type.PAWN },
	],
	[
		{ color: Color.WHITE, type: Type.ROOK },
		{ color: Color.WHITE, type: Type.KNIGHT},
		{ color: Color.WHITE, type: Type.BISHOP },
		{ color: Color.WHITE, type: Type.QUEEN },
		{ color: Color.WHITE, type: Type.KING },
		{ color: Color.WHITE, type: Type.BISHOP },
		{ color: Color.WHITE, type: Type.KNIGHT},
		{ color: Color.WHITE, type: Type.ROOK },
	],
]