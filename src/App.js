import React, { useEffect, useRef, useState } from 'react';
import { fromEvent, interval, Subject } from 'rxjs';
import { buffer, debounceTime, filter, map, takeUntil } from 'rxjs/operators';



function App() {

    const waitBtn = useRef(null); 

    const timerStream = interval(1000);

    const [isTimerStarted, setIsTimerStarted] = useState(false);
    
    const [isPause, setIsPause] = useState(false);

    const [time, setTime] = useState(0);

    

    useEffect(() => {
        const unSub = new Subject();
        timerStream
        .pipe(takeUntil(unSub))
        .subscribe(() => {
                if(isTimerStarted) setTime(prevTime => prevTime + 1000)
            });

        timerPause();

        return () => {
            unSub.next();
            unSub.complete();
        }
    })

    const startStopToggle = () => {
        if (isTimerStarted) {
            timerStop();

        } else {
            timerStart();
        };
    };

    const timerStart = () => {
        setIsTimerStarted(true);
    }

    const timerStop = () => {
        setIsTimerStarted(false);
        setTime(0);
        setIsPause(false);
    }

    const timerReset = () => {
        setTime(0);
        setIsTimerStarted(true);
        setIsPause(false);
    }

    const timerPause = () => {
        const onWaitClick = fromEvent(waitBtn.current, 'click');

        onWaitClick
            .pipe(
                buffer(onWaitClick.pipe(debounceTime(300))),
                map(click => click.length),
                filter(clickCount => clickCount === 2),)
            .subscribe(() => {
                setIsTimerStarted(false);
                setIsPause(true);
            });
    };

    const styles = {
        app: {
            position: 'absolute', 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        },
        buttons: {
            margin: '5px',
            minWidth: '100px'
        },
        display: {
            textAlign: 'center',
            fontSize: '20px',
            padding: '5px'
        }
    }

    return (
        <div style={styles.app}>
            <div style={styles.display}>{new Date(time).toISOString().slice(11, 19)}</div>
            <button className={
                isTimerStarted ? 
                "btn btn-danger" : 
                "btn btn-success"
            } 
                style={styles.buttons}
                onClick={() => startStopToggle()}
            >{
                isTimerStarted ? 
                    "Stop" : 
                    isPause ? "Resume" : "Start"
            }</button>
            <button className="btn btn-primary" 
                style={styles.buttons}
                ref={waitBtn}
                disabled={!isTimerStarted}
            >Wait</button>
            <button className="btn btn-warning"  
                style={styles.buttons}
                onClick={() => timerReset()}
                disabled={!isPause && !isTimerStarted}
            >Reset</button>
        </div>
    );
}

export default App;
