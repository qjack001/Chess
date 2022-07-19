import type { ChessBoard, Color, Bot, PlayerAction } from '@/constants'
import { Aggressor } from './aggressor'
import { Pacifist } from './pacifist'

/**
 * Gandhi is a bot inspired by the Civilization V "Nuclear Gandhi" AI (see:
 * https://en.wikipedia.org/wiki/Nuclear_Gandhi). This bug causes the -- usually
 * peaceful -- Gandhi to flip into a super aggressive role. This bot does something
 * similar: either choosing the Pacifist bot's move, or suddenly flipping into
 * the Aggressor bot's move.
 */
export const Gandhi: Bot = {
	name: 'Gandhi',
	move: (currentState: ChessBoard, colorToMove: Color): PlayerAction => {
		if (enraged(currentState)) {
			return Aggressor.move(currentState, colorToMove)
		}

		return Pacifist.move(currentState, colorToMove)
	},
}

/**
 * The mechanic for whether Gandhi is in "enraged" mode is whether there are an
 * even number of pieces in the back rank or not. There are a number of reasons
 * why I have selected this as the condition:
 * 
 *		1. It is unrelated enough to any real chess strategy as to appear like
 *		some sort of software bug (and keeping it "unpredictable").
 *		2. It *is* controllable (and thus, a mechanic you can use to your
 *		advantage) once you know it.
 *		3. It changes less often than just flipping a coin, allowing both modes
 *		to play out a series of moves before flipping over.
 *		4. Both the Pacifist and Aggressor will tend to move pieces out of the
 *		back rank (if black, or into it if white), helping it not get stuck in
 *		any one mode.
 *		5. Since it's the same rank regardless of if the bot is black or white,
 *		the strategy to beat it becomes slightly different depending on which side
 *		you're playing from.
 *		6. And because of the reason above: when Gandhi is matched against itself,
 *		both bots will flip into Pacifist/Aggressor mode at the same time.
 */
function enraged(currentState: ChessBoard): boolean {
	let piecesInBackRank = 0
	
	currentState[0].forEach((square) => {
		if (square.color != undefined) {
			piecesInBackRank++
		}
	})

	return (piecesInBackRank % 2 == 0)
}