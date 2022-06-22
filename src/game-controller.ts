import type { ChessBoard, Color } from "./constants";

export interface GameState {
	currentColor: Color | false,
	board: ChessBoard,

}