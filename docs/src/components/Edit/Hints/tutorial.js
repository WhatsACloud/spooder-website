import React, { useState, useEffect } from 'react'
import { GetPhase, getTotalPhases } from "./tutorialPhases.js"
import styles from './tutorial.scss'
import { BackgroundClickDetector } from '../../BackgroundClickDetector'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

function Button({ onclick, fa }) {
	return (
		<div className={styles.button} onClick={onclick}>
			<FontAwesomeIcon icon={fa} className={styles.iconButton}/>
		</div>
	)
}

function DisplayOutOf({ currentNo, maxNo }) {
	return (
		<div className={styles.whichPhaseDisplay}>
			{`${currentNo}/${maxNo}`}
		</div>
	)
}

const totalPhases = getTotalPhases()

// handles the visual outside frame of the tutorial screen
function TutorialVisualWrapper({ children, phaseNo, setPhaseNo, opened, setOpened }) {
	const incrementPhaseNo = () => {
		console.log("what")
		setPhaseNo(phaseNo+1)
	}
	const decrementPhaseNo = () => {
		setPhaseNo(phaseNo-1)
	}
	return (
		<>
			<BackgroundClickDetector
				on={opened}
				blur={true}
				mousedown={() => setOpened(false)}
				zIndex={9}
				/>
			<div style={{ display: opened ? "inherit" : "none" }} className={styles.tutorialWrapper}>
				<div style={{ position: "absolute" }}>
					{children}
				</div>
				<div className={styles.bottomPart}>
					<div className={styles.selectPhaseWrapper}>
						{phaseNo !== 0 ? <Button onclick={decrementPhaseNo} fa={faArrowLeft}/> : null}
						<DisplayOutOf currentNo={phaseNo+1} maxNo={totalPhases}/>
						{(phaseNo+1) !== totalPhases ? <Button onclick={incrementPhaseNo} fa={faArrowRight}/> : null}
					</div>
				</div>
			</div>
		</>
	)
}

// handles which phase is rendered
function Tutorial({ opened, setOpened }) {
	const [ phaseNo, setPhaseNo ] = useState(0) // starts from 0
	const [ rendered, setRendered ] = useState()
	useEffect(() => {
		setRendered(<GetPhase phaseNo={phaseNo}/>)
	}, [ phaseNo ])
	return (
		<TutorialVisualWrapper phaseNo={phaseNo} setPhaseNo={setPhaseNo} opened={opened} setOpened={setOpened}>
			{rendered}
		</TutorialVisualWrapper>
	)
}

function TutorialQuestionMark({ setOpened }) {
	return (
		<div
			className={styles.questionCircleWrapper}
			onClick={() => setOpened(true)}
			>
			<FontAwesomeIcon icon={faQuestionCircle} className={styles.questionCircle}/>
		</div>
	)
}

export function TutorialWrapper() {
	const [ opened, setOpened ] = useState(false)
	useEffect(() => {
		setTimeout(() => {
			setOpened(true)
		}, 2000)
	}, [])
	return (
		<>
			<TutorialQuestionMark setOpened={setOpened}/>
			<Tutorial opened={opened} setOpened={setOpened}/>
		</>
	)
}
