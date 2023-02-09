import React, { useEffect, useState } from 'react'

function Phase1() {
	return (
		<>
			<div>
				Welcome to spoodaweb! To start, create a new bud on the board by pressing <b>control-m</b>
			</div>
			<div>
				Buds can be dragged around by holding them with left-click.
			</div>
			<div>
				Hold down the mouse wheel and drag around to look around the board, or use the arrow keys.
			</div>
		</>
	)
}

function Phase2() {
	return (
		<>
			<div>
				<b>double click</b> a bud to edit it's contents.
			</div>
			<div>
				A bud represents a word and has a definition and other details which can be filled in using the
				fields. These are important for the testing function later.
			</div>
			<div>
				buds can also be given a category to give them different colours.
			</div>
		</>
	)
}

function Phase3() {
	return (
		<>
			<div>
				link buds together by selecting two and pressing <b>control-shift-L</b>.
			</div>
			<div>
				these links are called <b>silks</b>.
			</div>
			<div>
				To select multiple buds or silks, hold shift and click them.
			</div>
		</>
	)
}

function Phase4() {
	return (
		<>
			<div>
				If you're not sure about the keybinds, right click anything on the board to open up a menu.
			</div>
		</>
	)
}

function Phase5() {
	return (
		<>
			Turning on <b>autodrag</b> allows you to automatically create a new bud attached to bud A by dragging off of bud A with the mode on.
		</>
	)
}

const phaseArr = [
	<Phase1/>,
	<Phase2/>,
	<Phase3/>,
	<Phase4/>,
]

export function GetPhase({ phaseNo }) {
	return phaseArr[phaseNo]
}

export const getTotalPhases = () => {
	return phaseArr.length
}
